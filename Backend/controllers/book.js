const Book = require("../models/book");
const fs = require("fs");
const path = require("path");

exports.createBook = (req, res) => {
  // Crée un object a partir du JSON
  const bookObject = JSON.parse(req.body.book);

  // Vérifie que la requête contient un fichier
  if (!req.file) {
    return res.status(400);
  } else {
    // Supprime les propriétés les IDs du livre par sécurité
    delete bookObject._id;
    delete bookObject._userId;

    const filename = req.file.filename;

    // Crée un nouveau livre
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get(
        "host"
      )}/images/resized_${filename}`,
    });

    try {
      // Sauvegarder le livre dans la base de données
      book.save();
      res.status(201).json({ message: "Livre enregistré" });
    } catch (error) {
      res.status(400).json({
        message: "Veuillez remplir tout les champs!",
      });
    }
  }
};

exports.deleteBook = async (req, res) => {
  // Trouve le livre correspondant dans la base de donnée
  const book = await Book.findOne({ _id: req.params.id });

  // Si l'utilisateur n'as pas crée le livre, empeche la suppression et renvoie une erreur
  if (book.userId != req.auth.userId) {
    return res
      .status(401)
      .json({ message: "Pas autorisé de supprimé ce livre" });
  }

  // Nom de l'image
  const filename = book.imageUrl.split("/images/")[1];

  // Suppression du fichier de l'image
  const imagePath = path.join(__dirname, "..", "images", `${filename}`);
  const resizedImagePath = path.join(
    __dirname,
    "..",
    "images",
    `resized_${filename}`
  );

  fs.unlink(imagePath, (error) => {
    if (error) {
      console.error("Erreur lors de la suppression de l'image :", error);
    }
  });

  fs.unlink(resizedImagePath, (error) => {
    if (error) {
      console.error("Erreur lors de la suppression de l'image :", error);
    }
  });

  try {
    // Supprime le livre de la base de données
    await Book.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: "Livre supprimé !" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.updateBook = async (req, res) => {
  try {
    // Trouve le livre correspondant dans la base de donnée
    const book = await Book.findOne({ _id: req.params.id });

    // Vérifie si le livre existe
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé !" });
    }

    // Vérifie si l'utilisateur a crée le livre sinon renvoie une erreur
    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: "Vous n'êtes pas autorisé !" });
    }

    const bookData = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };

    // Supprime l'ancienne image du livre quand l'image est modifié
    if (req.file && book.imageUrl) {
      deleteImage(book.imageUrl);
    }

    // Met à jour le livre dans la base de données
    await Book.updateOne({ _id: req.params.id }, { ...bookData });

    res.status(200).json({ message: "Livre modifié !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getBookById = async (req, res) => {
  try {
    // Trouve le livre correspondant dans la base de donnée
    const book = await Book.findOne({ _id: req.params.id });
    // Renvoie le livre
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ error });
  }
};

exports.getBestBooks = async (req, res) => {
  try {
    // 3 meilleurs livres agrégé
    const topBooks = await Book.aggregate([
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          author: { $first: "$author" },
          imageUrl: { $first: "$imageUrl" },
          year: { $first: "$year" },
          genre: { $first: "$genre" },
          averageRating: { $first: "$averageRating" },
        },
      },
      // Sort par meilleur note
      {
        $sort: { averageRating: -1 },
      },
      // 3 Livres
      {
        $limit: 3,
      },
    ]);

    // Renvoie les trois meilleurs livres en ordre
    return res.status(200).json(topBooks);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    // Cherche tout les livres dans la base de donnée
    const books = await Book.find();
    // Renvoie tout les livres
    return res.status(200).json(books);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

exports.createRating = async (req, res) => {
  // Trouve le livre correspondant dans la base de donnée
  const book = await Book.findOne({ _id: req.params.id });
  const userId = req.auth.userId;
  const rating = req.body.rating;

  // Vérifier si la requête contient une note
  if (rating > 5 || rating < 1) {
    return res.status(401).json({
      message: "Vouz n'avez pas donner de note valable pour ce livre!",
    });
  }

  // Ajouter la note à la liste des notes du livre et calculer la moyenne
  book.ratings.push({ userId, grade: rating });

  const bookGrades = book.ratings.map((rating) => rating.grade);

  const bookAverage =
    bookGrades.reduce(
      (totalGrade, currentGrade) => totalGrade + currentGrade,
      0
    ) / bookGrades.length;
  book.averageRating = Math.round(bookAverage);

  try {
    // Sauvegarde le nouveau Rating et nouvelle moyenne dans la base de donnée
    await book.save();
    return res.status(200).json(book);
  } catch (error) {
    return res.status(402).json({
      message: "Vouz n'avez pas donner de note valable pour ce livre!",
    });
  }
};
