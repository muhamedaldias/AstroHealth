import { Astronaut, CrewPayload, OsdrStudiesPayload } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`AstroHealth API ${response.status}: ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export async function fetchCrew(): Promise<Astronaut[]> {
  const payload = await getJson<CrewPayload>('/crew');
  return payload.crew;
}

export async function fetchStudies(): Promise<OsdrStudiesPayload> {
  return getJson<OsdrStudiesPayload>('/osdr/studies');
}
