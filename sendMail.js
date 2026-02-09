const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const app = express();
app.set("view engine", "ejs");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Body parser
app.use(express.urlencoded({ extended: true }));

// Render form
app.get("/", (req, res) => {
  res.render("index");
});

// Handle email sending
app.post("/send", upload.array("attachments"), async (req, res) => {
  const { to, subject, text } = req.body;

  // Prepare attachments
  const attachments = req.files.map(file => ({
    filename: file.originalname,
    path: path.join(__dirname, file.path)
  }));

  // Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your_email@gmail.com",
      pass: "your_app_password" // Gmail App Password if 2FA enabled
    }
  });

  const mailOptions = {
    from: "your_email@gmail.com",
    to,
    subject,
    text,
    attachments
  };

  transporter.sendMail(mailOptions, (err, info) => {
    // Delete uploaded files after sending
    req.files.forEach(file => fs.unlinkSync(file.path));

    if(err){
      console.error("Error sending email:", err);
      res.send("Error: " + err.message);
    } else {
      console.log("Email sent:", info.response);
      res.send("Email sent successfully!");
    }
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
