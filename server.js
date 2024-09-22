// Charger les variables d'environnement depuis le fichier .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const app = express();
const PORT = process.env.PORT || 5015;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Configurer multer pour gérer l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    cb(null, "uploads/"); // Dossier de stockage des fichiers audio
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".webm"); // Nommer les fichiers .webm
  },
});

const upload = multer({ storage: storage });

// Fonction pour envoyer le fichier à OpenAI
const sendToOpenAI = async (filePath) => {
  try {

    const audioFile = fs.createReadStream(filePath);

    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("model", "whisper-1");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Utiliser la clé API depuis dotenv
          ...formData.getHeaders(),
        },
      }
    );
    
    return response.data.text;
  } catch (error) {
    throw new Error("Erreur lors de l'envoi à OpenAI : " + error.message);
  }
};

// Route POST pour recevoir et traiter le fichier audio
app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);

    if (req.file.mimetype !== "audio/webm") {
      throw new Error("Le fichier n'est pas au format webm");
    }

    const transcription = await sendToOpenAI(filePath);

    // Retourner la transcription et l'URL de l'audio au client
    res.json({
      text: transcription,
      audioUrl: `${process.env.IA_URL}/uploads/${path.basename(filePath)}`, // URL pour l'audio
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la transcription : " + error.message });
  }
});

// Servir les fichiers audio depuis le dossier uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
