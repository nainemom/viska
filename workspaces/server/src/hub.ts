/**
 * The online-session registry and message router, as a closure-backed factory
 * (no classes).
 *
 * An identity (address) may have exactly one connected device. Binding an
 * address replaces whatever was there; callers kick the old device first (see
 * the takeover flow in session.ts). Keyed entirely by address — the server
 * keeps no keys, since the address is the key.
 */

import type { ServerMsg } from './shared/index.ts';

/** The slice of a session the hub needs to route to and manage it. */
export interface Device {
  send(msg: ServerMsg): void;
  /** Server-initiated disconnect because another device took over. */
  kick(): void;
}

export interface Hub {
  online(address: string): boolean;
  deviceOf(address: string): Device | undefined;
  /** Register a device as the sole connection for `address`, replacing any prior. */
  bind(address: string, device: Device): void;
  /** Deregister `device` from `address`, but only if it is still current. */
  unbind(address: string, device: Device): void;
  /** Deliver to the address's one device. Returns false if it is offline. */
  deliver(address: string, msg: ServerMsg): boolean;
}

export function createHub(): Hub {
  const devices = new Map<string, Device>();

  return {
    online: (address) => devices.has(address),
    deviceOf: (address) => devices.get(address),

    bind(address, device) {
      devices.set(address, device);
    },

    unbind(address, device) {
      if (devices.get(address) === device) devices.delete(address);
    },

    deliver(address, msg) {
      const device = devices.get(address);
      if (!device) return false;
      device.send(msg);
      return true;
    },
  };
}
