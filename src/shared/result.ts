/**
 * Result type for explicit error handling without exceptions
 * @typeParam T - Success value type
 * @typeParam E - Error type (default: Error)
 */
export type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };

/** Creates a successful Result */
export const success = <T>(value: T): Result<T, never> => ({ ok: true, value });

/** Creates a failed Result */
export const failure = <E = Error>(error: E): Result<never, E> => ({ ok: false, error });

/** Type guard to check if Result is successful */
export const isSuccess = <T, E>(result: Result<T, E>): result is { ok: true; value: T } =>
    result.ok === true;

/** Type guard to check if Result is failed */
export const isFailure = <T, E>(result: Result<T, E>): result is { ok: false; error: E } =>
    result.ok === false;

/** Unwraps Result, throws error if failed */
export const unwrap = <T, E>(result: Result<T, E>): T => {
    if (isSuccess(result)) {
        return result.value;
    }
    throw result.error;
};

/** Returns value if success, otherwise returns defaultValue */
export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T =>
    isSuccess(result) ? result.value : defaultValue;

/** Transforms the success value */
export const map = <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
    isSuccess(result) ? success(fn(result.value)) : result;

/** Transforms the error value */
export const mapError = <T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> =>
    isFailure(result) ? failure(fn(result.error)) : result;

/** Chains Result-returning functions - flatMap pattern */
export const flatMap = <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> =>
    isSuccess(result) ? fn(result.value) : result;

/** Wraps async function to return Result instead of throwing */
export const tryCatch = async <T>(fn: () => Promise<T>): Promise<Result<T, Error>> => {
    try {
        const value = await fn();
        return success(value);
    } catch (error) {
        return failure(error instanceof Error ? error : new Error(String(error)));
    }
};
