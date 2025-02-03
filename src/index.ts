import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());

require("dotenv").config();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

const userRoutes = require("./routes/user");
app.use(userRoutes);

app.get("/", (req, res) => {
  res.status(201).json("welcom on the app");
});

app.listen(3000, () => {
  console.log("server Started");
});
