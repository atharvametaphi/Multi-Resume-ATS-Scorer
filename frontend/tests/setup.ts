import "@testing-library/jest-dom";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Recharts and responsive components rely on ResizeObserver in tests.
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

