const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const db = require("./src/config/db.config");
const { errorMiddleware } = require("./src/middleware/errorMiddleware");
const routeNavigator = require("./src/routes");
//ADD

const app = express();
require("dotenv").config();

// CORS middleware FIRST
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
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    credentials: true,
    optionSuccessStatus: 200,
  })
);

// Global OPTIONS handler for preflight
app.options("*", cors());


app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use("/public", express.static(${__dirname}/public));
app.use(morgan("dev"));


// Database connection test route for debugging
app.get('/db-test', async (req, res) => {
  try {
    const pool = require('./src/config/db.config');
    const [rows] = await pool.query('SELECT 1');
    res.json({ success: true, result: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use("/", routeNavigator);


app.get('/', async (req, res) => {
  res.send('Backend is running!');
});


app.use(errorMiddleware);

module.exports=app;