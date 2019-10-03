const spicedPg = require("spiced-pg");

const db = spicedPg(`postgres:postgres:postgres@localhost:5432/imageboard`);

exports.getImages = function() {
    console.log("addImages");
    return db
        .query(
            `SELECT url, username, title, description, id
            FROM images
            ORDER BY created_at DESC
            LIMIT 6`
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getMoreImages = function(lastId) {
    console.log("getMoreImages");
    return db
        .query(
            `SELECT *, (
                SELECT id
                FROM images
                ORDER BY id ASC
                LIMIT 1
            ) AS "lowestId" FROM images
            WHERE id < $1
            ORDER BY id DESC
            LIMIT 6`,
            [lastId]
        )
        .then(({ rows }) => rows);
};

exports.addImage = function(url, username, title, description) {
    console.log("getImages");
    return db.query(
        `INSERT INTO images (url, username, title, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
        [url, username, title, description]
    );
};

exports.getImageId = function(id) {
    console.log("getImageId");
    return db.query(
        `SELECT url, username, title, description
            FROM images
            WHERE id=$1`,
        [id]
    );
};

exports.getComments = function(id) {
    console.log("getComments");
    return db
        .query(
            `SELECT *
            FROM comments
            WHERE image_id=$1
            ORDER BY created_at DESC`,
            [id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.insertComment = function(comment, username, image_id) {
    console.log("insertComment");
    return db
        .query(
            `INSERT INTO comments (comment, username, image_id)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [comment, username, image_id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

// BONUS FEATURES
// subqueries for add previous and next images
// (
//     SELECT id FROM images
//     WHERE id < $1
//     ORDER BY id ASC
//     LIMIT 1
// ) as "prevId"
