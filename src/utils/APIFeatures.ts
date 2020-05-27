import { DocumentQuery, Query } from 'mongoose';
import { IUserAccount } from '../models/userAccountModel';
import { ISuperAdmin } from '../models/superAdminModel';

interface QueryString {
  page: number;
  sort: string;
  limit: number;
  fields: string;
  [index: string]: string | number;
}
export default class APIFeatures<T extends IUserAccount | ISuperAdmin> {
  constructor(
    public query: DocumentQuery<Array<T>, T>,
    public queryString: QueryString,
  ) {}

  filter() {
    const queryObj = { ...this.queryString };
    const excludeList = ['page', 'sort', 'limit', 'fields'];
    excludeList.forEach(el => delete queryObj[el]);

    // console.log(req.query);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      // console.log(sortBy);
    } else {
      this.query.sort('-lastModifiedAt -modifiedAt -createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1;
    const limit = this.queryString.limit * 1;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);
    return this;
  }
}
