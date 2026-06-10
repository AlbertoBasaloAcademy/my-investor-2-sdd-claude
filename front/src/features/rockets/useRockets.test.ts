import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Rocket } from '../../shared/types/rockets';
import * as rocketsApi from './rocketsApi';
import { useRockets } from './useRockets';

vi.mock('./rocketsApi');

const mockRocket: Rocket = { id: 'uuid-1', name: 'Falcon 9', capacity: 5, range: 'Earth', decommissioned: false };

describe('useRockets', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads rockets on mount', async () => {
    vi.mocked(rocketsApi.getRockets).mockResolvedValue([mockRocket]);

    const { result } = renderHook(() => useRockets());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.rockets).toEqual([mockRocket]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(rocketsApi.getRockets).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRockets());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.rockets).toEqual([]);
  });
});
