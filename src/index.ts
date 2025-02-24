import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());

require("dotenv").config();

app.use(express.json());

mongoose.set("debug", true);

const connectToMongoDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 5,
    });
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB 🚀");
  } catch (error) {
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
