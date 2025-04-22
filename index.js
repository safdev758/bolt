const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const upload = require('./middlewares/upload-message');
const router = express.Router();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.post('/upload-message', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  res.status(200).send({
    message: 'File uploaded successfully',
    filePath: `/uploads/${req.file.filename}`,
  });
});
const signupRoutes = require("./routes/signup");
const loginRoutes = require("./routes/login");
const resetRoutes = require("./routes/reset");
const videocallingRoutes = require("./routes/videocalling");
const deleteRoute = require('./routes/delete') // Import correctly
const fyp = require("./routes/fyp");
const deleteOtpRoute = require('./routes/deleteotp'); // Import the delete OTP route
const ratingRoutes = require("./routes/rating");
const changepass = require("./routes/changepassword");
const availableRoute = require('./routes/available');
const updateProfileRoute = require('./routes/updateprofile');

videocallingRoutes(server); // Call the function here
app.use(changepass); // Use the change password route
app.use(ratingRoutes); // Use the rating routes
app.use(deleteOtpRoute);
app.use(signupRoutes);
app.use(loginRoutes);
app.use(deleteRoute); // Use the delete route
app.use(fyp);
app.use( availableRoute);
app.use( updateProfileRoute);

app.use("/auth", resetRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });
