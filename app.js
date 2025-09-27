// api/index.js
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const routeNavigator = require("../src/routes");
const { errorMiddleware } = require("../src/middleware/errorMiddleware");

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use("/public", express.static(`${__dirname}/../public`));
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
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
    optionSuccessStatus: 200,
  })
);

// Routes
app.use("/", routeNavigator);

// Error handling
app.use(errorMiddleware);

// Export sebagai handler untuk Vercel
module.exports = app;
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
