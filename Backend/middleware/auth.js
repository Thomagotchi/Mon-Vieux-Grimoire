const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Récupére le token
    const token = req.headers.authorization.split(" ")[1];
    // Décode le token avec la clé secrète
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    // Récupére l'ID de l'utilisateur
    const userId = decodedToken.userId;

    // Renvoie l'ID de l'utilisateur
    req.auth = {
      userId: userId,
    };

    // Passe au prochain middleware
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
