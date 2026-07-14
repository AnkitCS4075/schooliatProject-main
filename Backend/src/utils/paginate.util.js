const getPaginationParams = (req) => {
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const skip = (pageNumber - 1) * pageSize;

  // Returning object is based on the params required by Prisma
  return { skip, take: pageSize };
};

const paginateUtil = {
  getPaginationParams,
};

export default paginateUtil;
