import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import 'dotenv/config'

//files import
import connectDB from './config/connectDB.js';
import authRoute from './routes/authRoute.js';

const app = express();

//middlewares
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(bodyParser.json());

//routes
app.use('/api/auth', authRoute);

//config database connection
connectDB();

//PORT
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});