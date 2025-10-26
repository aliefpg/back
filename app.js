const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const db = require("./src/config/db.config");
const { errorMiddleware } = require("./src/middleware/errorMiddleware");
const routeNavigator = require("./src/routes");
const dbBackupRoute = require("./src/routes/db-backup");
//ADD
const app = express();
require("dotenv").config();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use("/public", express.static(`${__dirname}/public`));
app.use(morgan("dev"));
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    optionSuccessStatus: 200,
  })
);

app.use("/", routeNavigator);
app.use("/db-backup", dbBackupRoute);
app.use(errorMiddleware);

module.exports = app;