/**
 * API Events - Event emitter for centralized API response handling
 * This allows the httpClient to communicate with React components
 * for showing toasts and handling logout without tight coupling
 */

type EventCallback = (data?: any) => void;

class ApiEventEmitter {
  private listeners: Record<string, EventCallback[]> = {};

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    };
  }

  emit(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  off(event: string, callback: EventCallback): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }
}

export const apiEvents = new ApiEventEmitter();

// Event types
export const API_EVENTS = {
  UNAUTHORIZED: "UNAUTHORIZED", // 401 - triggers logout
  FORBIDDEN: "FORBIDDEN", // 403 - access denied toast
  SERVER_ERROR: "SERVER_ERROR", // 500 - server error toast
  NETWORK_ERROR: "NETWORK_ERROR", // Network failures
} as const;

