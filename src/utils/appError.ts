class AppError extends Error {
  readonly isOperational: boolean;
  status: string;
  code?: string | number;
  constructor(message: string, public statusCode: number) {
    super(message);
    this.status = `${statusCode}`.startsWith(`4`) ? 'FAIL' : 'ERROR';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
