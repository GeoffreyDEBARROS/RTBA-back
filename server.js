const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const usersRouter = require("./routes/usersRoutes");
const messagesRouter = require("./routes/messagesRoutes");
const commentsRouter = require("./routes/commentsRoutes");
require("dotenv").config();

const bodyParser = require("body-parser");

const port = 3001;
const app = express();

// app.use(cors());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(usersRouter);
app.use(messagesRouter);
app.use(commentsRouter);

const urlDB = process.env.RAILWAY_URL;

const whitelist = ["https://stellular-kringle-dc0805.netlify.app"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

const db = mysql.createConnection(urlDB);

// const db = mysql.createConnection({
//   host: "127.0.0.1",
//   user: "root",
//   password: "ROOT",
//   database: "raconte_ta_ba",
// });

// Connecter à la base de données
db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
    return;
  }
  console.log("Connecté à la base de données MySQL.");
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
