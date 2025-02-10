"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const activitySchema = new mongoose_1.default.Schema({
    name: String,
    actual: Boolean, //to keep in memory but dont show on the user desktop
    pending: { start: Number, end: Number },
    activityByYear: Array, //[{yearNumber:{total:143,month:[{monthNumber:{total:12,week:[{weekNumber:{total:3,day:[{dayNumber:{total:1, start:17,end:18}}]}}]}}]
});
const UserSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true },
    token: String,
    email: String,
    hash: { type: String },
    salt: { type: String },
    Actitvities: [activitySchema],
});
exports.UserModel = mongoose_1.default.model("User", UserSchema);
//# sourceMappingURL=User.js.map