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
  const { title, content, user_id } = req.body;

  // Vérifier si le contenu du message et l'ID de l'utilisateur sont présents
  if (!title || !content || !user_id) {
    return res.status(400).json({
      message: "Le contenu du message et l'ID de l'utilisateur sont requis.",
    });
  }

  // Requête SQL pour insérer un nouveau message dans la base de données
  const query =
    "INSERT INTO messages (title, content, user_id) VALUES (?, ?, ?)";
  const values = [title, content, user_id];

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
