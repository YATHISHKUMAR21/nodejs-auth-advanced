"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import authRoutes from './routes/authRoutes';
const app = (0, express_1.default)();
// const PORT = process.env.PORT || 5000;
// Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)()); //parse cookies to req.cookies
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
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is healthy' });
});
exports.default = app;
