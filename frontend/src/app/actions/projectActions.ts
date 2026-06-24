'use server'

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function getProjects() {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/projects`, {
      headers,
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch projects');
    return await response.json();
  } catch (error: any) {
    console.error('getProjects error:', error);
    return [];
  }
}

export async function getProject(id: string) {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      headers,
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch project');
    return await response.json();
  } catch (error: any) {
    console.error('getProject error:', error);
    return null;
  }
}

export async function completeProject(id: string) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/projects/${id}/complete`, {
      method: 'PATCH',
      headers: authHeaders
    });
    if (!response.ok) throw new Error('Failed to complete project');
    revalidatePath('/dashboard');
    revalidatePath(`/project/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: string) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    if (!response.ok) throw new Error('Failed to delete project');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleTask(id: string, projectId: string) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: authHeaders
    });
    if (!response.ok) throw new Error('Failed to toggle task');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTask(id: string, projectId: string, data: {
  title: string;
  description: string;
  estimatedHours: number;
  deadline: string;
}) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update task');
    revalidatePath(`/project/${projectId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOverdueTasks() {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/tasks/overdue`, {
      headers,
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch overdue tasks');
    return await response.json();
  } catch (error: any) {
    console.error('getOverdueTasks error:', error);
    return [];
  }
}

export async function rescheduleTask(id: string, projectId: string, deadline: string) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/tasks/${id}/reschedule`, {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deadline }),
    });
    if (!response.ok) throw new Error('Failed to reschedule task');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reduceTaskDifficulty(id: string, projectId: string) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/tasks/${id}/reduce-difficulty`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    if (!response.ok) throw new Error('Failed to reduce task difficulty');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTaskNotes(id: string, projectId: string, notes: string) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/tasks/${id}/notes`, {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });
    if (!response.ok) throw new Error('Failed to save task notes');
    revalidatePath(`/project/${projectId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTaskChatHistory(taskId: string) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/tasks/${taskId}/chat-history`, {
      headers: authHeaders,
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch task chat history');
    return await response.json();
  } catch (error: any) {
    console.error('getTaskChatHistory error:', error);
    return [];
  }
}

export async function askTaskAssistant(taskId: string, projectId: string, message: string) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/tasks/${taskId}/ask`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, message }),
    });
    if (!response.ok) throw new Error('Failed to get response from study assistant');
    return await response.json();
  } catch (error: any) {
    console.error('askTaskAssistant error:', error);
    return { error: error.message };
  }
}
