const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
exports.getImages = async (req, res) => {
  const fileName = req.params.id;

  const targetUrl = `http://service.ireckoner.com:9898/purchase_manager/Images/${fileName}`;

  try {
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return res.status(response.status).send("Error fetching image");
    }

    // Forward headers (like content-type = image/png)
    res.setHeader("Content-Type", response.headers.get("content-type"));
    response.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
}
exports.viewImage = async (req, res) => {
  try {
    const fileName = req.params.id; // image name from URL, e.g. Contact_1.PNG

    // Base folder: /images/purchase_manager/
    const imagePath = path.join(__dirname, '..', 'images', 'purchase_manager', fileName);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).send({ message: 'Image not found' });
    }

    // Send image as response
    res.sendFile(imagePath);
  } catch (err) {
    console.error('View image error:', err);
    return res.status(500).send({ message: 'Server error', error: err });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    let sampleFile = req.files.file;
    console.log('Sample file:', sampleFile);
    console.log('Current directory:', global._topDirName);
    let database = "purchase_manager"
    // var prof_path = path.join(global._topDirName, 'content');
    var prof_path = path.join(global._topDirName);
    if (!fs.existsSync(prof_path)) fs.mkdirSync(prof_path);
    if (!fs.existsSync(path.join(prof_path, '..', 'Client'))) fs.mkdirSync(path.join(prof_path, '..', 'Client'));
    if (!fs.existsSync(path.join(prof_path, '..', 'Client/' + database))) fs.mkdirSync(path.join(prof_path, '..', 'Client/' + database));
    if (!fs.existsSync(path.join(prof_path, '..', 'Client/' + database + "/" + req.query.EntityType))) fs.mkdirSync(path.join(prof_path, '..', 'Client/' + database + "/" + req.query.EntityType));
    if (!fs.existsSync(path.join(prof_path, '..', 'Client/' + database + "/" + req.query.EntityType + "/" + req.query.CompanyId))) {
      fs.mkdirSync(path.join(prof_path, '..', 'Client/' + database + "/" + req.query.EntityType + "/" + req.query.CompanyId));
    }
    prof_path = path.join(prof_path, '..', 'Client/' + database + "/" + req.query.EntityType + "/" + req.query.FileName);
    console.log(prof_path);
    sampleFile.mv(prof_path, function (err) {
      if (err)
        return res.status(500).send(err);
      res.send({ message: 'File uploaded!' });
    });
  } catch (err) {
    return res.status(500).send(err);
  }
}
exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    const sampleFile = req.files.file;
    const fileName = req.query.FileName;

    // ⬇️ Move 2 directories up (controllers → PM_Service)
    const rootDir = path.join(__dirname, '..');

    // Create a folder named "images" in the root directory
    const uploadDir = path.join(rootDir, 'images');

    // Ensure the folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create the full upload path
    const uploadPath = path.join(uploadDir, 'purchase_manager',fileName);

    // Move the uploaded file
    sampleFile.mv(uploadPath, (err) => {
      if (err) {
        console.error('File move error:', err);
        return res.status(500).send({ message: 'File upload failed', error: err });
      }

      res.send({
        message: 'File uploaded successfully!',
        filePath: `/images/${sampleFile.name}`,
      });
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).send({ message: 'Server error', error: err });
  }
};
exports.termspdf = async (req, res) => {
  try {
    const filePath = path.resolve(
      __dirname,
      '..',
      'files',
      'purchase_manager',
      'Sp.pdf'
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");
  
    res.sendFile(filePath);
    

  } catch (err) {
    console.error('Error reading terms&condition:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.uploadpdf = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    const sampleFile = req.files.file;
    const fileName = req.query.FileName;

    // ⬇️ Move 2 directories up (controllers → PM_Service)
    const rootDir = path.join(__dirname, '..');

    // Create a folder named "images" in the root directory
    const uploadDir = path.join(rootDir, 'files');

    // Ensure the folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create the full upload path
    const uploadPath = path.join(uploadDir, 'purchase_manager',fileName);

    // Move the uploaded file
    sampleFile.mv(uploadPath, (err) => {
      if (err) {
        console.error('File move error:', err);
        return res.status(500).send({ message: 'File upload failed', error: err });
      }

      res.send({
        message: 'File uploaded successfully!',
        filePath: `/files/${sampleFile.name}`,
      });
    });

  } catch (err) {
    console.error('Error uploading pdf:', err);
    res.status(500).json({ message: err.message });
  }
};
exports.getpdf = async (req, res) => {
  try {
    const fileName = req.params.id;
    const filePath = path.resolve(
      __dirname,
      '..',
      'files',
      'purchase_manager',
      fileName
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");
  
    res.sendFile(filePath);
    

  } catch (err) {
    console.error('Error reading pdf:', err);
    res.status(500).json({ message: err.message });
  }
};
exports.deletepdf = async (req, res) => {
  try {
    const fileName = req.params.id;
    const filePath = path.resolve(
      __dirname,
      "..",
      "files",
      "purchase_manager",
      fileName
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to delete file" });
      }

      res.status(200).json({ message: "PDF deleted successfully" });
    });

  } catch (err) {
    console.error("Error deleting pdf:", err);
    res.status(500).json({ message: err.message });
  }
};