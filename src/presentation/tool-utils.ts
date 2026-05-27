import { isSuccess, type Result } from '@shared/result.js';

type ToolResponse = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

export function handleResult<T>(result: Result<T, Error>): ToolResponse {
  if (!isSuccess(result)) {
    return {
      content: [{ type: 'text', text: `Error: ${result.error.message}` }],
      isError: true,
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }],
  };
}
