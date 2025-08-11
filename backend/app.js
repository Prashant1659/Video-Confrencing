import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import connectToSocket from './controllers/socketManager.js';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';


import userRoutes from './routes/users.routes.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port",(process.env.PORT || 8000));
app.use(cors({
  origin: "https://video-confrencing-1-p8cq.onrender.com",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb", extended: true}));

app.use('/api/v1/users',userRoutes);




const PORT = process.env.PORT || 8000;
const start = async () =>{

    const URI = process.env.MONGO_URI;
    const connectionDb = await mongoose.connect(`${URI}/zoomClone`);
    console.log(`Connection Host : ${connectionDb.connection.host}`);
    server.listen(PORT,()=>{
    console.log(`App working on PORT : ${PORT}`);
    })
}

start();