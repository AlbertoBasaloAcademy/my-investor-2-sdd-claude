import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Launch } from '../../shared/types/launches';
import * as launchesApi from './launchesApi';
import { useLaunches } from './useLaunches';

vi.mock('./launchesApi');

const mockLaunch: Launch = {
  id: 'launch-1',
  rocketId: 'rocket-1',
  rocketName: 'Falcon 9',
  scheduledAt: '2027-01-01T10:00:00',
  pricePerTicket: 100,
  minimumOccupancy: 3,
  status: 'created',
};

describe('useLaunches', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads launches on mount', async () => {
    vi.mocked(launchesApi.getLaunches).mockResolvedValue([mockLaunch]);

    const { result } = renderHook(() => useLaunches());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.launches).toEqual([mockLaunch]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(launchesApi.getLaunches).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLaunches());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.launches).toEqual([]);
  });
});
