/**
 * REAPER HTTP Bridge
 * Direct communication with REAPER's built-in web interface
 * No bridge server required - talks directly to REAPER's HTTP API
 */

export interface REAPERBridgeConfig {
  host: string;           // 'localhost' or IP address
  port: number;           // 8080 (default)
  username?: string;      // Optional auth
  password?: string;      // Optional auth
  timeout: number;        // Request timeout in ms
  retryAttempts: number;  // Number of retry attempts
}

export interface REAPERMarker {
  name: string;
  id: number;
  position: number;
  color?: number;
}

export interface REAPERRegion {
  name: string;
  id: number;
  startPosition: number;
  endPosition: number;
  color?: number;
}

export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  position: number;
}

const DEFAULT_CONFIG: REAPERBridgeConfig = {
  host: 'localhost',
  port: 8080,
  timeout: 5000,
  retryAttempts: 3,
};

export class REAPERHTTPBridge {
  private config: REAPERBridgeConfig;
  private baseUrl: string;
  private isConnected: boolean = false;

  constructor(config: Partial<REAPERBridgeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.baseUrl = this.buildBaseUrl();
  }

  private buildBaseUrl(): string {
    const { host, port, username, password } = this.config;

    if (username && password) {
      return `http://${username}:${password}@${host}:${port}`;
    }

    return `http://${host}:${port}`;
  }

  // ===== CONNECTION =====

  async connect(): Promise<boolean> {
    try {
      const response = await this.request('TRANSPORT');
      this.isConnected = true;
      console.log('Connected to REAPER via HTTP');
      return true;
    } catch (error) {
      this.isConnected = false;
      console.error('Failed to connect to REAPER:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('Disconnected from REAPER');
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // ===== CORE REQUEST METHOD =====

  private async request(command: string, retries = 0): Promise<string> {
    const url = `${this.baseUrl}/_/${encodeURIComponent(command)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`REAPER request failed: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      if (retries < this.config.retryAttempts) {
        console.warn(
          `Request failed, retrying (${retries + 1}/${this.config.retryAttempts})...`
        );
        await this.delay(1000 * (retries + 1)); // Exponential backoff
        return this.request(command, retries + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ===== TRANSPORT CONTROL =====

  async play(): Promise<void> {
    await this.request('1007');
  }

  async pause(): Promise<void> {
    await this.request('1008');
  }

  async stop(): Promise<void> {
    await this.request('1016');
  }

  async record(): Promise<void> {
    await this.request('1013');
  }

  async getTransportState(): Promise<TransportState> {
    const response = await this.request('TRANSPORT');
    const parts = response.split('\t');

    return {
      isPlaying: parts[2] === '1',
      isRecording: parts[3] === '1',
      position: parseFloat(parts[4] || '0'),
    };
  }

  async setEditCursorPosition(position: number): Promise<void> {
    await this.request(`SET/POS/${position}`);
  }

  // ===== MARKERS & REGIONS =====

  async getMarkers(): Promise<REAPERMarker[]> {
    const response = await this.request('MARKER_LIST');
    return this.parseMarkerList(response);
  }

  async getRegions(): Promise<REAPERRegion[]> {
    const response = await this.request('REGION_LIST');
    return this.parseRegionList(response);
  }

  private parseMarkerList(response: string): REAPERMarker[] {
    const lines = response.split('\n');
    const markers: REAPERMarker[] = [];

    for (const line of lines) {
      if (!line.startsWith('MARKER\t')) continue;

      const parts = line.split('\t');
      markers.push({
        name: parts[1],
        id: parseInt(parts[2]),
        position: parseFloat(parts[3]),
        color: parts[4] ? parseInt(parts[4], 16) : undefined,
      });
    }

    return markers;
  }

  private parseRegionList(response: string): REAPERRegion[] {
    const lines = response.split('\n');
    const regions: REAPERRegion[] = [];

    for (const line of lines) {
      if (!line.startsWith('REGION\t')) continue;

      const parts = line.split('\t');
      regions.push({
        name: parts[1],
        id: parseInt(parts[2]),
        startPosition: parseFloat(parts[3]),
        endPosition: parseFloat(parts[4]),
        color: parts[5] ? parseInt(parts[5], 16) : undefined,
      });
    }

    return regions;
  }

  // ===== PROJECT EXTENDED STATE (for chord data) =====

  async setProjectExtState(
    section: string,
    key: string,
    value: string
  ): Promise<void> {
    const encodedValue = encodeURIComponent(value);
    await this.request(`SET/PROJEXTSTATE/${section}/${key}/${encodedValue}`);
  }

  async getProjectExtState(section: string, key: string): Promise<string> {
    const response = await this.request(`GET/PROJEXTSTATE/${section}/${key}`);
    const parts = response.split('\t');
    // Response format: PROJEXTSTATE \t project \t section \t key \t value
    return parts[4] ? decodeURIComponent(parts[4]) : '';
  }

  // ===== ACTIONS (ReaScript commands) =====

  async executeAction(actionId: number | string): Promise<void> {
    await this.request(`ACTION/${actionId}`);
  }

  async getActionState(actionId: number | string): Promise<number> {
    const response = await this.request(`CMDSTATE/${actionId}`);
    const parts = response.split('\t');
    // Response format: CMDSTATE \t project \t actionId \t state
    return parseInt(parts[3] || '0');
  }

  // ===== UNDO =====

  async beginUndoBlock(): Promise<void> {
    await this.request('SET/UNDO_BEGINBLOCK');
  }

  async endUndoBlock(description: string): Promise<void> {
    await this.request(`SET/UNDO_ENDBLOCK/${encodeURIComponent(description)}`);
  }

  // ===== TRACK OPERATIONS =====

  async getTrackProperty(trackIndex: number, property: string): Promise<string> {
    const response = await this.request(`GET/TRACK/${trackIndex}/${property}`);
    return response;
  }

  async setTrackProperty(
    trackIndex: number,
    property: string,
    value: string
  ): Promise<void> {
    const encodedValue = encodeURIComponent(value);
    await this.request(`SET/TRACK/${trackIndex}/${property}/${encodedValue}`);
  }
}

// Create singleton instance
export const reaperHTTPBridge = new REAPERHTTPBridge();
