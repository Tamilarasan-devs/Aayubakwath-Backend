export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: {
    code?: string;
    details?: unknown;
    stack?: string;
  };
}

export const successResponse = <T>(
  res: any,
  data: T,
  message?: string,
  statusCodeOrMeta?: number | ApiSuccessResponse<T>['meta'],
  maybeMeta?: ApiSuccessResponse<T>['meta']
): void => {
  const isStatusCode = typeof statusCodeOrMeta === 'number';
  const statusCode = isStatusCode ? statusCodeOrMeta : 200;
  const meta = isStatusCode ? maybeMeta : statusCodeOrMeta;

  res.status(statusCode).json({
    success: true,
    data,
    message,
    meta,
  } as ApiSuccessResponse<T>);
};

export const errorResponse = (
  res: any,
  message: string,
  statusCode: number = 500,
  details?: unknown
): void => {
  const response: ApiErrorResponse = {
    success: false,
    message,
  };

  if (details) {
    response.error = { details };
  }

  res.status(statusCode).json(response);
};
