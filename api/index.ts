import express from 'express';
import { analyzeGridRouter } from '../server/routes/analyzeGrid.js';

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(analyzeGridRouter);
export default app;
