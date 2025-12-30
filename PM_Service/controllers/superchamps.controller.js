const dB = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.superChamps = async (req, res) => {
    const { names } = req.query;
    if (!names) {
        return res.status(400).json({ error: 'No image names provided.' });
    }

    // Parse names to array
    const imageNames = names.split(',');
    // Build full file paths
    const imageDir = path.join(__dirname, '../images/purchase_manager');
    let images = [];

    imageNames.forEach((imgName) => {
        const imgPath = path.join(imageDir, imgName);
        if (fs.existsSync(imgPath)) {
            images.push(`/images/purchase_manager/${imgName}`); // URL to access image via static middleware
        }
    });

    res.json({ images });
}
