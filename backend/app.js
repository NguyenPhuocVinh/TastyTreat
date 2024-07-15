import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { handleError } from './middlewares/errorhandle.middlewares.js';
import authRoute from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import productRouter from './routes/product.route.js';
import categoryRouter from './routes/category.route.js';
import cartRouter from './routes/cart.route.js';
import orderRouter from './routes/order.route.js';
import checkoutRouter from './routes/checkout.route.js';
import deliveryRouter from './routes/delivery.route.js';
import shopRouter from './routes/shop.route.js';
import { OAuth2Router, passport } from './routes/oAuth2.route.js'
import session from 'express-session';
import { jobBackgroundMiddleware } from './middlewares/job_background.middleware.js';
import discountRouter from './routes/discount.route.js';
import addressRouter from './routes/address.route.js';


dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

//Session
app.use(session({
    secret: process.env.JWT_SECRET, 
    resave: false,
    saveUninitialized: true,
}));

//Middleware 
app.use(handleError);
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());
app.use(morgan('combined'));

//Job Background
jobBackgroundMiddleware();
setInterval(jobBackgroundMiddleware, 5 * 60 * 1000);

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/auth', OAuth2Router);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/checkout', checkoutRouter);
app.use('/api/v1/delivery', deliveryRouter);
app.use('/api/v1/shop', shopRouter);
app.use('/api/v1/discount', discountRouter);
app.use('/api/v1/address', addressRouter);

export default app;

