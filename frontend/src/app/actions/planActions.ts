'use server'

import { cookies } from 'next/headers';

export async function generateProjectPlan(goalData: { goal: string; deadline: string; maxTasksPerDay: number }) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      throw new Error('You must be logged in to generate a plan.');
    }

    const response = await fetch(`${API_URL}/api/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        goal: goalData.goal,
        deadline: goalData.deadline,
        maxTasksPerDay: goalData.maxTasksPerDay
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate plan');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
