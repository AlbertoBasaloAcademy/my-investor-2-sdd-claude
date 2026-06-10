import { httpClient } from '../../shared/api/httpClient';
import type { Rocket, RocketRequest } from '../../shared/types/rockets';

export async function getRockets(): Promise<Rocket[]> {
  return httpClient.get<Rocket[]>('/api/rockets');
}

export async function createRocket(request: RocketRequest): Promise<Rocket> {
  return httpClient.post<Rocket>('/api/rockets', request);
}

export async function updateRocket(id: string, request: RocketRequest): Promise<Rocket> {
  return httpClient.put<Rocket>(`/api/rockets/${id}`, request);
}

export async function decommissionRocket(id: string): Promise<void> {
  return httpClient.del(`/api/rockets/${id}`);
}
