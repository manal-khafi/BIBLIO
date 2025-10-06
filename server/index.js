import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import router from './routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/biblio';
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error', err);
  process.exit(1);
});

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'biblio-api' });
});

app.use('/api', router);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});


