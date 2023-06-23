const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const usersRouter = require("./routes/usersRoutes");
const messagesRouter = require("./routes/messagesRoutes");
const commentsRouter = require("./routes/commentsRoutes");
require("dotenv").config();

const bodyParser = require("body-parser");

const port = 5432;
const app = express();

app.use(cors());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(usersRouter);
app.use(messagesRouter);
app.use(commentsRouter);


const db = mysql.createConnection({
  host: "dpg-ciamvi15rnupq1p4q0j0-a",
  port : 5432,
  user: "root",
  password: "7NmBvXv9b9Vt2KD77IV7N3IFPf4OXS8G",
  database: "raconte_ta_ba",
});

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
