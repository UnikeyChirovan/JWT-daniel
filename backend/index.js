const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const redisClient = require("./redisConnect")
dotenv.config();

redisClient.on("connect", () => {
});

mongoose.connect(process.env.MONGODB_URL, () => {
  console.log("CONNECTED TO MONGO DB");
});
app.use(cors());
app.use(cookieParser());
app.use(express.json());

//ROUTES
app.use("/v1/auth", authRoute);//(post)
app.use("/v1/user", userRoute);//(get)

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running is port ${PORT}`);
});
