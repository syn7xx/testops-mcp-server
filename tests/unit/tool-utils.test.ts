import { describe, it, expect } from 'vitest';
import { handleResult } from '@presentation/tool-utils.js';
import { success, failure } from '@shared/result.js';

describe('handleResult', () => {
  it('returns JSON stringified value for success', () => {
    const result = handleResult(success({ id: 1, name: 'test' }));
    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(JSON.parse(result.content[0].text)).toEqual({ id: 1, name: 'test' });
  });

  it('returns error response for failure', () => {
    const result = handleResult(failure(new Error('something went wrong')));
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error: something went wrong');
  });

  it('pretty-prints nested JSON', () => {
    const result = handleResult(success({ nested: { deep: true } }));
    // Should contain newlines for pretty print
    expect(result.content[0].text).toContain('\n');
    expect(JSON.parse(result.content[0].text)).toEqual({
      nested: { deep: true },
    });
  });

  it('handles empty object', () => {
    const result = handleResult(success({}));
    expect(JSON.parse(result.content[0].text)).toEqual({});
  });

  it('handles null value', () => {
    const result = handleResult(success(null));
    expect(result.content[0].text).toBe('null');
  });
});
