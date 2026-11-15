import { describe, it, expect, beforeEach } from 'vitest';
import { streamManager } from '../../services/streamService';

describe('SSE Stream Manager', () => {
  beforeEach(() => {
    streamManager.disconnectAll();
  });

  it('subscribes and initiates EventSource on first subscriber', () => {
    let receivedData: any = null;
    let receivedState: string = '';

    const unsub = streamManager.subscribe('metrics', {
      id: 'test-sub-1',
      onData: (d) => {
        receivedData = d;
      },
      onStateChange: (state) => {
        receivedState = state;
      },
    });

    expect(receivedState).toBe('connecting');
    expect(receivedData).toBeNull();

    unsub();
    expect(streamManager.getConnectionState('metrics')).toBe('disconnected');
  });

  it('shares single EventSource among multiple subscribers without duplicating', () => {
    const unsub1 = streamManager.subscribe('metrics', {
      id: 'sub-1',
      onData: () => {},
    });

    const unsub2 = streamManager.subscribe('metrics', {
      id: 'sub-2',
      onData: () => {},
    });

    // Unsubscribing first subscriber keeps connection open for second
    unsub1();
    expect(streamManager.getConnectionState('metrics')).not.toBe('disconnected');

    // Unsubscribing last subscriber closes connection
    unsub2();
    expect(streamManager.getConnectionState('metrics')).toBe('disconnected');
  });
});
