"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandler = registerHandler;
exports.verifyEmailHandler = verifyEmailHandler;
exports.loginHandler = loginHandler;
exports.refreshHandler = refreshHandler;
exports.logoutHandler = logoutHandler;
const auth_schema_1 = require("./auth.schema");
const user_model_1 = require("../../models/user.model");
const hash_1 = require("../../lib/hash");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../../lib/email");
const token_1 = require("../../lib/token");
function getAppUrl() {
    return process.env.APP_URL || 'http://localhost:5001';
}
async function registerHandler(req, res) {
    try {
        const result = auth_schema_1.registerSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: 'Invalid Data', errors: result.error.flatten()
            });
        }
        const { name, email, password } = result.data;
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await user_model_1.User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                message: 'this email is already in use'
            });
        }
        const passwordHash = await (0, hash_1.hashPassword)(password);
        const newlyCreatedUser = await user_model_1.User.create({
            email: normalizedEmail,
            passwordHash: passwordHash,
            role: 'user',
            isEmailVerified: false,
            twoFactorEnabled: false,
        });
        //email verification logic will be added here
        const verifyToken = jsonwebtoken_1.default.sign({
            sub: newlyCreatedUser._id,
        }, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '1h'
        });
        const verifyUrl = `${getAppUrl()}/auth/verify-email?token=${verifyToken}`;
        await (0, email_1.sendEmail)(newlyCreatedUser.email, 'Verify your email', `<p>Click <a href="${verifyUrl}">here</a> to verify your email</p>`);
        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            id: newlyCreatedUser._id,
            email: newlyCreatedUser.email,
            name: newlyCreatedUser.name,
            role: newlyCreatedUser.role,
            isEmailVerified: newlyCreatedUser.isEmailVerified,
            twoFactorEnabled: newlyCreatedUser.twoFactorEnabled,
            createdAt: newlyCreatedUser.createdAt,
            updatedAt: newlyCreatedUser.updatedAt
        });
    }
    catch (error) {
        console.error('Error in registerHandler:', error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}
async function verifyEmailHandler(req, res) {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({
            message: 'Token is missing'
        });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await user_model_1.User.findById(payload.sub);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({
                message: 'Email is already verified'
            });
        }
        user.isEmailVerified = true;
        await user.save();
        return res.status(200).json({
            message: 'Email verified successfully now you can login'
        });
    }
    catch (error) {
        console.error('Error in verifyEmailHandler:', error);
        return res.status(500).json({
            message: 'Invalid or expired token'
        });
    }
}
async function loginHandler(req, res) {
    try {
        const result = auth_schema_1.loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: 'Invalid Data', errors: result.error.flatten()
            });
        }
        const { email, password } = result.data;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await user_model_1.User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }
        const ok = await (0, hash_1.checkPassword)(password, user.passwordHash);
        if (!ok) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }
        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in'
            });
        }
        const accessToken = (0, token_1.generateAccessToken)(user.id, user.role, user.tokenVersion);
        const refreshToken = (0, token_1.createRefreshToken)(user.id, user.tokenVersion);
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        return res.status(200).json({
            message: 'Login successful',
            accessToken: accessToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                twoFactorEnabled: user.twoFactorEnabled
            }
        });
    }
    catch (error) {
        console.error('Error in loginHandler:', error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}
async function refreshHandler(req, res) {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
        if (!token) {
            return res.status(401).json({
                message: 'Refresh token is missing'
            });
        }
        const payload = (0, token_1.verifyRefreshToken)(token);
        const user = await user_model_1.User.findById(payload.sub);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        if (user.tokenVersion !== payload.tokenVersion) {
            return res.status(401).json({
                message: 'Invalid refresh token'
            });
        }
        const newAccessToken = (0, token_1.generateAccessToken)(user.id, user.role, user.tokenVersion);
        const newRefreshToken = (0, token_1.createRefreshToken)(user.id, user.tokenVersion);
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        return res.status(200).json({
            message: 'token refreshed successfully',
            accessToken: newAccessToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                twoFactorEnabled: user.twoFactorEnabled
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}
async function logoutHandler(req, res) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/'
    });
    return res.status(200).json({
        message: 'Logged out successfully'
    });
}
