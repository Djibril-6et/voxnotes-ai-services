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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Configurer multer pour gérer l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Dossier de stockage
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".webm"); // Nommer les fichiers .webm
  },
});

const upload = multer({ storage: storage });

// Fonction pour envoyer le fichier à OpenAI
const sendToOpenAI = async (filePath) => {
  try {
    // Lire le fichier audio
    const audioFile = fs.createReadStream(filePath);

    console.log(
      "Fichier à envoyer à OpenAI :",
      filePath,
      "Taille:",
      fs.statSync(filePath).size
    );

    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("model", "whisper-1");

    // Requête vers OpenAI Whisper API
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

    console.log("Réponse OpenAI:", response.data);

    return response.data.text;
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi à OpenAI :",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Route POST pour recevoir et traiter le fichier audio
app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);

    console.log("Fichier reçu :", req.file);
    console.log("Chemin du fichier :", filePath);
    console.log("Type MIME du fichier :", req.file.mimetype);

    // Vérifier que le fichier est bien au format webm
    if (req.file.mimetype !== "audio/webm") {
      throw new Error("Le fichier n'est pas au format webm");
    }

    // Envoyer le fichier à OpenAI directement
    const transcription = await sendToOpenAI(filePath);

    // Retourner la transcription au client
    res.json({
      text: transcription,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la transcription :",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: error.response
        ? error.response.data
        : "Erreur lors de la transcription",
    });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
