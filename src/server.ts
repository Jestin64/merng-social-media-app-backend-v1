import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';
import Express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';


const app = Express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet)
app.use(cors())

mongoose.connect(process.env.MONGO_URI || '').then(() => {
    console.log("Mongodb client connected")
}).catch(err => {
    console.error(err);
})


app.listen(process.env.PORT, () => {
    console.log("Server started at : ", process.env.PORT)
})