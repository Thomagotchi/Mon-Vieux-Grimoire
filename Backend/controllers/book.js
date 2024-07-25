const Book = require("../models/book");
const fs = require("fs");

exports.createBook = (req, res) => {
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

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre ajouté!" });
    })
    .catch((error) => {
      res.status(403).json({ error });
    });
};

exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Pas autorisé de supprimé ce livre" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => {
              res.status(401).json({ error });
            });
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.updateBook = (req, res) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageURL: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        book
          .updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
          .then(() => res.status(200).json({ message: "Objet Modifié!" }))
          .catch((error) => {
            res.status(401).json({ error });
          });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getBookById = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getBestBooks = (req, res) => {
  Book.aggregate([
    {
      $group: {
        _id: "$_id",
        title: { $first: "$title" },
        averageRating: { $avg: "$ratings.grade" },
      },
    },
    {
      $sort: { averageRating: -1 },
    },
    {
      $limit: 3,
    },
  ])
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
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

  const hasRating = book.ratings.find((rating) => rating.userId === userId);
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
