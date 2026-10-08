export interface SavedCouncilSession {
  token: string;
  uid: string;
  email: string;
  displayName: string;
  role: 'citizen' | 'officer' | 'admin';
  chiefdom: string;
}

export function getSavedSession(): SavedCouncilSession | null {
  try {
    const raw = localStorage.getItem('bodc_session');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getAuthHeaders(user?: any): Promise<Record<string, string>> {
  let token = '';
  if (user && typeof user.getIdToken === 'function') {
    try {
      token = await user.getIdToken();
    } catch {}
  }
  
  if (!token) {
    const session = getSavedSession();
    if (session && session.token) {
      token = session.token;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}
