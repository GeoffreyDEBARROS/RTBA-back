const express = require("express");
const router = express.Router();
const mysql = require("mysql");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "ROOT",
  database: "raconte_ta_ba",
});

/// Route POST pour poster un commentaire  ///
router.post("/api/comments", (req, res) => {
  const { content, user_id, message_id } = req.body;

  // Vérifier si le contenu du commentaire et l'ID de l'utilisateur sont présents
  if (!content || !user_id || !message_id) {
    return res.status(400).json({
      message:
        "Le contenu du commentaire et l'ID de l'utilisateur sont requis.",
    });
  }

  // Requête SQL pour insérer un nouveau message dans la base de données
  const query = "INSERT INTO comments (content, user_id, message_id) VALUES (?, ?, ?)";
  const values = [content, user_id, message_id];

  db.query(query, values, (error, result) => {
    if (error) {
      console.error("Erreur lors de la création du commentaire :", error);
      return res.status(500).json({
        message: "Une erreur est survenue lors de la création du commentaire.",
      });
    }

    // Le commentaire a été créé avec succès
    return res
      .status(201)
      .json({ message: "Le commentaire a été créé avec succès." });
  });
});
///

/// Route DELETE pour supprimer un commentaire  ///
router.delete("/api/comments/:id", (req, res) => {
  const commentsId = req.params.id;

  // Requête SQL pour supprimer le commentaire correspondant à l'ID spécifié
  const query = "DELETE FROM comments WHERE id = ?";

  db.query(query, commentsId, (error, result) => {
    if (error) {
      console.error("Erreur lors de la suppression du commentaire :", error);
      return res.status(500).json({
        message: "Une erreur est survenue lors de la suppression du commentaire.",
      });
    }

    // Vérifier si un commentaire a été supprimé avec succès
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Le commentaire spécifié n'existe pas." });
    }

    // Le commentaire a été supprimé avec succès
    return res.json({ message: "Le commentaire a été supprimé avec succès." });
  });
});
///

module.exports = router;
