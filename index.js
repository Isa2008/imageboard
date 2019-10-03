const express = require("express");
const app = express();
const db = require("./utils/db.js");

//// FILE UPLOAD BOILERPLATE ////
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});
const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});
////////////////////////////////

//// FRONTEND ////
app.use(express.static("public"));

app.use(express.json());

//// GET IMAGES JSON ////
app.get("/images", (req, res) => {
    db.getImages()
        .then(result => {
            // console.log(result);
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });
});

//// SHOW ME MORE IMAGES BUTTON ////
app.get("/getmore/:id", (req, res) => {
    console.log("something");
    db.getMoreImages(req.params.id)
        .then(result => {
            console.log(result);
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });
});

//// GET IMAGE THAT IS CLICKED ON ////
app.get("/images/:id", (req, res) => {
    // console.log(req.params.id);
    db.getImageId(req.params.id)
        .then(result => {
            // console.log(result);
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });
});

//// UPLOAD FILE/IMAGE ////
const s3 = require("./s3");
const config = require("./config");
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const { filename } = req.file;
    const url = config.s3Url + filename;
    const { title, username, description } = req.body;
    db.addImage(url, username, title, description)
        .then(result => {
            // console.log(result);
            res.json(result.rows[0]);
        })
        .catch(err => {
            console.log(err);
        });
    // req.file - the file that was just uploaded!
    // req.body - refers to the values we type in the input fields
    // if (req.file) {
    //     res.json({
    //         success: true
    //     });
    // } else {
    //     res.json({
    //         success: false
    //     });
    // }
});

//// GET THE COMMENT AND USERNAME THAT IS ENTERED ////
app.get("/comments/:id", (req, res) => {
    // console.log("On Comments Route");
    db.getComments(req.params.id)
        .then(result => {
            // console.log("Result is: ", result);
            res.json(result);
        })
        .catch(err => {
            console.log("Insert comments error", err);
        });
});

//// SEND BACK THE COMMENT AND USERNAME THAT IS ENTERED ////
app.post("/comment", (req, res) => {
    // console.log("/comment");
    const { comment, username, id } = req.body;
    db.insertComment(comment, username, id)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log("Uploading comments error", err);
        });
});

app.listen(8080, () => console.log("My image board server is UP!"));
