import express from 'express';
const fs = require('fs');
const https = require('https');
import bodyParser from 'body-parser';
import router from './routes/index.js';

// Set up the express app
const app = express();

// SSL
const privateKey = fs.readFileSync('./ssl/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./ssl/cert.pem', 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate
};

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);

// Starting https server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});