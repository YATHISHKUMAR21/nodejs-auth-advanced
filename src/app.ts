import express from 'express';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import adminRouter from './routes/admin.routes'


const app = express();

// const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());  //parse cookies to req.cookies

// // Routes
// app.use('/api/auth', authRoutes);

// // Connect to MongoDB and start the server
// mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log('Connected to MongoDB');
//         app.listen(PORT, () => {
//             console.log(`Server is running on port ${PORT}`);
//         });
//     })
//     .catch((error) => {
//         console.error('Error connecting to MongoDB:', error);
//     }); 


    app.get('/health', (req,res)=>{
        res.json({status: 'ok', message: 'Server is healthy'})
    })

    app.use('/auth', authRouter);
    app.use('/user', userRouter);
    app.use('/admin', adminRouter);


    export default app;