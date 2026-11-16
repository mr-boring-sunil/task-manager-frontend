/**
 * Raspberry Pi Device Discovery Service
 * Probes candidate hostnames, verifies backend health endpoints, and manages device selection.
 * Raspberry Pi Task Manager — Dashboard
 */

import { DiscoveredDevice } from '../types/auth';

const KNOWN_CANDIDATE_HOSTS = [
  'task-manager.local',
  'raspberrypi.local',
  'localhost',
  '127.0.0.1',
];

const DEFAULT_PORT = 5000;
const TIMEOUT_MS = 2500;
const SELECTED_DEVICE_KEY = 'rpi_taskmgr_selected_device';
const RECENT_DEVICES_KEY = 'rpi_taskmgr_recent_devices';

export class DeviceDiscoveryService {
  /**
   * Probe an endpoint URL with GET /health
   */
  async probeEndpoint(url: string, timeout = TIMEOUT_MS): Promise<{ healthy: boolean; uptime?: number; error?: string }> {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const healthUrl = `${cleanUrl}/health`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(healthUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        return { healthy: false, error: `HTTP ${res.status}` };
      }

      const json = await res.json();
      if (json.success === true && json.data && json.data.status === 'healthy') {
        return { healthy: true, uptime: json.data.uptime };
      }

      return { healthy: false, error: 'Invalid health signature' };
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        return { healthy: false, error: 'Connection timed out' };
      }
      return { healthy: false, error: err.message || 'Host unreachable' };
    }
  }

  /**
   * Discover available Raspberry Pi devices on local network / known hostnames
   */
  async discoverDevices(): Promise<DiscoveredDevice[]> {
    const candidates = new Set<string>();

    // 1. Add current window origin if available
    if (typeof window !== 'undefined' && window.location.hostname) {
      candidates.add(`${window.location.hostname}:${DEFAULT_PORT}`);
    }

    // 2. Add standard known mDNS and localhost hostnames
    KNOWN_CANDIDATE_HOSTS.forEach((host) => {
      candidates.add(`${host}:${DEFAULT_PORT}`);
    });

    // 3. Add previously connected custom devices
    const recent = this.getRecentDevices();
    recent.forEach((d) => {
      candidates.add(`${d.host}:${d.port}`);
    });

    const probePromises = Array.from(candidates).map(async (hostPort): Promise<DiscoveredDevice> => {
      const [host, portStr] = hostPort.split(':');
      const port = parseInt(portStr || String(DEFAULT_PORT), 10);
      const url = `http://${host}:${port}`;
      const name = host === 'localhost' || host === '127.0.0.1'
        ? 'Local SBC Server'
        : host.includes('task-manager')
        ? 'Task Manager SBC'
        : 'Raspberry Pi SBC';

      const check = await this.probeEndpoint(url);

      return {
        id: `dev_${host}_${port}`,
        name,
        host,
        port,
        url,
        status: check.healthy ? 'online' : 'offline',
        uptime: check.uptime,
        lastSeen: check.healthy ? new Date() : undefined,
        error: check.error,
      };
    });

    const results = await Promise.all(probePromises);
    return results;
  }

  /**
   * Verify single custom device host and port
   */
  async verifyCustomDevice(host: string, port = DEFAULT_PORT): Promise<DiscoveredDevice> {
    const cleanHost = host.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const cleanPort = port || DEFAULT_PORT;
    const url = `http://${cleanHost}:${cleanPort}`;

    const check = await this.probeEndpoint(url, 4000);

    const device: DiscoveredDevice = {
      id: `dev_${cleanHost}_${cleanPort}`,
      name: `Raspberry Pi (${cleanHost})`,
      host: cleanHost,
      port: cleanPort,
      url,
      status: check.healthy ? 'online' : 'offline',
      uptime: check.uptime,
      lastSeen: check.healthy ? new Date() : undefined,
      error: check.error,
    };

    if (check.healthy) {
      this.saveRecentDevice(device);
    }

    return device;
  }

  /**
   * Get currently selected device from localStorage (strictly non-sensitive)
   */
  getSelectedDevice(): DiscoveredDevice | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SELECTED_DEVICE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save selected device
   */
  setSelectedDevice(device: DiscoveredDevice): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      SELECTED_DEVICE_KEY,
      JSON.stringify({
        id: device.id,
        name: device.name,
        host: device.host,
        port: device.port,
        url: device.url,
      })
    );
    this.saveRecentDevice(device);
  }

  /**
   * Clear selected device
   */
  clearSelectedDevice(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SELECTED_DEVICE_KEY);
  }

  /**
   * Get recently connected devices
   */
  getRecentDevices(): DiscoveredDevice[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(RECENT_DEVICES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Add to recent devices list
   */
  private saveRecentDevice(device: DiscoveredDevice): void {
    if (typeof window === 'undefined') return;
    try {
      const recent = this.getRecentDevices().filter(
        (d) => !(d.host === device.host && d.port === device.port)
      );
      recent.unshift({
        id: device.id,
        name: device.name,
        host: device.host,
        port: device.port,
        url: device.url,
        status: device.status,
      });
      localStorage.setItem(RECENT_DEVICES_KEY, JSON.stringify(recent.slice(0, 5)));
    } catch {}
  }
}

export const deviceDiscoveryService = new DeviceDiscoveryService();
