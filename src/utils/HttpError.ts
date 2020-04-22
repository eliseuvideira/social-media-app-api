export class HttpError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const isHttpError = <T extends { message: string; status?: number }>(
  err: HttpError | T,
): err is HttpError => {
  return (
    err instanceof HttpError ||
    (err.status !== undefined &&
      typeof err.status === 'number' &&
      err.message !== undefined &&
      typeof err.message === 'string')
  );
};
