export function paginate(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

export function paginatedResponse<T>(data: T[], total: number, page: number = 1, limit: number = 10) {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
