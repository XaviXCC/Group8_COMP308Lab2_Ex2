const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('../utils/jwt');
const Player = require('../models/Player');

// Ensure avatars directory exists
const fs = require('fs');
const avatarsDir = path.join(__dirname, '../public/images/avatars');
if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
    console.log('✅ Created avatars directory:', avatarsDir);
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const ext = path.extname(file.originalname);
        const filename = `avatar-${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WEBP)'));
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Upload avatar endpoint
router.post('/avatar', upload.single('avatar'), async (req, res) => {
    try {
        console.log('Upload request received');

        // Verify authentication
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = verifyToken(token);
        if (!user) {
            console.log('Invalid token');
            return res.status(401).json({ error: 'Invalid token' });
        }

        console.log('User authenticated:', user.id);

        // Check if file was uploaded
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded:', req.file.filename);

        // Get the file path
        const avatarPath = `/images/avatars/${req.file.filename}`;

        // Update user's avatar in database
        const player = await Player.findById(user.id);
        if (!player) {
            console.log('Player not found:', user.id);
            return res.status(404).json({ error: 'Player not found' });
        }

        // Optional: Delete old avatar file if it exists and is not default
        if (player.avatarImage && !player.avatarImage.includes('default-avatar')) {
            const oldAvatarPath = path.join(__dirname, '../public', player.avatarImage);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
                console.log('Deleted old avatar:', oldAvatarPath);
            }
        }

        player.avatarImage = avatarPath;
        await player.save();

        console.log('Avatar updated successfully for user:', user.id);

        // Return the new avatar URL
        res.json({
            success: true,
            avatarUrl: avatarPath,
            message: 'Avatar uploaded successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Max 5MB' });
        }
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

module.exports = router;