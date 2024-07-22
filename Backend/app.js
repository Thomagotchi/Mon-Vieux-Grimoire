const express = require('express');
const mongoose = require('mongoose');

const bookRoute = require('./routes/bookRouter')
const userRoute = require('./routes/userRouter')

mongoose.connect('mongodb+srv://admin:admin@mon-vieux-grimoire.gzech7n.mongodb.net/?retryWrites=true&w=majority&appName=mon-vieux-grimoire',
    { useNewUrlParser: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();
app.use(express.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    )
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    )
    next()
})



app.use('/api/auth', userRoute)
app.use('/api/books', bookRoute)

module.exports = app;