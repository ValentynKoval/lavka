/**
 * Error with a dictionary key instead of a human string, so the UI can show it
 * in the visitor's language. Thrown by repositories, translated in server actions.
 */
export class AppError extends Error {
  readonly key: string;
  readonly vars?: Record<string, string | number>;

  constructor(key: string, vars?: Record<string, string | number>) {
    super(key);
    this.name = "AppError";
    this.key = key;
    this.vars = vars;
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError || (typeof e === "object" && e !== null && (e as { name?: string }).name === "AppError");
}
