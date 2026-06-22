const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
if (!fs.existsSync('filestorage')) {
    fs.mkdirSync('filestorage');
}
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'filestorage/');
    },

    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() + '-' + file.originalname
        );
    }
});
const upload = multer({

    storage,a

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    'Only PDF, JPG and PNG files are allowed'
                )
            );
        }
    }
});
app.get('/', (req, res) => {

    fs.readdir('./filestorage', (err, files) => {

        if (err) {
            files = [];
        }

        res.render('index', { files });
    });
});
app.post(
    '/upload',
    upload.single('file'),
    (req, res) => {

        res.redirect('/');
    }
);
app.get('/download/:filename', (req, res) => {

    const filePath = path.join(
        __dirname,
        'filestorage',
        req.params.filename
    );

    res.download(filePath);
});
app.get('/delete/:filename', (req, res) => {

    const filePath = path.join(
        __dirname,
        'filestorage',
        req.params.filename
    );

    if (fs.existsSync(filePath)) {

        fs.unlinkSync(filePath);
    }

    res.redirect('/');
});
app.get('/api/files', (req, res) => {

    fs.readdir('./filestorage', (err, files) => {

        if (err) {
            return res.status(500).json({
                error: 'Unable to read files'
            });
        }

        res.json(files);
    });
});
app.use((err, req, res, next) => {

    res.status(400).send(err.message);
});

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );
});
