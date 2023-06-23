const express = require("express");
const router = express.Router();
const mysql = require("mysql");

const db = mysql.createConnection({
  host: "dpg-ciamvi15rnupq1p4q0j0-a",
  port : 5432,
  user: "root",
  password: "7NmBvXv9b9Vt2KD77IV7N3IFPf4OXS8G",
  database: "raconte_ta_ba",
});

/// Route POST pour poster une BA  ///
router.post("/api/messages", (req, res) => {
  const { title, pseudo, created_at, content } = req.body;

  // Vérifier si le contenu du message et l'ID de l'utilisateur sont présents
  if (!title || !pseudo || !created_at || !content) {
    return res.status(400).json({
      message: "Tous les champs doivent être remplis",
    });
  }

  // Requête SQL pour insérer un nouveau message dans la base de données
  const query =
    "INSERT INTO messages (title, pseudo, created_at, content) VALUES (?, ?, ?, ?)";
  const values = [title, pseudo, created_at, content];

  db.query(query, values, (error, result) => {
    if (error) {
      console.error("Erreur lors de la création du message :", error);
      return res.status(500).json({
        message: "Une erreur est survenue lors de la création du message.",
      });
    }

    // Le message a été créé avec succès
    return res
      .status(201)
      .json({ message: "Le message a été créé avec succès." });
  });
});
///

/// Route GET pour récupérer tout les messages  ///
router.get("/api/messages", (req, res) => {
  const query = "SELECT * FROM messages";
  db.query(query, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        message:
          "Une erreur s'est produite lors de la récupération des messages",
      });
      return;
    }
    res.status(200).json(results);
  });
});
///

/// Route DELETE pour supprimer un message  ///
router.delete("/api/messages/:id", (req, res) => {
  const messageId = req.params.id;

  // Requête SQL pour supprimer le message correspondant à l'ID spécifié
  const query = "DELETE FROM messages WHERE id = ?";

  db.query(query, messageId, (error, result) => {
    if (error) {
      console.error("Erreur lors de la suppression du message :", error);
      return res.status(500).json({
        message: "Une erreur est survenue lors de la suppression du message.",
      });
    }

    // Vérifier si un message a été supprimé avec succès
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Le message spécifié n'existe pas." });
    }

    // Le message a été supprimé avec succès
    return res.json({ message: "Le message a été supprimé avec succès." });
  });
});
///

module.exports = router;
