import { describe, it, expect } from 'vitest';
import { omitUndefined } from '@shared/record-utils.js';

describe('omitUndefined', () => {
  it('removes undefined values', () => {
    const result = omitUndefined({ a: 1, b: undefined, c: 'hello' });
    expect(result).toEqual({ a: 1, c: 'hello' });
  });

  it('keeps null values', () => {
    const result = omitUndefined({ a: null, b: undefined });
    expect(result).toEqual({ a: null });
  });

  it('keeps false and zero', () => {
    const result = omitUndefined({ a: false, b: 0, c: '' });
    expect(result).toEqual({ a: false, b: 0, c: '' });
  });

  it('returns empty object for all undefined', () => {
    const result = omitUndefined({ a: undefined, b: undefined });
    expect(result).toEqual({});
  });

  it('returns same object when nothing to omit', () => {
    const input = { a: 1, b: 'two', c: true };
    const result = omitUndefined(input);
    expect(result).toEqual(input);
  });

  it('handles empty object', () => {
    expect(omitUndefined({})).toEqual({});
  });
});
