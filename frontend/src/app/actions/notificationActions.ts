'use server'

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function getNotifications() {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/notifications`, {
      headers,
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('getNotifications error:', error);
    return [];
  }
}

export async function markAllRead() {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/notifications/read`, {
      method: 'POST',
      headers
    });
    if (!response.ok) throw new Error('Failed to mark notifications as read');
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkOverdue() {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/notifications/check-overdue`, {
      method: 'POST',
      headers
    });
    if (!response.ok) throw new Error('Failed to check overdue tasks');
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
