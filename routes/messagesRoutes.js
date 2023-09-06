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

/// Route GET pour récupérer les messages d'un utilisateur ///
router.get("/api/messages/:pseudo", (req, res) => {
  const userPseudo = req.params.pseudo;
  const query = "SELECT * FROM messages WHERE pseudo = ? ";
  db.query(query, [userPseudo], (error, results) => {
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

/// Route update pour ajouter un like au message ///
router.put("/api/messages/:messageId/like", (req, res) => {
  const messageId = req.params.messageId;

  const incrementLikesQuery = "UPDATE messages SET likes_count = likes_count + 1 WHERE id = ?";
  
  db.query(incrementLikesQuery, [messageId], (err, results) => {
    if (err) {
      console.error("Erreur lors de l'incrémentation des likes : " + err.message);
      res.status(500).json({ error: "Erreur lors de l'incrémentation des likes." });
    } else {
      res.status(200).json({ message: "Like ajouté avec succès." });
    }
  });
});

module.exports = router;
