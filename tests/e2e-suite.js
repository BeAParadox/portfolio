const http = require('http');
const { spawn, execSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'portfolio.db');
const TEST_PORT = 3055;
const BASE = `http://127.0.0.1:${TEST_PORT}`;

function request(method, reqPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { ...headers }
    };

    let payload = null;
    if (body) {
      payload = typeof body === 'string' ? body : JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          json: () => {
            try { return JSON.parse(data); } catch { return null; }
          }
        });
      });
    });

    req.setTimeout(2500, () => {
      req.destroy(new Error('Request timeout'));
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

function killProcessTree(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${pid} /T /F >nul 2>&1`);
    } else {
      process.kill(-pid, 'SIGKILL');
    }
  } catch {
    // Process may have already exited
  }
}

(async () => {
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  console.log('====================================================');
  console.log('  FULL-STACK AUTOMATED TEST SUITE');
  console.log('  Database, APIs, Authentication, Edge Middleware & CRUD');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // SUITE 1: SQLite Database Engine & Cryptography
  // ----------------------------------------------------
  console.log('--- SUITE 1: SQLite Native Engine & Security Storage ---');
  let db;
  try {
    db = new DatabaseSync(DB_PATH);
    // Ensure clean state before running
    db.prepare("DELETE FROM inquiries WHERE email LIKE '%novatech%' OR email LIKE '%skynet%'").run();
    db.prepare("DELETE FROM projects WHERE title LIKE '%Automated%'").run();
    db.prepare("DELETE FROM testimonials WHERE name = 'Marcus Vance'").run();

    const walCheck = db.prepare('PRAGMA journal_mode;').get();
    assert(walCheck.journal_mode === 'wal', 'Database journal mode is WAL (Write-Ahead Logging)', `got ${walCheck.journal_mode}`);

    const fkCheck = db.prepare('PRAGMA foreign_keys;').get();
    assert(fkCheck.foreign_keys === 1, 'Database foreign key enforcement is active (1)', `got ${fkCheck.foreign_keys}`);

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(t => t.name);
    const expectedTables = ['profiles', 'projects', 'services', 'process_steps', 'testimonials', 'inquiries', 'admins'];
    const allTablesPresent = expectedTables.every(t => tables.includes(t));
    assert(allTablesPresent, `All 7 tables exist (${expectedTables.join(', ')})`, `found: ${tables.join(', ')}`);

    // Verify Admin scrypt record
    const adminRecord = db.prepare('SELECT id, username, password_hash, salt FROM admins LIMIT 1').get();
    assert(!!adminRecord && adminRecord.username === 'admin', 'Default admin account exists in database');
    assert(!!adminRecord.salt && adminRecord.salt.length === 32, 'Admin salt is cryptographically random 16-byte hex');
    assert(!!adminRecord.password_hash && adminRecord.password_hash.length === 128, 'Admin password hash is 64-byte scrypt hex');

    // Mathematically verify scrypt derivation with test password 'admin123'
    const computedHash = crypto.scryptSync('admin123', adminRecord.salt, 64).toString('hex');
    assert(computedHash === adminRecord.password_hash, 'Password scrypt hash mathematically matches admin123');

    // Verify count of seed data
    const projCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    assert(projCount >= 6, `Projects table populated with seed data (${projCount} records)`);

    const servCount = db.prepare('SELECT COUNT(*) as count FROM services').get().count;
    assert(servCount === 4, `Services table populated (${servCount} records)`);

    const procCount = db.prepare('SELECT COUNT(*) as count FROM process_steps').get().count;
    assert(procCount === 4, `Process steps table populated (${procCount} records)`);

    const testCount = db.prepare('SELECT COUNT(*) as count FROM testimonials').get().count;
    assert(testCount >= 3, `Testimonials table populated (${testCount} records)`);

  } catch (err) {
    console.error('Database suite error:', err);
    failed++;
  }

  // ----------------------------------------------------
  // Start Dev Server on isolated port for HTTP E2E tests
  // ----------------------------------------------------
  console.log(`\n🚀 Launching Next.js server on port ${TEST_PORT}...`);
  const projectRoot = path.join(__dirname, '..');
  const serverProc = spawn('cmd.exe', ['/c', 'npx.cmd', 'next', 'dev', '-p', String(TEST_PORT)], {
    cwd: projectRoot,
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProc.stdout.on('data', d => {
    const s = d.toString();
    if (s.includes('Ready in') || s.includes('started server') || s.includes('Local:')) {
      console.log('  [Next.js Server]', s.trim());
    }
  });

  serverProc.stderr.on('data', d => {
    const s = d.toString();
    if (!s.includes('ExperimentalWarning') && !s.includes('node:sqlite')) {
      // console.error('Next.js Log:', s.trim());
    }
  });

  // Wait for server readiness via active polling
  let serverReady = false;
  for (let attempt = 1; attempt <= 50; attempt++) {
    try {
      const res = await request('GET', '/api/health');
      if (res.status === 200) {
        serverReady = true;
        console.log(`✅ Next.js server ready on attempt ${attempt} (~${attempt * 0.5}s)\n`);
        break;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, 500));
  }

  if (!serverReady) {
    console.error('❌ Server failed to start within 25 seconds!');
    killProcessTree(serverProc.pid);
    process.exit(1);
  }

  try {
    // ----------------------------------------------------
    // SUITE 2: Health, Public Routes & SEO Metadata
    // ----------------------------------------------------
    console.log('--- SUITE 2: Health, Public Routes & Metadata ---');
    const health = await request('GET', '/api/health');
    assert(health.status === 200, 'GET /api/health returns 200 OK');
    const healthData = health.json();
    assert(healthData?.status === 'healthy', 'Health check payload reports "healthy"');
    assert(healthData?.database?.status === 'connected', 'Database reported as connected in health probe');
    assert(typeof healthData?.database?.latencyMs === 'number', 'Database query latency benchmark returned');

    const home = await request('GET', '/');
    assert(home.status === 200, 'GET / (Home page) returns 200 OK');
    assert(home.data.includes('Freelance') || home.data.includes('Designing &amp; building'), 'Home page renders headline copy');

    // Security Headers check on Home page
    assert(home.headers['x-frame-options'] === 'SAMEORIGIN', 'Security Header: X-Frame-Options is SAMEORIGIN');
    assert(home.headers['x-content-type-options'] === 'nosniff', 'Security Header: X-Content-Type-Options is nosniff');
    assert(home.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Security Header: Referrer-Policy configured');

    const loginPage = await request('GET', '/login');
    assert(loginPage.status === 200, 'GET /login returns 200 OK');
    assert(loginPage.data.includes('Admin Login') || loginPage.data.includes('admin'), 'Login page renders login form');

    const robots = await request('GET', '/robots.txt');
    assert(robots.status === 200, 'GET /robots.txt returns 200 OK');
    assert(robots.data.includes('Disallow: /admin'), 'Robots.txt disallows crawler indexing of /admin');

    const sitemap = await request('GET', '/sitemap.xml');
    assert(sitemap.status === 200, 'GET /sitemap.xml returns 200 OK');
    assert(sitemap.data.includes('<urlset') && sitemap.data.includes('<loc>'), 'Sitemap returns valid XML urlset');

    const portfolio = await request('GET', '/api/portfolio');
    assert(portfolio.status === 200, 'GET /api/portfolio returns 200 OK');
    const portJson = portfolio.json();
    assert(portJson?.profile?.name !== undefined, 'Portfolio API returns profile record');
    assert(portJson?.projects?.length >= 6, 'Portfolio API returns project list');
    assert(portJson?.services?.length === 4, 'Portfolio API returns service list');
    assert(portJson?.processSteps?.length === 4, 'Portfolio API returns process steps');
    assert(portJson?.testimonials?.length >= 3, 'Portfolio API returns testimonials list');

    // ----------------------------------------------------
    // SUITE 3: Client Inquiries API & Validation
    // ----------------------------------------------------
    console.log('\n--- SUITE 3: Client Inquiries API & Validation ---');
    const badEmail = await request('POST', '/api/inquiries', {
      name: 'John Doe',
      email: 'not-an-email',
      message: 'Valid length message for testing inquiries.'
    });
    assert(badEmail.status === 400, 'POST /api/inquiries with invalid email returns 400 Bad Request');

    const badName = await request('POST', '/api/inquiries', {
      name: '',
      email: 'john@example.com',
      message: 'Valid length message for testing inquiries.'
    });
    assert(badName.status === 400, 'POST /api/inquiries with empty name returns 400 Bad Request');

    const shortMsg = await request('POST', '/api/inquiries', {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hi'
    });
    assert(shortMsg.status === 400, 'POST /api/inquiries with short message returns 400 Bad Request');

    const validInquiry = await request('POST', '/api/inquiries', {
      name: 'Elena Rostova',
      email: 'elena@novatech-consulting.com',
      company: 'NovaTech',
      serviceType: 'Full-Stack Web App',
      budget: '$5k - $10k',
      message: 'We are seeking an experienced Next.js contractor for our enterprise client portal.'
    });
    assert(validInquiry.status === 201, 'POST /api/inquiries with valid payload returns 201 Created');
    const inqData = validInquiry.json();
    const testInquiryId = inqData?.inquiry?.id;
    assert(!!testInquiryId, `Inquiry created with ID: ${testInquiryId}`);

    // Verify row directly in SQLite
    const inqDbRow = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(testInquiryId);
    assert(inqDbRow?.name === 'Elena Rostova', 'Inquiry verified inside SQLite inquiries table');
    assert(inqDbRow?.email === 'elena@novatech-consulting.com', 'Inquiry email correctly persisted');
    assert(inqDbRow?.status === 'new', 'Inquiry initial status defaults to "new"');

    // ----------------------------------------------------
    // SUITE 4: Authentication, Edge Middleware & Session
    // ----------------------------------------------------
    console.log('\n--- SUITE 4: Authentication & Edge Middleware ---');
    // 1. Unauthenticated /admin redirect
    const unauthAdmin = await request('GET', '/admin');
    assert(unauthAdmin.status === 307 || unauthAdmin.status === 308, 'GET /admin without token redirects (307/308)');
    assert(unauthAdmin.headers.location?.includes('/login'), 'Redirect target includes /login');

    const unauthSub = await request('GET', '/admin/subpage');
    assert(unauthSub.status === 307 || unauthSub.status === 308, 'GET /admin/subpage without token redirects (307/308)');
    assert(unauthSub.headers.location?.includes('/login'), 'Redirect target includes /login');

    // 2. Bad credentials login
    const badLogin = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'wrong_password_999'
    });
    assert(badLogin.status === 401, 'POST /api/auth/login with wrong password returns 401 Unauthorized');

    // 3. Valid login
    const goodLogin = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    assert(goodLogin.status === 200, 'POST /api/auth/login with valid credentials returns 200 OK');
    const setCookie = goodLogin.headers['set-cookie'];
    const cookieStr = Array.isArray(setCookie) ? setCookie.join(';') : (setCookie || '');
    const tokenMatch = cookieStr.match(/admin_session_token=([^;]+)/);
    const sessionToken = tokenMatch ? tokenMatch[1] : '';
    assert(!!sessionToken, 'Login returns admin_session_token HttpOnly cookie');

    const authHeaders = { Cookie: `admin_session_token=${sessionToken}` };

    // 4. Authenticated /admin access
    const authAdmin = await request('GET', '/admin', null, authHeaders);
    assert(authAdmin.status === 200, 'GET /admin with valid session token returns 200 OK');
    assert(authAdmin.data.includes('Studio CMS'), 'Admin dashboard rendered successfully');

    // ----------------------------------------------------
    // SUITE 5: Authenticated Admin CMS CRUD APIs
    // ----------------------------------------------------
    console.log('\n--- SUITE 5: Authenticated Admin CMS CRUD APIs ---');
    // Projects CRUD
    const addProj = await request('POST', '/api/admin/projects', {
      title: 'Automated E2E Project',
      category: 'development',
      badge: 'Automated',
      image: '/images/project-1.svg',
      tags: ['TypeScript', 'SQLite', 'Next.js'],
      summary: 'Project created by automated regression test suite.',
      problem: 'Need end-to-end testing verification.',
      solution: 'Automated test suite implemented.'
    }, authHeaders);
    assert(addProj.status === 201, 'POST /api/admin/projects returns 201 Created');
    const newProjId = addProj.json()?.project?.id;
    assert(!!newProjId, `Project inserted with ID: ${newProjId}`);

    const editProj = await request('PUT', '/api/admin/projects', {
      id: newProjId,
      title: 'Automated E2E Project (Updated Title)'
    }, authHeaders);
    assert(editProj.status === 200, 'PUT /api/admin/projects returns 200 OK');
    const editProjRow = db.prepare('SELECT title FROM projects WHERE id = ?').get(newProjId);
    assert(editProjRow?.title === 'Automated E2E Project (Updated Title)', 'Project title updated in SQLite');

    const delProj = await request('DELETE', `/api/admin/projects?id=${newProjId}`, null, authHeaders);
    assert(delProj.status === 200, 'DELETE /api/admin/projects returns 200 OK');
    const checkDelProj = db.prepare('SELECT id FROM projects WHERE id = ?').get(newProjId);
    assert(!checkDelProj, 'Project record deleted from SQLite');

    // Testimonials CRUD
    const addTest = await request('POST', '/api/admin/testimonials', {
      name: 'Marcus Vance',
      role: 'VP Engineering',
      company: 'Apex Cloud',
      initials: 'MV',
      rating: 5,
      quote: 'Exceptional full-stack architecture and zero bug delivery.'
    }, authHeaders);
    assert(addTest.status === 201, 'POST /api/admin/testimonials returns 201 Created');
    const newTestId = addTest.json()?.testimonial?.id;

    const delTest = await request('DELETE', `/api/admin/testimonials?id=${newTestId}`, null, authHeaders);
    assert(delTest.status === 200, 'DELETE /api/admin/testimonials returns 200 OK');
    const checkDelTest = db.prepare('SELECT id FROM testimonials WHERE id = ?').get(newTestId);
    assert(!checkDelTest, 'Testimonial record deleted from SQLite');

    // Profile Update & Revert
    const getInitialProf = await request('GET', '/api/portfolio');
    const originalProfile = getInitialProf.json()?.profile;
    const updateProf = await request('PUT', '/api/admin/profile', {
      ...originalProfile,
      headline: 'Temporary Test Headline for E2E'
    }, authHeaders);
    assert(updateProf.status === 200, 'PUT /api/admin/profile returns 200 OK');
    const verifyProf = db.prepare('SELECT headline FROM profiles LIMIT 1').get();
    assert(verifyProf?.headline === 'Temporary Test Headline for E2E', 'Profile headline updated in SQLite');

    // Revert profile
    const revertProf = await request('PUT', '/api/admin/profile', originalProfile, authHeaders);
    assert(revertProf.status === 200, 'PUT /api/admin/profile reverted original data');

    // Security password validation check
    const badSec = await request('PUT', '/api/admin/security', {
      currentPassword: 'invalidCurrentPassword',
      newPassword: 'newValidPassword123'
    }, authHeaders);
    assert(badSec.status === 400, 'PUT /api/admin/security rejects invalid current password with 400');

    // Clean up test inquiry from Suite 3
    const delInq = await request('DELETE', `/api/admin/inquiries?id=${testInquiryId}`, null, authHeaders);
    assert(delInq.status === 200, 'DELETE /api/admin/inquiries deletes test inquiry (200 OK)');
    const checkDelInq = db.prepare('SELECT id FROM inquiries WHERE id = ?').get(testInquiryId);
    assert(!checkDelInq, 'Test inquiry cleaned up from SQLite database');

    // Logout check
    const logout = await request('POST', '/api/auth/logout', null, authHeaders);
    assert(logout.status === 200, 'POST /api/auth/logout returns 200 OK');
    const logoutCookie = logout.headers['set-cookie'] ? logout.headers['set-cookie'][0] : '';
    const cookieLower = logoutCookie.toLowerCase();
    assert(cookieLower.includes('max-age=0') || cookieLower.includes('1970') || cookieLower.includes('admin_session_token=;'), 'Logout clears admin_session_token cookie');

    // Confirm access to /admin with cleared cookie is blocked
    const postLogoutAdmin = await request('GET', '/admin', null, { Cookie: logoutCookie });
    assert(postLogoutAdmin.status === 307 || postLogoutAdmin.status === 308, 'GET /admin after logout redirects to /login');

  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  } finally {
    console.log('\n🛑 Shutting down test server...');
    killProcessTree(serverProc.pid);
  }

  console.log('\n====================================================');
  console.log(`  FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
})();
