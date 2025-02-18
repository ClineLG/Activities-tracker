"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const calculateToMinutes_1 = __importDefault(require("./calculateToMinutes"));
const pendingAndActivitiesTrack = (activityArr, ActitvitiesNameAndStatus) => {
    const pending = ActitvitiesNameAndStatus.filter((activity) => activity.pending).map((activity) => {
        return {
            id: activity._id.toString(),
            name: activity.name,
            time: (0, calculateToMinutes_1.default)(Date.now(), activity.pending.time),
        };
    });
    const allAndPending = [...activityArr, ...pending];
    const grouped = allAndPending.reduce((acc, activity) => {
        if (acc[activity.id]) {
            acc[activity.id].time += activity.time;
        }
        else {
            acc[activity.id] = { ...activity };
        }
        return acc;
    }, {});
    const result = [];
    for (const key in grouped) {
        result.push(grouped[key]);
    }
    return result;
};
exports.default = pendingAndActivitiesTrack;
//# sourceMappingURL=pendingAndActivitiesTrack.js.map