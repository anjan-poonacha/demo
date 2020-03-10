import { RequestHandler, Request, Response, NextFunction } from 'express';

declare module 'express' {
  export interface Request {
    user?: any;
  }
}

export default (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
