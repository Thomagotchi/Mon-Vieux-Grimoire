const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signup = async (req, res) => {
  try {
    // Si l'email est déja enregistrer, r'envoie une erreur
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Une erreur est survenue pendant la création de votre compte, réessayer avec une autre adresse mail et mot de passe !",
      });
    }

    if (!req.body.password) {
      return res
        .status(400)
        .json({ message: "Veuillez ajouter un mot de passe !" });
    }

    // Hasher le mot de passe
    const password = await bcrypt.hash(req.body.password, 10);
    // Crée un nouveau utilisateur
    const user = new User({
      email: req.body.email,
      password: password,
    });

    // Sauvegarde le nouveau utilisateur dans la base de données
    user.save();
    return res.status(201).json({ message: "Utilisateur créé !" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.login = async (req, res) => {
  try {
    // Vérifie si l'utilisateur existe dans la base de donnée
    const existingUser = await User.findOne({ email: req.body.email });

    // si l'utilisateur n'existe pas dans la base de donnée cela renvoie une erreur
    if (!existingUser) {
      return res
        .status(411)
        .json({ message: "Votre email ou mot de passe est incorrect !" });
    }

    // Vérifie si le mot de passe hasher et identique sinon renvoie une erreur
    const checkPassword = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );

    if (!checkPassword) {
      return res
        .status(411)
        .json({ message: "Votre email ou mot de passe est incorrect !" });
    }

    return res.status(200).json({
      userId: existingUser._id,
      token: jwt.sign({ userId: existingUser._id }, "RANDOM_TOKEN_SECRET", {
        expiresIn: "24h",
      }),
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
