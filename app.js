const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = new Sequelize('library_db', 'your_username', 'your_password', {
  host: 'localhost',
  dialect: 'mysql'
});

const app = express();

// Define models
const Book = sequelize.define('Book', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // ... other book attributes
});

const Transaction = sequelize.define('Transaction', {
  takenDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fine: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  // ... other transaction attributes
});

// Associations
Book.hasMany(Transaction);
Transaction.belongsTo(Book);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
  res.send('Library Management System');
});

// Route for submitting a book
app.post('/submit-book', async (req, res) => {
  try {
    const { bookName } = req.body;
    const newBook = await Book.create({ name: bookName });

    const transaction = await Transaction.create({
      takenDate: new Date(),
      BookId: newBook.id // Assuming 'BookId' is the foreign key in the Transaction model
    });

    res.send('Book submitted successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error submitting the book');
  }
});

// Route for returning a book
app.post('/return-book/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).send('Transaction not found');
    }

    // Calculate fine based on the difference between takenDate and returnDate

    transaction.returnDate = new Date(); // Assuming returnDate is set when book is returned
    await transaction.save();

    res.send('Book returned successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error returning the book');
  }
});

// Start server
sequelize.sync() // Sync Sequelize with database
  .then(() => {
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = app;
