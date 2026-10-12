import mongoose from 'mongoose';

export async function connectToDB() {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error('MONGO_URI is missing. Add it to your .env file.');
    }

    const normalizedUri = /^mongodb(s)?:\/\//i.test(mongoUri)
        ? mongoUri
        : `mongodb://${mongoUri}`;

    try {
        await mongoose.connect(normalizedUri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}
