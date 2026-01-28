const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets/images/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// API Routes
app.get('/api/products', (req, res) => {
    try {
        const data = fs.readFileSync('./data/products.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to load products' });
    }
});

app.post('/api/products', (req, res) => {
    try {
        const newData = req.body;
        fs.writeFileSync('./data/products.json', JSON.stringify(newData, null, 2));
        res.json({ success: true, message: 'Products updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save products' });
    }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const imagePath = `assets/images/${req.file.filename}`;
        res.json({ success: true, path: imagePath });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('กรุณาเปิดเบราว์เซอร์ไปที่ http://localhost:3001');
});