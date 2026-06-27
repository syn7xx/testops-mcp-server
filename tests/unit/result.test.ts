import { describe, it, expect } from 'vitest';
import {
  success,
  failure,
  isSuccess,
  map,
  tryCatch,
  type Result,
} from '@shared/result.js';

describe('Result ADT', () => {
  describe('success / failure', () => {
    it('creates a success result', () => {
      const r = success(42);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(42);
    });

    it('creates a failure result', () => {
      const err = new Error('boom');
      const r = failure(err);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toBe(err);
    });
  });

  describe('isSuccess', () => {
    it('returns true for success', () => {
      expect(isSuccess(success('hello'))).toBe(true);
    });

    it('returns false for failure', () => {
      expect(isSuccess(failure(new Error('nope')))).toBe(false);
    });

    it('narrows the type', () => {
      const result: Result<string> = success('test');
      if (isSuccess(result)) {
        // TypeScript: result.value is string
        expect(result.value.toUpperCase()).toBe('TEST');
      }
    });
  });

  describe('map', () => {
    it('transforms success value', () => {
      const r = map(success(10), (v) => v * 2);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(20);
    });

    it('passes through failure', () => {
      const err = new Error('fail');
      const r = map(failure(err), (v: number) => v * 2);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toBe(err);
    });
  });

  describe('tryCatch', () => {
    it('wraps successful async work', async () => {
      const r = await tryCatch(async () => 123);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(123);
    });

    it('captures thrown errors', async () => {
      const r = await tryCatch(async () => {
        throw new Error('async fail');
      });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.message).toBe('async fail');
    });

    it('wraps non-Error throws', async () => {
      const r = await tryCatch(async () => {
        throw 'string error';
      });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.message).toBe('string error');
    });
  });
});
