// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     await mongoose.connect('mongodb+srv://umeshyadav:Umesh7886%40@cluster0.hujfuuj.mongodb.net/umeshstore?retryWrites=true&w=majority&appName=Cluster0', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('MongoDB Connected');
//   } catch (err) {
//     console.error(err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
const mongoose = require('mongoose');

async function tryConnect(uri) {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  const DEFAULT_URI = 'mongodb://127.0.0.1:27017/umeshstore';
  const MONGO_URI = process.env.MONGO_URI || DEFAULT_URI;

  const MAX_RETRIES = 5;
  const BASE_DELAY = 1000;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await tryConnect(MONGO_URI);
      console.log('MongoDB Connected');
      return;
    } catch (err) {
      console.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}):`, err.message);
      if (attempt === MAX_RETRIES) {
        console.error('Giving up connecting to MongoDB. Check MONGO_URI and that MongoDB is running.');
        process.exit(1);
      }
      const delay = BASE_DELAY * attempt;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

module.exports = connectDB;
