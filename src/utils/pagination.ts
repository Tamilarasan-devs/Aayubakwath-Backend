export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const parsePagination = (
  params: PaginationParams,
  defaultLimit: number = 10,
  maxLimit: number = 100
): { skip: number; take: number; page: number; limit: number } => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(maxLimit, Math.max(1, params.limit ?? defaultLimit));
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
};

export const createPaginatedResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> => {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
