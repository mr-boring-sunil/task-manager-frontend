import { apiClient } from './apiClient';
import { StreamConnectionState } from '../types/stream';

type StreamChannel = 'metrics' | 'processes';

interface ChannelSubscription<T> {
  id: string;
  onData: (data: T) => void;
  onError?: (err: any) => void;
  onStateChange?: (state: StreamConnectionState) => void;
}

interface ChannelState<T> {
  eventSource: EventSource | null;
  subscribers: Map<string, ChannelSubscription<T>>;
  connectionState: StreamConnectionState;
  reconnectTimer: any;
  reconnectAttempts: number;
  intervalMs: number;
}

export class StreamManager {
  private channels: {
    metrics: ChannelState<any>;
    processes: ChannelState<any>;
  } = {
    metrics: {
      eventSource: null,
      subscribers: new Map(),
      connectionState: 'disconnected',
      reconnectTimer: null,
      reconnectAttempts: 0,
      intervalMs: 1000,
    },
    processes: {
      eventSource: null,
      subscribers: new Map(),
      connectionState: 'disconnected',
      reconnectTimer: null,
      reconnectAttempts: 0,
      intervalMs: 1000,
    },
  };

  /**
   * Subscribe to a stream channel
   */
  public subscribe<T>(
    channel: StreamChannel,
    subscription: ChannelSubscription<T>,
    intervalMs = 1000
  ): () => void {
    const ch = this.channels[channel];
    ch.intervalMs = intervalMs;
    ch.subscribers.set(subscription.id, subscription);

    // Notify initial state
    if (subscription.onStateChange) {
      subscription.onStateChange(ch.connectionState);
    }

    // If first subscriber, open SSE connection
    if (ch.subscribers.size === 1 && !ch.eventSource) {
      this.connect(channel);
    }

    // Return unsubscribe callback
    return () => {
      ch.subscribers.delete(subscription.id);
      if (ch.subscribers.size === 0) {
        this.disconnect(channel);
      }
    };
  }

  /**
   * Connect to an SSE channel
   */
  private connect(channel: StreamChannel): void {
    const ch = this.channels[channel];
    if (ch.eventSource) return;

    if (ch.reconnectTimer) {
      clearTimeout(ch.reconnectTimer);
      ch.reconnectTimer = null;
    }

    this.setChannelState(channel, 'connecting');

    const baseUrl = apiClient.getBaseUrl();
    const url = `${baseUrl}/api/v1/stream/${channel}?interval=${ch.intervalMs}`;

    try {
      const es = new EventSource(url, { withCredentials: true });
      ch.eventSource = es;

      es.addEventListener('open', () => {
        ch.reconnectAttempts = 0;
        this.setChannelState(channel, 'connected');
      });

      // Handle connected event
      es.addEventListener('connected', () => {
        this.setChannelState(channel, 'connected');
      });

      // Handle main channel data event
      es.addEventListener(channel, (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          ch.subscribers.forEach((sub) => {
            try {
              sub.onData(parsed);
            } catch (err) {
              console.error(`[SSE ${channel}] Subscriber error:`, err);
            }
          });
        } catch (parseErr) {
          console.error(`[SSE ${channel}] Failed to parse SSE JSON:`, parseErr);
        }
      });

      // Handle backend error events
      es.addEventListener('error', (e: any) => {
        this.handleError(channel, e);
      });

      // Handle backend server shutdown event
      es.addEventListener('shutdown', () => {
        this.disconnect(channel);
        this.setChannelState(channel, 'disconnected');
      });
    } catch (err) {
      this.handleError(channel, err);
    }
  }

  /**
   * Handle stream error and exponential backoff reconnection
   */
  private handleError(channel: StreamChannel, error: any): void {
    const ch = this.channels[channel];

    this.setChannelState(channel, 'error');

    ch.subscribers.forEach((sub) => {
      if (sub.onError) sub.onError(error);
    });

    // Close broken connection
    if (ch.eventSource) {
      ch.eventSource.close();
      ch.eventSource = null;
    }

    // If still have subscribers, schedule reconnection
    if (ch.subscribers.size > 0 && !ch.reconnectTimer) {
      ch.reconnectAttempts++;
      // Backoff delay between 1s and 15s
      const delay = Math.min(1000 * Math.pow(1.5, ch.reconnectAttempts), 15000);
      ch.reconnectTimer = setTimeout(() => {
        ch.reconnectTimer = null;
        if (ch.subscribers.size > 0) {
          this.connect(channel);
        }
      }, delay);
    }
  }

  /**
   * Disconnect a channel and clean up timers
   */
  private disconnect(channel: StreamChannel): void {
    const ch = this.channels[channel];

    if (ch.reconnectTimer) {
      clearTimeout(ch.reconnectTimer);
      ch.reconnectTimer = null;
    }

    if (ch.eventSource) {
      ch.eventSource.close();
      ch.eventSource = null;
    }

    ch.reconnectAttempts = 0;
    this.setChannelState(channel, 'disconnected');
  }

  /**
   * Disconnect all channels (e.g. on host change or unmount)
   */
  public disconnectAll(): void {
    this.disconnect('metrics');
    this.disconnect('processes');
  }

  /**
   * Reconnect all active channels (e.g. after changing base URL in Settings)
   */
  public reconnectAll(): void {
    const metricsSubscribers = this.channels.metrics.subscribers.size;
    const procSubscribers = this.channels.processes.subscribers.size;

    this.disconnectAll();

    if (metricsSubscribers > 0) {
      this.connect('metrics');
    }
    if (procSubscribers > 0) {
      this.connect('processes');
    }
  }

  private setChannelState(channel: StreamChannel, state: StreamConnectionState): void {
    const ch = this.channels[channel];
    ch.connectionState = state;
    ch.subscribers.forEach((sub) => {
      if (sub.onStateChange) sub.onStateChange(state);
    });
  }

  public getConnectionState(channel: StreamChannel): StreamConnectionState {
    return this.channels[channel].connectionState;
  }
}

// Export singleton instance
export const streamManager = new StreamManager();
