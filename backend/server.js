const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const connectDB = require('./db/connect');
const authRoutes = require('./routes/auth');
const { validateEnvOrExit, isProduction } = require('./lib/env');
const Report = require('./models/Report');
const { verifyToken } = require('./lib/tokens');
const { requireAuth } = require('./middleware/auth');

validateEnvOrExit();

const app = express();
const PORT = process.env.PORT || 5000;

if (isProduction()) {
  app.set('trust proxy', 1);
}

connectDB();

const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions =
  corsOrigin && String(corsOrigin).trim()
    ? { origin: String(corsOrigin).split(',').map((s) => s.trim()).filter(Boolean) }
    : {};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

app.get('/api/reports', requireAuth, async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ ok: true, reports });
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ ok: false, message: 'Failed to fetch reports' });
    }
});

app.get('/', (req, res) => {
    res.send('Backend is running and connected to MongoDB!');
});

app.post('/analyze', (req, res) => {
    console.log('--- Incoming /analyze request ---');
    const data = req.body;

    // Convert string inputs to numbers as expected by the model
    const processedData = {};
    for (const key in data) {
        if (key === 'gender') {
            processedData[key] = data[key] === 'male' ? 1 : 0;
        } else {
            processedData[key] = parseFloat(data[key]) || 0;
        }
    }

    console.log('Processing request for data:', processedData);

    const pythonProcess = spawn('python', [path.join(__dirname, 'predict.py')]);

    let result = '';
    let error = '';

    pythonProcess.stdin.write(JSON.stringify(processedData));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}. Error: ${error}`);
            return res.status(500).json({ status: 'error', message: 'Model prediction failed', error: error });
        }

        try {
            const parsedResult = JSON.parse(result);
            if (parsedResult.status === 'success') {
                // Save report if user is authenticated
                const authHeader = req.headers.authorization;
                console.log(`[analyze] Auth header presence: ${!!authHeader}`);
                
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    const token = authHeader.slice(7).trim();
                    try {
                        const payload = verifyToken(token);
                        const userId = payload.sub;
                        console.log(`[analyze] Authenticated user: ${userId}`);
                        
                        // Save to DB
                        Report.create({
                            userId,
                            inputData: data, // Save raw data for frontend rendering
                            prediction: parsedResult.prediction
                        })
                        .then(() => console.log('[analyze] Report saved to DB successfully'))
                        .catch(e => console.error('[analyze] Failed to save report:', e));
                    } catch (tokenErr) {
                        console.warn('[analyze] Invalid token provided for /analyze, not saving report');
                    }
                } else {
                    console.log('[analyze] No valid auth header, report will not be saved');
                }

                res.json(parsedResult);
            } else {
                res.status(400).json(parsedResult);
            }
        } catch (e) {
            console.error('Failed to parse Python output:', result);
            res.status(500).json({ status: 'error', message: 'Invalid response from model' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
