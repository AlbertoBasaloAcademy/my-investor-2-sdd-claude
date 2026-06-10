import { useCallback, useEffect, useState } from 'react';
import { createLaunch, getLaunches, transitionLaunch, updateLaunch } from './launchesApi';
import type { Launch, LaunchRequest, LaunchStatus } from '../../shared/types/launches';

export function useLaunches() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getLaunches()
      .then((data) => {
        if (active) setLaunches(data);
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

  const create = useCallback(async (request: LaunchRequest): Promise<void> => {
    const launch = await createLaunch(request);
    setLaunches((prev) => [launch, ...prev]);
  }, []);

  const update = useCallback(async (id: string, request: LaunchRequest): Promise<void> => {
    const launch = await updateLaunch(id, request);
    setLaunches((prev) => prev.map((l) => (l.id === id ? launch : l)));
  }, []);

  const transition = useCallback(async (id: string, status: LaunchStatus): Promise<void> => {
    const launch = await transitionLaunch(id, { status });
    setLaunches((prev) => prev.map((l) => (l.id === id ? launch : l)));
  }, []);

  return { launches, error, isLoading, create, update, transition } as const;
}
