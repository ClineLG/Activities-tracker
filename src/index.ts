import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());

require("dotenv").config();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

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
  console.log("server Started");
});
