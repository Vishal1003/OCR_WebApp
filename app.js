const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const { TesseractWorker } = require('tesseract.js');
const cors = require('cors');
const worker = new TesseractWorker();

app.use(cors())

// multer disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage }).single("avatar");
app.set("view engine", "ejs");


// routes
app.get('/', (req, res) => {
    res.render('index', {text : "Output will appear here!"});
})

app.post('/upload', (req, res) => {
    upload(req, res, err => {
        // console.log(req.file);
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if(err) 
               return console.log('Error occured :', err);
            
            worker
            .recognize(data, "eng", {tessjs_create_pdf : '1'})
            .progress(progress => {
                console.log(progress);
            })
            .then(result => {
                res.render('download', {text : result.text});
                // res.send(result.text);
            })
            .finally(() => worker.terminate());
        })
    })
})

app.get('/download_file', (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`)
})
