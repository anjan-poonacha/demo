import { RequestHandler, Request, Response, NextFunction } from 'express';
import { ISuperAdmin } from '../models/superAdminModel';
import { IUserAccount } from '../models/userAccountModel';

export interface IRequestUser {
  _id: string;
  role: string;
  facilityType: string;
  facilityArea: string;
  ministry: string;
  email: string;
  firstName: string;
}

declare module 'express' {
  export interface Request {
    user?: ISuperAdmin | IUserAccount;
  }
}

export default (fn: RequestHandler | Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
