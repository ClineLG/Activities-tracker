"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../src/models/User");
const isAuthenticated = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(404).json({ error: "Missing Token" });
    }
    const tokenTotest = req.headers.authorization.replace("Bearer ", "");
    const isTokenToSomeOne = await User_1.UserModel.findOne({
        token: tokenTotest,
    }).select("account");
    //   console.log(isTokenToSomeOne);
    if (!isTokenToSomeOne) {
        return res.status(400).json({ error: "wrong token" });
    }
    req.body.user = isTokenToSomeOne;
    next();
};
exports.default = isAuthenticated;
//# sourceMappingURL=isAuthenticated.js.map