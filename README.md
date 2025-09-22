# 🤖 AI Transcription Service

OpenAI Whisper integration microservice handling audio processing, speech-to-text conversion, and real-time transcription API for the voice transcription platform.

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **AI Model:** OpenAI Whisper-1
- **File Upload:** Multer
- **HTTP Client:** Axios
- **Form Data:** form-data
- **File System:** Node.js fs module

## 🌟 Features

- **Audio-to-Text Conversion:** High-accuracy transcription using OpenAI Whisper
- **Multiple Audio Formats:** Supports WebM, MP3, WAV formats
- **File Management:** Automatic file storage and serving
- **Real-time Processing:** Fast transcription response
- **Error Handling:** Comprehensive error management
- **Static File Serving:** Direct access to processed audio files

## 📋 Prerequisites

- Node.js (v14 or higher)
- OpenAI API key with Whisper access
- Sufficient disk space for temporary audio files

## ⚙️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/Djibril-6et/voxnotes-ai-services.git
cd voxnotes-ai-services
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=9040
IA_URL=http://localhost:9040
```

4. **Create uploads directory** (automatically created on first run)
```bash
mkdir uploads
```

## 🚀 Running the Service

### Development/Production Mode
```bash
node server.js
```

The service will be available at `http://localhost:9040`

## 📡 API Endpoints

### Transcription
```
POST   /transcribe              - Upload and transcribe audio file
```

### Static Files
```
GET    /uploads/:filename       - Download/access uploaded audio files
```

## 🎵 Supported Audio Formats

- **WebM** (`audio/webm`)
- **MP3** (`audio/mpeg`) 
- **WAV** (`audio/wav`)

## 📤 API Usage

### Transcribe Audio File

**Endpoint:** `POST /transcribe`

**Content-Type:** `multipart/form-data`

**Body:**
```
file: [audio file] (form-data field)
```

**Request Example (curl):**
```bash
curl -X POST \
  http://localhost:9040/transcribe \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your-audio-file.webm"
```

**Response (Success):**
```json
{
  "text": "The transcribed text from the audio file goes here...",
  "audioUrl": "http://localhost:9040/uploads/file-1234567890.webm"
}
```

**Response (Error):**
```json
{
  "error": "Error message describing what went wrong"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for Whisper access | Yes | - |
| `PORT` | Server port | No | 5015 |
| `IA_URL` | Base URL for audio file access | Yes | - |

### File Storage

- **Upload Directory:** `./uploads/`
- **File Naming:** `{fieldname}-{timestamp}.webm`
- **Auto-creation:** Directory created automatically if missing

## 🎛️ OpenAI Whisper Integration

### Model Configuration
- **Model:** `whisper-1` (OpenAI's production model)
- **API Endpoint:** `https://api.openai.com/v1/audio/transcriptions`
- **Request Method:** POST with multipart/form-data
- **Authentication:** Bearer token with OpenAI API key

### Processing Flow
1. **File Upload** → Receive audio file via multer
2. **Validation** → Check file format and presence  
3. **OpenAI Request** → Send file to Whisper API
4. **Response Processing** → Extract transcription text
5. **File Serving** → Provide access URL to uploaded file

## 🔒 Security & Validation

- **File Type Validation:** Only accepts specified MIME types
- **File Presence Check:** Ensures file was uploaded
- **Error Handling:** Secure error messages without API key exposure
- **CORS Configuration:** Allows cross-origin requests with credentials

## 📁 Project Structure

```
ai-service/
├── uploads/              # Auto-generated audio storage
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── .env                 # Environment variables
```

## 🚨 Error Handling

### Common Error Scenarios

**No File Uploaded**
```json
{
  "error": "Erreur lors de la transcription : Aucun fichier n'a été téléchargé."
}
```

**Invalid File Format**
```json
{
  "error": "Erreur lors de la transcription : Le fichier n'est pas au format webm"
}
```

**OpenAI API Error**
```json
{
  "error": "Erreur lors de la transcription : Erreur lors de l'envoi à OpenAI : [error details]"
}
```

## 🐳 Docker Support

### Dockerfile
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p uploads
EXPOSE 9040
CMD ["node", "server.js"]
```

### Docker Compose Integration
```yaml
version: '3.8'
services:
  ai-service:
    build: .
    ports:
      - "9040:9040"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PORT=9040
      - IA_URL=http://localhost:9040
    volumes:
      - ./uploads:/app/uploads
```

## 💾 File Management

### Storage Strategy
- **Temporary Storage:** Files stored in `uploads/` directory
- **File Retention:** No automatic cleanup (implement as needed)
- **Access Pattern:** Direct HTTP access to uploaded files
- **Security:** Files accessible via direct URL

### Cleanup Recommendations
Consider implementing file cleanup for production:
```javascript
// Example cleanup after transcription
fs.unlink(filePath, (err) => {
  if (err) console.error('Cleanup error:', err);
});
```

## 🔗 Integration with Other Services

This service typically integrates with:
- **Database Service:** Store transcription results
- **Frontend Application:** Receive audio files from users
- **File Storage Service:** Long-term audio storage (if needed)

### Integration Example
```javascript
// After transcription success, save to database
const transcriptionData = {
  userId: req.body.userId,
  audioFileId: req.body.audioFileId,
  transcriptionText: transcription,
  language: 'en', // or detect language
  status: 'completed'
};

// Send to database service
await axios.post('http://localhost:9090/api/transcriptions', transcriptionData);
```

## 📊 Performance Considerations

- **File Size Limits:** Configure multer limits based on needs
- **Concurrent Requests:** OpenAI API has rate limits
- **Memory Usage:** Large files stored on disk, not in memory
- **Response Time:** Depends on audio file length and OpenAI API response time

## 🧪 Testing

### Manual Testing
```bash
# Test transcription endpoint
curl -X POST \
  http://localhost:9040/transcribe \
  -F "file=@test-audio.webm"

# Test file serving
curl http://localhost:9040/uploads/your-file.webm
```

### Unit Test Example
```javascript
// Test file upload and transcription
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('test-audio.webm'));

// Send to /transcribe endpoint and verify response
```

## 📈 Monitoring & Logging

The service logs:
- Server startup on specified port
- Upload directory creation
- Transcription errors with details
- File upload validation results

## 🚀 Production Deployment

### Recommendations
1. **API Key Security:** Use environment variables, never commit keys
2. **File Cleanup:** Implement cleanup strategy for uploads directory  
3. **Error Monitoring:** Add proper logging and monitoring
4. **Rate Limiting:** Implement rate limiting for API protection
5. **File Size Limits:** Configure appropriate upload limits
6. **HTTPS:** Use HTTPS in production
7. **Backup Strategy:** Backup important transcriptions

### Environment Variables for Production
```env
OPENAI_API_KEY=your_production_openai_key
PORT=9040
IA_URL=https://your-domain.com
NODE_ENV=production
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.