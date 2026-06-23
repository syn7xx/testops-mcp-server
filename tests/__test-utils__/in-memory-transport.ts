import type { Transport, JSONRPCMessage } from '@modelcontextprotocol/server';

/**
 * In-memory pair of transports for testing MCP servers and clients.
 *
 * Creates two interconnected Transport instances that pass JSON-RPC messages
 * between each other in memory — no network, no stdio. Use one for the server,
 * the other for the client.
 *
 * @example
 * ```typescript
 * const [serverTransport, clientTransport] = createTransportPair();
 * await server.connect(serverTransport);
 * await client.connect(clientTransport);
 * ```
 */
export function createTransportPair(): [Transport, Transport] {
  let leftOnMessage: ((msg: JSONRPCMessage) => void) | undefined;
  let rightOnMessage: ((msg: JSONRPCMessage) => void) | undefined;
  let leftOnClose: (() => void) | undefined;
  let rightOnClose: (() => void) | undefined;
  let closed = false;

  const left = {} as Transport;
  const right = {} as Transport;

  // Left transport: sends to right's onmessage
  Object.defineProperties(left, {
    onmessage: {
      set(fn: ((msg: JSONRPCMessage) => void) | undefined) {
        if (fn) leftOnMessage = fn;
      },
      get() {
        return undefined;
      },
      enumerable: true,
      configurable: true,
    },
    onerror: {
      set() {},
      get() {
        return undefined;
      },
      enumerable: true,
      configurable: true,
    },
    onclose: {
      set(fn: (() => void) | undefined) {
        if (fn) leftOnClose = fn;
      },
      get() {
        return undefined;
      },
      enumerable: true,
      configurable: true,
    },
    start: {
      value: async () => {
        closed = false;
      },
      enumerable: true,
      configurable: true,
    },
    close: {
      value: async () => {
        closed = true;
        leftOnClose?.();
        rightOnClose?.();
      },
      enumerable: true,
      configurable: true,
    },
    send: {
      value: async (message: JSONRPCMessage) => {
        if (closed) return;
        await Promise.resolve();
        // Left sends → arrives at right
        rightOnMessage?.(message);
      },
      enumerable: true,
      configurable: true,
    },
  });

  // Right transport: sends to left's onmessage
  Object.defineProperties(right, {
    onmessage: {
      set(fn: ((msg: JSONRPCMessage) => void) | undefined) {
        if (fn) rightOnMessage = fn;
      },
      get() {
        return undefined;
      },
      enumerable: true,
      configurable: true,
    },
    onerror: {
      set() {},
      get() {
        return undefined;
      },
      enumerable: true,
      configurable: true,
    },
    onclose: {
      set(fn: (() => void) | undefined) {
        if (fn) rightOnClose = fn;
      },
      get() {
        return undefined;
      },
      enumerable: true,
      configurable: true,
    },
    start: {
      value: async () => {
        closed = false;
      },
      enumerable: true,
      configurable: true,
    },
    close: {
      value: async () => {
        closed = true;
        leftOnClose?.();
        rightOnClose?.();
      },
      enumerable: true,
      configurable: true,
    },
    send: {
      value: async (message: JSONRPCMessage) => {
        if (closed) return;
        await Promise.resolve();
        // Right sends → arrives at left
        leftOnMessage?.(message);
      },
      enumerable: true,
      configurable: true,
    },
  });

  return [left, right];
}
