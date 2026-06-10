import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../../shared/api/httpClient';
import type { Launch } from '../../shared/types/launches';
import { createLaunch, getLaunches, transitionLaunch, updateLaunch } from './launchesApi';

vi.mock('../../shared/api/httpClient');

const mockLaunch: Launch = {
  id: 'launch-1',
  rocketId: 'rocket-1',
  rocketName: 'Falcon 9',
  scheduledAt: '2027-01-01T10:00:00',
  pricePerTicket: 100,
  minimumOccupancy: 3,
  status: 'created',
};

describe('launchesApi', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all launches', async () => {
    vi.mocked(httpClient.get).mockResolvedValue([mockLaunch]);

    const result = await getLaunches();

    expect(result).toEqual([mockLaunch]);
    expect(httpClient.get).toHaveBeenCalledWith('/api/launches');
  });

  it('creates a launch', async () => {
    vi.mocked(httpClient.post).mockResolvedValue(mockLaunch);

    const result = await createLaunch({
      rocketId: 'rocket-1',
      scheduledAt: '2027-01-01T10:00:00',
      pricePerTicket: 100,
      minimumOccupancy: 3,
    });

    expect(result).toEqual(mockLaunch);
    expect(httpClient.post).toHaveBeenCalledWith('/api/launches', expect.objectContaining({ rocketId: 'rocket-1' }));
  });

  it('updates a launch', async () => {
    const updated: Launch = { ...mockLaunch, pricePerTicket: 200 };
    vi.mocked(httpClient.put).mockResolvedValue(updated);

    const result = await updateLaunch('launch-1', {
      rocketId: 'rocket-1',
      scheduledAt: '2027-01-01T10:00:00',
      pricePerTicket: 200,
      minimumOccupancy: 3,
    });

    expect(result).toEqual(updated);
    expect(httpClient.put).toHaveBeenCalledWith('/api/launches/launch-1', expect.objectContaining({ pricePerTicket: 200 }));
  });

  it('transitions a launch status', async () => {
    const confirmed: Launch = { ...mockLaunch, status: 'confirmed' };
    vi.mocked(httpClient.patch).mockResolvedValue(confirmed);

    const result = await transitionLaunch('launch-1', { status: 'confirmed' });

    expect(result).toEqual(confirmed);
    expect(httpClient.patch).toHaveBeenCalledWith('/api/launches/launch-1/status', { status: 'confirmed' });
  });
});
