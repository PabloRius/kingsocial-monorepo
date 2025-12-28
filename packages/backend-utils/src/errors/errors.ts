export class APIError extends Error {
  public readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class ValidationError extends APIError {
  public readonly details: Record<string, string>;
  public readonly name: string;
  constructor(
    message: string,
    status: number,
    details: Record<string, string>
  ) {
    super(message, status);
    this.name = "ValidationError";
    this.details = details;
  }
}
