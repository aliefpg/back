// src/app.js
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const routeNavigator = require("./routes");
const { errorMiddleware } = require("./middleware/errorMiddleware");

require("dotenv").config();

const app = express();

// Body parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Logging
app.use(morgan("dev"));

// Static
app.use("/public", express.static(`${__dirname}/public`));

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200, // fix typo sebelumnya
}));

// Routes
app.use("/", routeNavigator);

// Error middleware
app.use(errorMiddleware);

module.exports = app;
