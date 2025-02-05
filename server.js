import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const app = express();

app.use(cors({
    origin: 'https://memoapp-two.vercel.app',
    credentials: true
}));

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.post('/upload', upload.single('audio'), async (req, res) => {
    console.log('Request received at /upload');
    console.log('Headers:', req.headers);
    
    try {
        if (!req.file) {
            console.log('No file received');
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        if (!req.file.mimetype.startsWith('audio/')) {
            console.log('Invalid file type:', req.file.mimetype);
            return res.status(400).json({ error: 'File must be an audio file.' });
        }

        console.log('Received audio file:', req.file.originalname, 'Size:', req.file.size);
        const formData = new FormData();
        formData.append('audio', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        const FASTAPI_URL = 'https://8001-01jd6w67mbzjnztarkx6j3a1he.cloudspaces.litng.ai/predict';
        console.log('Sending file to FastAPI...');
        
        const response = await axios.post(FASTAPI_URL, formData, {
            headers: formData.getHeaders()
        });

        console.log('Received transcription:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({ error: 'Error processing audio file or transcription failed.' });
    }
});

// Add server listener for local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
