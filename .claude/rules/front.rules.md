---
description: Code rules for the front container of My-Investor (ab-java-react)
paths: ["front/src/**"]
---
# Front code rules — My-Investor (ab-java-react)

## Summary

Feature-first React 19 SPA in strict TypeScript. Each feature owns its component, hook, API module, and tests in a single folder. The dominant principle: keep each layer thin — components render, hooks manage state, API modules call `httpClient`, and `httpClient` calls `fetch`. Never skip a layer or cross feature boundaries.

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| Folders / Feature files | kebab-case folder, PascalCase component file | `rockets/RocketCatalog.tsx` |
| Components | PascalCase `.tsx` | `RocketCatalog`, `LaunchItem` |
| Custom hooks | `use` prefix, camelCase `.ts` | `useRockets.ts` |
| API modules | domain name + `Api`, camelCase `.ts` | `rocketsApi.ts` |
| Types / Interfaces | PascalCase, exported from `shared/types/` | `Rocket`, `LaunchRequest` |
| CSS files | same name as component | `RocketCatalog.css` |
| Constants / env | `UPPER_SNAKE` or `VITE_` prefix | `VITE_API_BASE_URL` |

## Artifact roles

| Role | Structural rule (one line) |
|------|----------------------------|
| Component (`.tsx`) | Calls one custom hook; renders loading/error/data states; owns no fetch logic |
| Custom hook (`use*.ts`) | Owns `useState` + `useEffect` for fetch; exposes `useCallback` mutations; returns `as const` |
| API module (`*Api.ts`) | One exported `async` function per endpoint; delegates all HTTP to `httpClient` |
| `httpClient` | Sole place that calls `fetch`; parses errors; reads `VITE_API_BASE_URL` |
| Shared types (`shared/types/*.ts`) | One file per domain; only plain interfaces and literal union types — no classes |
| CSS | Co-located with component; uses CSS custom properties from `index.css` for tokens |
| Tests (`*.test.ts(x)`) | Co-located with the file under test; unit per layer (component, hook, API) |

## Canonical example

> `useRockets.ts` — the cleanest representative of the hook layer. Copy its shape.

```typescript
export function useRockets() {
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const [error, setError]     = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getRockets()
      .then((data)          => { if (active) setRockets(data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause : new Error(String(cause))); })
      .finally(()           => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const create = useCallback(async (req: RocketRequest): Promise<void> => {
    const rocket = await createRocket(req);
    setRockets((prev) => [...prev, rocket]);
  }, []);

  return { rockets, error, isLoading, create } as const;
}
```

## Conventions

- **Wiring**: Components import their feature hook directly (no DI, no context). `httpClient` is imported by API modules; never by components or hooks.
- **Errors**: API modules throw `Error`; hooks catch and store in `useState<Error | null>`; components render the `.message` inside an `role="alert"` element.
- **Unmount safety**: Every `useEffect` that fetches uses a local `active` flag (set to `false` in the cleanup return) to prevent state updates on unmounted components.
- **Testing**: Tests are co-located (`*.test.ts` / `*.test.tsx`) and use Vitest globals. API module tests mock `httpClient` with `vi.mock()`. Component tests use `@testing-library/react` with `data-testid` selectors.
- **Avoid**:
  - Calling `fetch` outside `httpClient` — bypasses error handling and the base-URL env var.
  - Sharing state across features via props or context — each feature is self-contained.
  - Inline anonymous types in component props — always reference a named interface from `shared/types/`.
  - Adding client-side routing without a deliberate architecture decision — currently intentionally absent.
