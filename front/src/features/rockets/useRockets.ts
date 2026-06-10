import { useCallback, useEffect, useState } from 'react';
import { createRocket, decommissionRocket, getRockets, updateRocket } from './rocketsApi';
import type { Rocket, RocketRequest } from '../../shared/types/rockets';

export function useRockets() {
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getRockets()
      .then((data) => {
        if (active) setRockets(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause : new Error(String(cause)));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const create = useCallback(async (request: RocketRequest): Promise<void> => {
    const rocket = await createRocket(request);
    setRockets((prev) => [...prev, rocket]);
  }, []);

  const update = useCallback(async (id: string, request: RocketRequest): Promise<void> => {
    const rocket = await updateRocket(id, request);
    setRockets((prev) => prev.map((r) => (r.id === id ? rocket : r)));
  }, []);

  const decommission = useCallback(async (id: string): Promise<void> => {
    await decommissionRocket(id);
    setRockets((prev) => prev.map((r) => (r.id === id ? { ...r, decommissioned: true } : r)));
  }, []);

  return { rockets, error, isLoading, create, update, decommission } as const;
}
