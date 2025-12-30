const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config();
const fileUpload = require('express-fileupload');

const authRoutes = require('./routes/auth.routes');
const configRoutes = require('./routes/config.routes');
const saveMasterRoutes = require("./routes/master.routes");
const images = require("./routes/image.route")
const updateReportRoutes = require("./routes/updatereport.route")
global._topDirName = path.join(__dirname, '');

const app = express();
app.use(express.json({ limit: '10mb' }));   // adjust as needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));
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
// app.use('/api/getPointsData', getPointsData);

app.get('/', (req, res) => res.send('API is Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT,  () => console.log(`Server running on port ${PORT}`));
// app.listen(PORT,'0.0.0.0',  () => console.log(`Server running on port ${PORT}`));
