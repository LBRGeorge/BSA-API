/**
 * @typedef PaginationOption
 * @property {Array} docs
 * @property {Number} totalDocs
 * @property {Number} limit
 * @property {Number} totalPages
 * @property {Number} page
 * @property {String} nextPage
 * @property {String} prevPage
 */

/**
 * @typedef Pagination
 * @property {Array} *
 * @property {Number} total
 * @property {Number} limit
 * @property {Number} pages
 * @property {Number} currentPage
 * @property {String} nextPage
 * @property {String} prevPage
 */

/**
 * 
 * @param {String} name 
 * @param {PaginationOption} options 
 * @returns {Pagination}
 */
const parser = (name, options) => {
  const { 
    docs,
    totalDocs: total,
    limit,
    totalPages: pages,
    page: currentPage,
    prevPage,
    nextPage
  } = options

  return {
    [name]: docs,
    total,
    limit,
    pages,
    currentPage,
    prevPage,
    nextPage
  }
}

module.exports = parser
