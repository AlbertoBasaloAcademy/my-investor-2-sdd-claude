import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../../shared/api/httpClient';
import type { Rocket } from '../../shared/types/rockets';
import { createRocket, decommissionRocket, getRockets, updateRocket } from './rocketsApi';

vi.mock('../../shared/api/httpClient');

const mockRocket: Rocket = { id: 'uuid-1', name: 'Falcon 9', capacity: 5, range: 'Earth' };

describe('rocketsApi', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all rockets', async () => {
    vi.mocked(httpClient.get).mockResolvedValue([mockRocket]);

    const result = await getRockets();

    expect(result).toEqual([mockRocket]);
    expect(httpClient.get).toHaveBeenCalledWith('/api/rockets');
  });

  it('creates a rocket', async () => {
    vi.mocked(httpClient.post).mockResolvedValue(mockRocket);

    const result = await createRocket({ name: 'Falcon 9', capacity: 5, range: 'Earth' });

    expect(result).toEqual(mockRocket);
    expect(httpClient.post).toHaveBeenCalledWith('/api/rockets', {
      name: 'Falcon 9',
      capacity: 5,
      range: 'Earth',
    });
  });

  it('updates a rocket', async () => {
    const updated: Rocket = { ...mockRocket, capacity: 7 };
    vi.mocked(httpClient.put).mockResolvedValue(updated);

    const result = await updateRocket('uuid-1', { name: 'Falcon 9', capacity: 7, range: 'Earth' });

    expect(result).toEqual(updated);
    expect(httpClient.put).toHaveBeenCalledWith('/api/rockets/uuid-1', {
      name: 'Falcon 9',
      capacity: 7,
      range: 'Earth',
    });
  });

  it('decommissions a rocket', async () => {
    vi.mocked(httpClient.del).mockResolvedValue(undefined);

    await decommissionRocket('uuid-1');

    expect(httpClient.del).toHaveBeenCalledWith('/api/rockets/uuid-1');
  });
});
