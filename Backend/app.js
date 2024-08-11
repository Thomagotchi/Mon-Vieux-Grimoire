const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bookRouter = require("./routes/book");
const userRouter = require("./routes/user");
require("dotenv").config();

// Connexion à la base de données MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

// Utilisation du middleware pour traiter les données en format JSON
app.use(express.json());

// Configure les en-têtes CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Routes pour l'authentification, livres et images
app.use("/api/auth", userRouter);
app.use("/api/books", bookRouter);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
