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
import { serverRunningTemplete } from './app/templete/templete';

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



app.get('/', async (req: Request, res: Response) => {
  
  // res.render('server-running.ejs');
  res.send(serverRunningTemplete);
});

app.use(globalErrorHandler);


//Not Found
app.use(notFound);

export default app;
