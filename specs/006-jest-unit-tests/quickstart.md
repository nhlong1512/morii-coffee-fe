# Quickstart: Jest Unit Tests

**Feature**: 006-jest-unit-tests  
**Date**: 2026-04-15

## Prerequisites

- Node.js 20+, pnpm installed
- Project dependencies already installed (`pnpm install`)

## Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage report
pnpm test:coverage

# Run a specific test file
pnpm test src/__tests__/utils/validate.test.ts

# Run tests matching a pattern
pnpm test --testPathPattern="stores"

# Watch mode (re-run on file change)
pnpm test --watch
```

## Key Configuration Files

### `jest.config.ts`
- Uses `next/jest` SWC transform for TypeScript + JSX
- `testEnvironment: 'jsdom'` for DOM API support
- `moduleNameMapper` resolves `@/` to `src/`
- Coverage configured with scoped `collectCoverageFrom`
- 80% threshold enforced globally

### `jest.setup.ts`
- Imports `@testing-library/jest-dom` for DOM matchers
- Contains Zustand store reset helpers called in `afterEach`

## Writing New Tests

### Pure utility function
```typescript
// src/__tests__/utils/my-util.test.ts
import { myFunction } from '@/utils/my-util';

describe('myFunction', () => {
  it('returns expected output for happy path', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### Zustand store
```typescript
// src/__tests__/stores/my-store.test.ts
import { useMyStore } from '@/stores/my-store';

beforeEach(() => {
  // Reset store to initial state before each test
  useMyStore.setState(useMyStore.getInitialState(), true);
});

it('performs expected action', () => {
  const { someAction } = useMyStore.getState();
  someAction();
  expect(useMyStore.getState().someValue).toBe(expected);
});
```

### Custom React hook
```typescript
// src/__tests__/hooks/use-my-hook.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '@/hooks/use-my-hook';

it('updates state correctly', () => {
  const { result } = renderHook(() => useMyHook());
  act(() => {
    result.current.someAction();
  });
  expect(result.current.someValue).toBe(expected);
});
```

### Hook with mocked service
```typescript
jest.mock('@/services/my-service');
import { myService } from '@/services/my-service';

it('shows loading then success', async () => {
  (myService as jest.Mock).mockResolvedValue([...data]);
  const { result } = renderHook(() => useMyHook());
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual([...data]);
});
```

## Coverage Report

After running `pnpm test:coverage`, open `coverage/lcov-report/index.html` in a browser for a line-by-line coverage breakdown.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot find module '@/...'` | Check `moduleNameMapper` in `jest.config.ts` |
| Zustand state leaks between tests | Ensure `useStore.setState(useStore.getInitialState(), true)` is in `beforeEach` |
| `act(...)` warnings | Wrap async hook operations in `await act(async () => { ... })` |
| `document is not defined` | Ensure `testEnvironment: 'jsdom'` is set in jest config |
| `next-intl` import errors | Add `jest.mock('next-intl')` at top of test file |
