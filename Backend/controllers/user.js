const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signup = async (req, res) => {
  try {
    const password = await bcrypt.hash(req.body.password, 10);

    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déja utilisé !" });
    }

    const user = new User({
      email: req.body.email,
      password: password,
    });

    user.save();
    return res.status(201).json({ message: "Utilisateur créé !" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.login = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (!existingUser) {
      return res.status(412).json({ message: "Utilisateur non trouvé !" });
    }

    const checkPassword = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );

    if (!checkPassword) {
      return res.status(411).json({ message: "Mot de passe incorrect !" });
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
