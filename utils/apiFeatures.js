class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedParams = ['sort', 'page', 'limit'];
    excludedParams.forEach(el => delete queryObj[el]);

    // advanced filtering for greater than and less than
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)/g, match => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const queries = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(queries);
    } else {
      this.query = this.query.sort('title');
    }
    return this;
  }

  paginate() {
    // calculate the skip value based on page and limit
    const { page, limit } = this.queryString;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
