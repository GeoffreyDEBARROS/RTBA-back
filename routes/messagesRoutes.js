const express = require("express");
const router = express.Router();
const mysql = require("mysql");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "ROOT",
  database: "raconte_ta_ba",
});

/// Route POST pour poster une BA  ///
router.post("/api/messages", (req, res) => {
  const { content, user_id } = req.body;

  // Vérifier si le contenu du message et l'ID de l'utilisateur sont présents
  if (!content || !user_id) {
    return res.status(400).json({
      message: "Le contenu du message et l'ID de l'utilisateur sont requis.",
    });
  }

  // Requête SQL pour insérer un nouveau message dans la base de données
  const query = "INSERT INTO messages (content, user_id) VALUES (?, ?)";
  const values = [content, user_id];

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
