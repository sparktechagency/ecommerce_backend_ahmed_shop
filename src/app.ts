/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import globalErrorHandler from './app/middleware/globalErrorhandler';
import notFound from './app/middleware/notfound';
import router from './app/routes';
import path from 'path';
import { paymentController } from './app/modules/payment/payment.controller';
import mongoose from 'mongoose';

const app: Application = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.post(
  '/api/v1/ahmed-ecommerce-webhook-payment',
  express.raw({ type: 'application/json' }),
  paymentController.conformWebhook,
);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

//parsers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    // origin: 'https://memorial-moments-website.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }),
);

// Remove duplicate static middleware
// app.use(app.static('public'));

// application routes
app.use('/api/v1', router);

async function checkServerStatus(): Promise<boolean> {
  // Example: check if mongoose connection is ready
  return mongoose.connection.readyState === 1; // 1 = connected
}

app.get('/', async (req: Request, res: Response, next:NextFunction) => {
  // res.send('server is running');
  
  
  try {
    const serverIsRunning = await checkServerStatus();
    console.log('serverIsRunning', serverIsRunning);
    if (!serverIsRunning) {
      // return res.status(503).render('error.ejs', {
      //   message: 'Server is currently offline. Please try again later.',
      // });
      res.send('server is error');
    }
    res.render('server-running.ejs');
    
  } catch (error) {
    // res.send('server is error');
    next(error);
    
  }
});

app.get('/', async (req: Request, res: Response, next:NextFunction) => {
  
  res.render('server-running.ejs');
});

app.use(globalErrorHandler);


//Not Found
app.use(notFound);

export default app;
