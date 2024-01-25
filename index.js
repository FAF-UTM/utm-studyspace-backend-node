const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./Routes/AuthRouters");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();

app.listen(4000, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Server Started Successfully.");
    }
});

mongoose
    .connect(process.env.MONGO_URL, {
       // useNewUrlParser: true,
      //  useUnifiedTopology: true,
    })
    .then(() => {
        console.log("DB Connetion Successfull");
    })
    .catch((err) => {
        console.log(err.message);
    });

app.use(
    cors({
        origin: [process.env.FRONT_URL],
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(cookieParser());





app.use(express.json());
app.use("/", authRoutes);
