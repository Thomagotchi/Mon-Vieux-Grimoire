const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth');

const bookCtrl = require('../controllers/book')

router.post('/', auth, bookCtrl.createBook)
router.delete('/:id', auth, bookCtrl.deleteBook)
router.put('/:id', auth, bookCtrl.changeBook)
router.get('/:id', bookCtrl.getSingleBook)
router.get('/bestrating', bookCtrl.getBestBooks)
router.get('/', bookCtrl.getAllBooks)

module.exports = router