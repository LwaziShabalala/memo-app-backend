import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const app = express();

// ✅ Allow requests from your Vercel frontend
app.use(cors({
    origin: 'https://memoapp-two.vercel.app', // Your frontend
    credentials: true
}));

// ✅ Use memory storage instead of writing to disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file || !req.file.mimetype.startsWith('audio/')) {
            console.log('Invalid file type:', req.file ? req.file.mimetype : 'No file');
            return res.status(400).json({ error: 'File must be an audio file.' });
        }

        console.log('Received audio file:', req.file.originalname);

        const formData = new FormData();
        formData.append('audio', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        const FASTAPI_URL = 'https://8001-01jd6w67mbzjnztarkx6j3a1he.cloudspaces.litng.ai/predict'; // Replace with actual FastAPI URL

        console.log('Sending file to FastAPI...');
        const response = await axios.post(FASTAPI_URL, formData, {
            headers: formData.getHeaders()
        });

        console.log('Received transcription:', response.data);

        res.json(response.data);
    } catch (error) {
        console.error('Error processing audio file:', error.message);
        res.status(500).json({ error: 'Error processing audio file or transcription failed.' });
    }
});

export default app; // ✅ This is required for Vercel
