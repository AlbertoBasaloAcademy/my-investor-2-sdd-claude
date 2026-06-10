import { httpClient } from '../../shared/api/httpClient';
import type { Launch, LaunchRequest, LaunchStatusRequest } from '../../shared/types/launches';

export async function getLaunches(): Promise<Launch[]> {
  return httpClient.get<Launch[]>('/api/launches');
}

export async function createLaunch(request: LaunchRequest): Promise<Launch> {
  return httpClient.post<Launch>('/api/launches', request);
}

export async function updateLaunch(id: string, request: LaunchRequest): Promise<Launch> {
  return httpClient.put<Launch>(`/api/launches/${id}`, request);
}

export async function transitionLaunch(id: string, request: LaunchStatusRequest): Promise<Launch> {
  return httpClient.patch<Launch>(`/api/launches/${id}/status`, request);
}
