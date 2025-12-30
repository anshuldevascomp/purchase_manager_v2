const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const http = require('https');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const path = require('path');

// Set the top-level directory path
global._topDirName = __dirname;

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/ascomp.salesxceed.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/ascomp.salesxceed.com/fullchain.pem')
};

const authRoutes = require('./routes/auth.routes');
const configRoutes = require('./routes/config.routes');
const saveMasterRoutes = require("./routes/master.routes");
const images = require("./routes/image.route")
const updateReportRoutes = require("./routes/updatereport.route")
global._topDirName = path.join(__dirname, '');


const app = express();
app.use(
    cors({
        origin: true,
        credentials: true, // Allow cookies, authentication headers, etc.
    })
);

app.use(fileUpload({
    createParentPath: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/superChamps', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/master', saveMasterRoutes);
app.use('/api/images', images);
app.use('/api/updateReportData', updateReportRoutes);

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

// app.listen(PORT,  () => console.log(`Server running on port ${PORT}`));
var server = http.createServer(options, app);
server.listen(PORT, function () {
    console.log('Listening to Port ' + PORT);
});
