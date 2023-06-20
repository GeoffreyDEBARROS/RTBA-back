const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

// const db = mysql.createConnection({
//   host: "127.0.0.1",
//   user: "root",
//   password: "ROOT",
//   database: "raconte_ta_ba",
// });

const urlDB = process.env.RAILWAY_URL;

const db = mysql.createConnection(urlDB);

///   Route POST pour ajouter un utilisateur dans la base de données   ///
router.post("/api/users", (req, res) => {
  const { pseudo, mail, password } = req.body;
  const role = "member";

  // Vérifier que pseudo, mail et password sont renseignés
  if (!pseudo || !mail || !password) {
    res
      .status(400)
      .json({ error: "Veuillez renseigner tous les champs requis." });
    return;
  }

  // Vérifier que le mot de passe a au moins 8 caractères, avec au moins un chiffre et une majuscule
  const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      error:
        "Le mot de passe doit contenir au moins 8 caractères, avec au moins un chiffre et une majuscule",
    });
    return;
  }

  // Générer un sel pour le hachage du mot de passe
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error("Erreur lors de la génération du sel :", err);
      res.status(500).json({ error: "Erreur lors de la création du compte" });
      return;
    }

    // Hacher le mot de passe avec le sel généré
    bcrypt.hash(password, salt, (err, passwordHash) => {
      if (err) {
        console.error("Erreur lors du hachage du mot de passe :", err);
        res.status(500).json({ error: "Erreur lors de la création du compte" });
        return;
      }

      // Requête SQL pour ajouter l'utilisateur avec les champs hachés dans la base de données
      const sql = "INSERT INTO users (pseudo, mail, password) VALUES (?, ?, ?)";
      db.query(sql, [pseudo, mail, passwordHash], (err, result) => {
        if (err) {
          console.error("Erreur lors de l'ajout de l'utilisateur :", err);
          res
            .status(500)
            .json({ error: "Erreur lors de la création du compte" });
          return;
        }

        console.log("Utilisateur ajouté avec succès !");
        res.status(201).json({ message: "Compte créé avec succès." });
      });
    });
  });
});
///

///  Route pour le login d'un utilisateur  ///
router.post("/api/login", (req, res) => {
  const { mail, password } = req.body;

  // Vérifier si les champs mail et mot de passe sont fournis
  if (!mail || !password) {
    res.status(400).json({
      error: "Veuillez fournir une adresse email et un mot de passe.",
    });
    return;
  }

  // Rechercher l'utilisateur dans la base de données par mail
  const sql = "SELECT * FROM users WHERE mail = ?";
  db.query(sql, [mail], (err, results) => {
    if (err) {
      console.error("Erreur lors de la recherche de l'utilisateur :", err);
      res.status(500).json({ error: "Erreur lors de la connexion" });
      return;
    }

    // Vérifier si l'utilisateur existe
    if (results.length === 0) {
      res.status(401).json({ error: "Email ou mot de passe incorrect." });
      return;
    }

    const user = results[0];

    // Comparer le mot de passe fourni avec le mot de passe haché dans la base de données
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Erreur lors de la comparaison des mots de passe :", err);
        res.status(500).json({ error: "Erreur lors de la connexion" });
        return;
      }

      if (!isMatch) {
        res.status(401).json({ error: "Email ou mot de passe incorrect." });
        return;
      }

      // L'utilisateur est authentifié, générer un token JWT
      const token = jwt.sign({ userId: user.id, role: user.role }, secretKey, {
        expiresIn: "4h",
      });

      res.status(200).json({
        pseudo: user.pseudo,
        id: user.id,
        token,
      });
      console.log(`Utilisateur connecté`);
    });
  });
});
///

///  Route GET pour récupérer un membre par son ID  ///
router.get("/api/users/:id", (req, res) => {
  const usersId = req.params.id;
  const sql = "SELECT * FROM users WHERE id = ? ";
  db.query(sql, [usersId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'membre :", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération de l'membre" });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: "Membres non trouvé" });
      return;
    }
    const member = result[0];
    console.log("Membres récupéré avec succès :", member);
    res.json({ member });
  });
});
///

///   Route GET pour récupérer TOUS les membres dans la base de données   ///
router.get("/api/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Erreur lors de la récupération des membres:", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des membres" });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: "Membres non trouvé" });
      return;
    }
    const member = result;
    console.log("Membres récupéré avec succès");
    res.json({ member });
  });
});
///

///   Route DELETE pour supprimer un utilisateur par son ID dans la base de données   ///
router.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id; // Récupérer l'ID du client à partir des paramètres de la requête
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de  l'utilisateur:", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la suppression de l'utilisateur" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }
    console.log("Utilisateur supprimé avec succès. ID :", userId);
    res.json({ success: "Utilisateur supprimé avec succès" });
  });
});
///

///  Route PUT pour modifier les infos de l'utilisateur  ///
router.put("/api/users/:userId", (req, res) => {
  const userId = req.params.userId;
  const { pseudo, mail, password } = req.body;

  // Vérifier que l'utilisateur existe dans la base de données
  const userQuery = "SELECT * FROM users WHERE id = ?";
  db.query(userQuery, [userId], (err, rows) => {
    if (err) {
      console.error("Erreur lors de la recherche de l'utilisateur :", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la modification du compte" });
      return;
    }

    if (rows.length === 0) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    const user = rows[0];

    // Mettre à jour les informations de l'utilisateur
    if (pseudo) {
      // Mettre à jour le pseudo dans la base de données
      const updatePseudoQuery = "UPDATE users SET pseudo = ? WHERE id = ?";
      db.query(updatePseudoQuery, [pseudo, userId], (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour du pseudo :", err);
          res
            .status(500)
            .json({ error: "Erreur lors de la modification du compte" });
          return;
        }

        console.log("Pseudo mis à jour avec succès !");
        res.status(200).json({ message: "Pseudo mis à jour avec succès." });
      });
    }

    if (mail) {
      // Mettre à jour le mail dans la base de données
      const updateMailQuery = "UPDATE users SET mail = ? WHERE id = ?";
      db.query(updateMailQuery, [mail, userId], (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour du mail :", err);
          res
            .status(500)
            .json({ error: "Erreur lors de la modification du compte" });
          return;
        }

        console.log("Mail mis à jour avec succès !");
        res.status(200).json({ message: "Mail mis à jour avec succès." });
      });
    }

    if (password) {
      // Vérifier que le nouveau mot de passe a au moins 8 caractères, avec au moins un chiffre et une majuscule
      const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
      if (!passwordRegex.test(password)) {
        res.status(400).json({
          error:
            "Le nouveau mot de passe doit contenir au moins 8 caractères, avec au moins un chiffre et une majuscule",
        });
        return;
      }

      // Générer un nouveau sel pour le hachage du mot de passe
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.error("Erreur lors de la génération du sel :", err);
          res
            .status(500)
            .json({ error: "Erreur lors de la modification du compte" });
          return;
        }

        // Hacher le nouveau mot de passe avec le sel généré
        bcrypt.hash(password, salt, (err, passwordHash) => {
          if (err) {
            console.error("Erreur lors du hachage du mot de passe :", err);
            res
              .status(500)
              .json({ error: "Erreur lors de la modification du compte" });
            return;
          }

          // Mettre à jour le mot de passe dans la base de données
          const updatePasswordQuery =
            "UPDATE users SET password = ? WHERE id = ?";
          db.query(
            updatePasswordQuery,
            [passwordHash, userId],
            (err, result) => {
              if (err) {
                console.error(
                  "Erreur lors de la mise à jour du mot de passe :",
                  err
                );
                res
                  .status(500)
                  .json({ error: "Erreur lors de la modification du compte" });
                return;
              }

              console.log("Mot de passe mis à jour avec succès !");
              res
                .status(200)
                .json({ message: "Mot de passe mis à jour avec succès." });
            }
          );
        });
      });
    }

    // Si aucune information à mettre à jour n'est fournie
    if (!pseudo && !mail && !password) {
      res.status(400).json({ error: "Aucune information à mettre à jour" });
    }
  });
});
///

module.exports = router;
