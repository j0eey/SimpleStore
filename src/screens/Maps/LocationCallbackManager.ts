import { LocationType } from '../../types/types';

type LocationCallback = (location: LocationType) => void;

class LocationCallbackManager {
  private callbacks: Map<string, LocationCallback> = new Map();

  register(id: string, callback: LocationCallback): void {
    this.callbacks.set(id, callback);
  }

  unregister(id: string): void {
    this.callbacks.delete(id);
  }

  call(id: string, location: LocationType): void {
    const callback = this.callbacks.get(id);
    if (callback) {
      callback(location);
    }
  }
}

export const locationCallbackManager = new LocationCallbackManager();