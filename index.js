// --- Libraries ---
const path = require('path');
const express = require('express');
const multer = require('multer');
const { check, checkSchema, validationResult } = require('express-validator');
const crypto = require('crypto');

const webpage = require("./Model/webpage");
const stylesheet = require("./Model/stylesheet");
const file = require("./Model/file");
const user = require("./Model/user");

// --- Setup defaults for multer/express middleware ---
const app = express();
app.use(express.static('public'));
const storage = multer.diskStorage({
    destination: function(request, file, callback) {
        callback(null, 'uploads/');
    },
    filename: function (request, file, callback) {
        callback(null, path.parse(file.originalname).name + '-' + Date.now() + path.parse(file.originalname).ext)
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (request, file, callback) => {
        const allowedFileMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
        callback(null, allowedFileMimeTypes.includes(file.mimetype));
    }
});
// --- Port number ---
const port = 80;

// --- WEBPAGES ---
// GET all pages
app.get('/webpage/',
    upload.none(),
    // I didn't want to check some of the values in cas the user doesn't want
    // to set a search filter, so only some of the ones that need to be 
    // within a certain set are here
    check('sort', 'Please enter a column name.').isIn(['w.name', 'u.username']),
    check('order', 'Please enter either ASC or DESC.').isIn(['ASC', 'DESC']),
    async (request, response) => {
        let result = {};
        try {
            result = await webpage.getAll(request.query);

            // This shouldn't happen unless the database is empty 
            // But if the database is empty something probably has gone horribly wrong so...
            if (result.length < 1) {
                return response.status(404).json({ message: "SOMETHING HAS GONE HORRIBLY WRONG OH NO" });
            }
        }
        catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// GET page by id
app.get('/webpage/:id/',
    upload.none(),
    check('id', 'Please specify a positive integer ID.').isInt({ min: 0 }),
    async (request, response) => {
        //console.log('its in the right room');
        let result = {};
        try {
            //console.log(request.params.id);
            //console.log(request);
            result = await webpage.get(request.params.id, request.query);
        
            if (result.length < 1) {
                return response.status(404).json({ message: "No data was found in the database." });
            }
        }
        catch (error) {
            //console.error(error);
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// GET page for rendering purposes
app.get('/webpage/render/:id/',
    upload.none(),
    check('id', 'Please specify a positive integer ID.').isInt({ min: 0 }),
    async (request, response) => {
        let result = ``;
        try {
            //console.log(request.params.id);

            let data = await webpage.get(request.params.id, request.query);

            // construct the returned webpage
            //console.log(data);
            let body = data['0'].body, head = data['0'].head, stylesheet = data['0'].stylesheet, name = data['0'].name;

            result = `<html>
                <head>
                    <link href="/styles/render/${stylesheet}" rel="stylesheet" type="text/css">
                    <title>${name}</title>
                    ${head || ""}
                </head>
                <body>
                    ${body}
                </body>
                </html>`;
        }
        catch (error) {
            //console.error(error);
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.send(result);
    }
)

// POST new page
app.post('/webpage/',
    upload.none(),
    check('name', 'Please enter a string less than 50 characters long.').isAlphanumeric().isLength({ min: 1, max: 50 }),
    check('owner', 'Please enter a positive integer.').isInt({ min: 0 }),
    async (request, response) => {
        let result = {};
        try {
            // I'm creating the stylesheet first so we can use its ID to link to the webpage
            await stylesheet.insert(request.body);
            //console.log('waited');

            // Select the newly created stylesheet
            let theID = await stylesheet.getAll({ name: request.body.name });

            result = await webpage.insert({ ...request.body, stylesheet: theID['0'].id });

            // Create the stylesheet for this page too
        }
        catch (error) {
            //console.error(error);
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// PUT webpage
app.put('/webpage/:id/',
    upload.none(),
    check('id', 'Please specify a positive integer ID.').isInt({ min: 0 }),
    check('body', 'The maximum size string is 65536 right now, please keep it under that.').isLength({ max: 65535 }),
    check('head', 'The maximum size string is 65536 right now, please keep it under that.').isLength({ max: 65535 }),
    async (request, response) => {
        let result = {};
        try {
            result = await webpage.edit(request.params.id, request.body);
        }
        catch (error) {
            //console.log(error);
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// DELETE webpage
app.delete('/webpage/:id/',
    upload.none(),
    check('id', 'Please speicfy a positive integer ID.').isInt({ min: 0 }),
    async (request, response) => {
        let result = {};
        try {
            result = await webpage.remove(request.params.id, request.query);
        }
        catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// --- STYLESHEETS ---
// GET stylesheets (no public need to get all at once)
app.get('/styles/:id/',
    upload.none(),
    check('id', 'Please specify a positive integer ID').isInt({ min: 0 }),
    async (request, response) => {
        let result = {};
        try {
            result = await stylesheet.get(request.params.id, request.query);
        
            if (result.length < 1) {
                return response.status(404).json({ message: "No data was found in the database." });
            }
        }
        catch (error) {
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// GET stylesheet for rendering
app.get('/styles/render/:id/',
    upload.none(),
    check('id', 'Please specify a positive integer ID.').isInt({ min: 0 }),
    async (request, response) => {
        let result = {};
        try {
            let data = await stylesheet.get(request.params.id, request.query);

            result = data[0].data;
        }
        catch (error) {
            //console.error(error);
            return response.status(500).json({ message: "Server error while querying database." });
        }

        response.send(result);
    }
)

// POST new stylesheet
app.post('/styles/',
    upload.none(),
    check('name', 'Please enter a valid string less than 50 characters long.').isAlphanumeric().isLength({ min: 1, max: 50 }),
    check('owner', 'Please enter a positive integer.').isInt({ min: 0 }),
    async (request, response) => {
        let result = {};
        try {
            result = await stylesheet.insert(request.body);
        }
        catch (error) {
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// PUT stylesheet
app.put('/styles/:id/',
    upload.none(),
    check('id', 'Please specify a positive integer ID.').isInt({ min: 0 }),
    check('data', 'Please keep the data string less than 65536 characters.').isLength({ max: 65535 }),
    async (request, response) => {
        let result = {};
        try {
            result = await stylesheet.edit(request.params.id, request.query);
        }
        catch (error) {
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// DELETE stylesheet
app.delete('/styles/:id/',
    upload.none(),
    check('id', 'Please specify a positive integer ID.').isInt({ min: 0 }),
    async (request, response) => {
        let result = {};
        try {
            result = await stylesheet.remove(request.params.id, request.query);
        }
        catch (error) {
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// --- USERS ---
// GET user (no option to get all because that doesn't seem necessary)
// Also works as a LOGIN feature
app.get('/user/:id/',
    upload.none(),
    check('id', 'Please specify a positive integer ID.').isInt({ min: 0 }),
    async (request, response) => {
        let result = {};
        try {
            result = await user.get(request.params.id, request.query);
            
            if (result.length < 1) {
                return response.status(404).json({ message: "No data returned by database." });
            }

            // Determine if this was a login or just a user request
            if (typeof result[0].password !== 'undefined' && result[0].password.length > 0) {
                // TODO: cookies for login
                response.cookie('simplecmsloggedin', result[0].id, { maxAge: 20000000 });
            }
        }
        catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// POST new user
app.post('/user/',
    upload.none(),
    check('username', 'Please enter a string username between 1 and 128 characters long.').isAlphanumeric().isLength({ min: 1, max: 128 }),
    check('password', 'Please enter a string password between 1 and 128 characters long.').isAlphanumeric().isLength({ min: 1, max: 128 }),
    async (request, response) => {
        let result = {};
        try {
            //console.log(request.body.username, request.body.password);
            //console.log(request.query);
            result = await user.insert(request.body);
            //console.log(result.affectedRows);
            if (result.affectedRows === 1) {
                // To set the cookie we use the insertID we get from the insert data
                response.cookie('simplecmsloggedin', result.insertId, { maxAge: 20000000 });
            }
        }
        catch (error) {
            //console.error(error);
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// PUT user
app.put('/user/:id/',
    upload.none(),
    check('id', 'Please specify a positive integer ID.').isInt({ min: 0 }),
    async (request, response) => {
        let result = {};
        try {
            result = await user.edit(request.params.id, request.query);
        }
        catch (error) {
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// DELETE user
app.delete('/styles/:id/',
    upload.none(),
    check('id', 'Please specify a positive integer ID.').isInt({ min: 0 }),
    async (request, response) => {
        let result = {};
        try {
            result = await user.remove(request.params.id, request.query);
        }
        catch (error) {
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// --- FILES --- --- UNUSED AS OF NOW ---
// GET all files
app.get('/file/',
    upload.none(),
    async (request, response) => {
        let result = {};
        try {
            result = await file.getAll(request.query);

            if (result.length < 1) {
                return response.status(404).json({ message: "No data was found in the database." });
            }
        }
        catch (error) {
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// GET file by id
app.get('/file/:id/',
    upload.none(),
    async (request, response) => {
        let result = {};
        try {
            result = await file.get(request.params.id, request.query);
        
            if (result.length < 1) {
                return response.status(404).json({ message: "No data was found in the database." });
            }
        }
        catch (error) {
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// POST new file
app.post('/file/',
    upload.none(),
    async (request, response) => {
        let result = {};
        try {
            result = await file.insert(request.params.id, request.query);
        }
        catch (error) {
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// PUT file
app.put('/file/:id/',
    upload.none(),
    async (request, response) => {
        let result = {};
        try {
            result = await file.edit(request.params.id, request.query);
        }
        catch (error) {
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// DELETE file
app.delete('/file/:id/',
    upload.none(),
    async (request, response) => {
        let result = {};
        try {
            result = await file.remove(request.params.id, request.query);
        }
        catch (error) {
            return response.status(500).json({ message: "Server error while querying database." });
        }
        response.json({ 'data': result });
    }
);

// --- Start server ---
app.listen(port, () => {
    console.log(`Server started; listening at http://localhost:${port}`);
});