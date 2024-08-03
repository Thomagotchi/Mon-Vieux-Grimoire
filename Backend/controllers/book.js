const Book = require("../models/book");
const fs = require("fs");

exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);

    delete bookObject._id;
    delete bookObject._userId;

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    });

    await book.save();
    return res.status(201).json({ message: "Livre ajouté!" });
  } catch (error) {
    return res.status(403).json({ error });
  }
};

exports.deleteBook = async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id });

  if (book.userId != req.auth.userId) {
    return res
      .status(401)
      .json({ message: "Pas autorisé de supprimé ce livre" });
  }

  // Nom de l'image
  const filename = book.imageUrl.split("/images/")[1];

  // Suppression du fichier de l'image
  fs.unlink(`images/${filename}`, (error) => {
    if (error) {
      console.log(error);
    }
  });

  try {
    await Book.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: "Livre supprimé !" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé !" });
    }

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

    if (req.file && book.imageUrl) {
      deleteImage(book.imageUrl);
    }

    await Book.updateOne({ _id: req.params.id }, { ...bookData });

    res.status(200).json({ message: "Livre modifié !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const oneBook = await Book.findOne({ _id: req.params.id });

    return res.status(200).json(oneBook);
  } catch (error) {
    return res.status(404).json({ error });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ error });
  }
};

exports.getBestBooks = async (req, res) => {
  try {
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
      {
        $sort: { averageRating: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    return res.status(200).json(topBooks);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    return res.status(200).json(books);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

exports.createRating = async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id });
  const userId = req.auth.userId;
  const rating = req.body.rating;

  if (rating > 5 || rating < 1) {
    return res.status(401).json({
      message: "Vouz n'avez pas donner de note valable pour ce livre!",
    });
  }

  const hasRating = await book.ratings.some(
    (rating) => rating.userId === userId
  );

  if (hasRating) {
    return res
      .status(401)
      .json({ message: "Vouz avez déjà envoyer une note pour ce livre!" });
  }

  book.ratings.push({ userId, grade: rating });

  const bookGrades = book.ratings.map((rating) => rating.grade);

  const bookAverage =
    bookGrades.reduce(
      (totalGrade, currentGrade) => totalGrade + currentGrade,
      0
    ) / bookGrades.length;
  book.averageRating = Math.round(bookAverage);

  try {
    await book.save();
    return res.status(200).json(book);
  } catch (error) {
    return res.status(401).json({ error });
  }
};
