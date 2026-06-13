// const asyncHandler = (fn) =>
//   async (req, res, next) => {
//     try {
//       await fn(req, res, next);
//     } catch (error) {
//       next(error);
//     }
//   };

import { Request, Response, NextFunction } from "express";

// export default asyncHandler;

const asyncHandler = (fn: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        }
        catch (error) {
            next(error);
        }


    }

}
export default asyncHandler;
// const asyncHandler2 =(fn)=>{
//     Promise.resolve(fn(req,res,next)).catch(next)

// }