import express from 'express';
import cashback from './cashback';

const router = express.Router();

router.use('/cashback', cashback);

export default router;
