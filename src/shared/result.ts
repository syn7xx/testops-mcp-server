/** Success or failure without throwing. */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/** Wrap value as success. */
export const success = <T>(value: T): Result<T, never> => ({ ok: true, value });

/** Wrap error as failure. */
export const failure = <E = Error>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

/** True if result is success. */
export const isSuccess = <T, E>(
  result: Result<T, E>
): result is { ok: true; value: T } => result.ok === true;

/** Map success value. */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> => (isSuccess(result) ? success(fn(result.value)) : result);

/** Run async work and capture errors as Result. */
export const tryCatch = async <T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> => {
  try {
    const value = await fn();
    return success(value);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
};
