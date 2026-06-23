'use server'

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function askMentorAdvice(projectId: string, message: string) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/mentor/ask`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectId, message })
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to communicate with AI Mentor');
    }
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMentorHistory(projectId: string) {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/mentor/history/${projectId}`, {
      headers,
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch mentor history');
    return await response.json();
  } catch (error) {
    console.error('getMentorHistory error:', error);
    return [];
  }
}

export async function analyzeAndAdjustPlan(projectId: string) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/mentor/analyze`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectId })
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to analyze pacing');
    }
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
