// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('./models/User');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://farahdigital60:farahdigital60@digital.lanptml.mongodb.net/?retryWrites=true&w=majority&appName=Digital';
const frontendUrl = process.env.FRONTEND_URL || 'https://booksfarah.netlify.app';

// Middleware
app.use(cors({
    origin: frontendUrl,
    credentials: true
}));
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'books';
    let resource_type = 'image';
    if (file.mimetype === 'application/pdf') {
      resource_type = 'raw';
    }
    return {
      folder: folder,
      resource_type: resource_type,
      public_id: Date.now() + '-' + file.originalname.replace(/\.[^/.]+$/, ""),
      format: file.mimetype === 'application/pdf' ? 'pdf' : undefined,
    };
  },
});

const upload = multer({ storage: storage });

// Book Schema
const bookSchema = new mongoose.Schema({
    name: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    downloadCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);

// Routes
// Get all books
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single book
app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new book
app.post('/api/books', upload.fields([
    { name: 'bookImage', maxCount: 1 },
    { name: 'bookPdf', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, author, description, category } = req.body;
        // Get Cloudinary URLs
        const imageUrl = req.files['bookImage'][0].path;
        const pdfUrl = req.files['bookPdf'][0].path;
        const book = new Book({
            name,
            author,
            description,
            category,
            imageUrl,
            pdfUrl
        });
        const savedBook = await book.save();
        res.status(201).json(savedBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete book
app.delete('/api/books/:id', async (req, res) => {
    try {
        console.log('Attempting to delete book with ID:', req.params.id);
        
        // First delete from database
        const result = await Book.deleteOne({ _id: req.params.id });
        console.log('Database delete result:', result);

        if (result.deletedCount === 0) {
            console.log('No book found with ID:', req.params.id);
            return res.status(404).json({ message: 'Book not found' });
        }

        // If we get here, the book was successfully deleted from the database
        console.log('Book successfully deleted from database');
        res.json({ message: 'Book deleted successfully' });

        // Try to delete files after successful database deletion
        // This is done after sending the response so it doesn't block the user
        try {
            const book = await Book.findById(req.params.id);
            if (book) {
                if (book.imageUrl) {
                    try {
                        fs.unlinkSync(book.imageUrl);
                        console.log('Image file deleted:', book.imageUrl);
                    } catch (e) {
                        console.log('Error deleting image file:', e.message);
                    }
                }
                if (book.pdfUrl) {
                    try {
                        fs.unlinkSync(book.pdfUrl);
                        console.log('PDF file deleted:', book.pdfUrl);
                    } catch (e) {
                        console.log('Error deleting PDF file:', e.message);
                    }
                }
            }
        } catch (e) {
            console.log('Error in file cleanup:', e.message);
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Error deleting book: ' + error.message });
    }
});

// Signup route
app.post('/api/signup', async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            fullname,
            email,
            password
        });

        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Signin route
app.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({ 
            message: 'Login successful',
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error signing in', error: error.message });
    }
});

// Get most downloaded books
app.get('/api/books/most-downloaded', async (req, res) => {
    try {
        const books = await Book.find()
            .sort({ downloadCount: -1 })
            .limit(6);
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Increment download count
app.post('/api/books/:id/download', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        book.downloadCount += 1;
        await book.save();
        res.json({ message: 'Download count updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Serve PDF file
app.get('/api/books/:id/pdf', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        // Get the full path to the PDF file
        const pdfPath = path.join(__dirname, book.pdfUrl);
        
        // Check if file exists
        if (!fs.existsSync(pdfPath)) {
            console.error('PDF file not found at:', pdfPath);
            return res.status(404).json({ message: 'PDF file not found' });
        }

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${book.name}.pdf"`);
        
        // Stream the file
        const fileStream = fs.createReadStream(pdfPath);
        
        // Handle errors during streaming
        fileStream.on('error', (error) => {
            console.error('Error streaming PDF:', error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error streaming PDF file' });
            }
        });

        // Pipe the file to the response
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error serving PDF:', error);
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
