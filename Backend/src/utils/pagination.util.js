/**
 * Normalize pagination options from query (strings or numbers) to integers.
 * Prisma requires skip/take as integers; query params are often strings.
 * @param {Object} options - { page, limit }
 * @param {{ maxLimit?: number }} config - optional, maxLimit defaults to 100
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function parsePagination(options = {}, config = {}) {
  const maxLimit = config.maxLimit ?? 100;
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
