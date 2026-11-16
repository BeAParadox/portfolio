import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { addProject, updateProject, deleteProject } from '@/lib/db';

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newProject = await addProject(body);
    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Failed to add project:', error);
    return NextResponse.json({ 
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    const updated = await updateProject(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ 
      error: 'Failed to update project',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    const success = await deleteProject(id);
    if (!success) {
      return NextResponse.json({ error: 'Project not found or already deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ 
      error: 'Failed to delete project',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
