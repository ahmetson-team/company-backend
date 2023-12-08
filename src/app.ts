import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';
import path from 'path';

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());



app.on('listening', () => {
  console.log('listening');
});

app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'Hello Web3!',
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
