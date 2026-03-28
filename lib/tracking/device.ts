const DEVICE_STORAGE_KEY = 'device_id';

export function getStoredTrackingDeviceId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(DEVICE_STORAGE_KEY);
}

export function setStoredTrackingDeviceId(deviceId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
}

export function createClientTrackingDeviceId(): string {
  return `device-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export function ensureStoredTrackingDeviceId(): string {
  const existingDeviceId = getStoredTrackingDeviceId();
  if (existingDeviceId) {
    return existingDeviceId;
  }

  const deviceId = createClientTrackingDeviceId();
  setStoredTrackingDeviceId(deviceId);
  return deviceId;
}
