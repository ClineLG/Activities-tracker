"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const activitySchema = new mongoose_1.default.Schema({
    name: String,
    actual: Boolean,
});
const UserSchema = new mongoose_1.default.Schema({
    username: String,
    token: String,
    email: String,
    hash: { type: String },
    salt: { type: String },
    ActitvitiesNameAndStatus: [activitySchema],
    ActivitiesByYear: Object,
    pending: [
    // { activityId: String, year: Number, week: Number, day: Number, time: Number },
    ],
});
exports.UserModel = mongoose_1.default.model("User", UserSchema);
//# sourceMappingURL=User.js.map