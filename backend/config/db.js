const mongoose = require('mongoose');
// Remove dotenv import and config here

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }  
};

module.exports = connectDB;