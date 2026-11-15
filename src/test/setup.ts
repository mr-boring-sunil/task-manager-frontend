import '@testing-library/jest-dom';

// Mock ResizeObserver for Recharts
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;

// Mock matchMedia for ThemeContext
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock EventSource for tests
class EventSourceMock {
  url: string;
  listeners: Record<string, Function[]> = {};

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(type: string, listener: Function) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: Function) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((l) => l !== listener);
    }
  }

  dispatchEvent(event: any) {
    const listeners = this.listeners[event.type] || [];
    listeners.forEach((l) => l(event));
    return true;
  }

  close() {}
}

(window as any).EventSource = EventSourceMock;
