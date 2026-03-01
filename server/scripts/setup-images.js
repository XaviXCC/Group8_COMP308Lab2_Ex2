const fs = require('fs');
const path = require('path');
const https = require('https');

// confirm images directory exists, if not create it
const imagesDir = path.join(__dirname, '../public/images/games');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('Created images directory:', imagesDir);
}

// game images with fallback URLs
const gameImages = [
    {
        name: 'last-of-us.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/en/4/4f/The_Last_of_Us_Part_II_cover.jpg',
        fallback: 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=The+Last+of+Us'
    },
    {
        name: 'cyberpunk.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
        fallback: 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=Cyberpunk+2077'
    },
    {
        name: 'fifa24.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/en/6/6a/FIFA_24_cover.jpg',
        fallback: 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=FIFA+24'
    },
    {
        name: 'zelda.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/en/f/fb/The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg',
        fallback: 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=Zelda'
    },
    {
        name: 'starfield.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/en/5/5c/Starfield_cover.jpg',
        fallback: 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=Starfield'
    },
    {
        name: 'god-of-war.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/en/9/9a/God_of_War_Ragnar%C3%B6k_cover.jpg',
        fallback: 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=God+of+War'
    },
    {
        name: 'elden-ring.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg',
        fallback: 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=Elden+Ring'
    },
    {
        name: 'minecraft.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png',
        fallback: 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=Minecraft'
    },
    {
        name: 'default-game.jpg',
        url: 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=Game+Cover',
        fallback: 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=Game+Cover'
    }
];

// download image from URL and save to filepath
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileStream = fs.createWriteStream(filepath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(` Downloaded: ${path.basename(filepath)}`);
                    resolve();
                });
            } else {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            }
        }).on('error', reject);
    });
};

// create a simple SVG placeholder with the game title text
const createPlaceholder = (filepath, text) => {
    const svgContent = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#2c3e50"/>
        <text x="150" y="100" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">
            ${text}
        </text>
    </svg>`;

    fs.writeFileSync(filepath.replace('.jpg', '.svg'), svgContent);
    console.log(` Created placeholder for ${path.basename(filepath)}`);
};

// main function to set up images
const setupImages = async () => {
    console.log('  Setting up game images...');

    for (const game of gameImages) {
        const filepath = path.join(imagesDir, game.name);

        // if file already exists, skip downloading
        if (fs.existsSync(filepath)) {
            console.log(`⏭  ${game.name} already exists, skipping`);
            continue;
        }

        try {
            // try downloading the image, if it fails use the fallback URL, if that also fails create a placeholder
            await downloadImage(game.url, filepath);
        } catch (error) {
            console.log(`！  Failed to download ${game.name}, creating placeholder...`);
            // create placeholder using fallback text (game name without extension)
            const text = game.name.replace('.jpg', '').replace(/-/g, ' ');
            createPlaceholder(filepath, text);
        }
    }

    console.log(' Image setup complete!');
    console.log(' Images location:', imagesDir);
};

// auto-run the setup when this script is executed
setupImages();