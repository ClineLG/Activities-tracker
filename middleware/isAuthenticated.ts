import { NextFunction, Request, Response } from "express";
import { UserModel } from "../src/models/User";

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    return res.status(404).json({ error: "Missing Token" });
  }

  const tokenTotest = req.headers.authorization.replace("Bearer ", "");
  const isTokenToSomeOne = await UserModel.findOne({
    token: tokenTotest,
  }).select("account");
  //   console.log(isTokenToSomeOne);
  if (!isTokenToSomeOne) {
    return res.status(400).json({ error: "wrong token" });
  }

  req.body.user = isTokenToSomeOne;
  next();
};

export default isAuthenticated;
