'use server'

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function getDashboardAnalytics() {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/analytics`, {
      headers,
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return await response.json();
  } catch (error) {
    console.error('getDashboardAnalytics error:', error);
    return null;
  }
}
