"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
require("dotenv").config();
app.use(express_1.default.json());
mongoose_1.default.set("debug", true);
const connectToMongoDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            poolSize: 5,
        });
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB 🚀");
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error.message || error);
        process.exit(1);
    }
};
connectToMongoDB();
const userRoutes = require("./routes/user");
app.use("/user", userRoutes);
const activityRoutes = require("./routes/activity");
app.use("/activity", activityRoutes);
const activitiesRoute = require("./routes/activities");
app.use("/activities", activitiesRoute);
app.get("/", (req, res) => {
    res.status(201).json("welcom on the app");
});
app.listen(process.env.PORT, () => {
    console.log("server Started 🚀");
});
//# sourceMappingURL=index.js.map