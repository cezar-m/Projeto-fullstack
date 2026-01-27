// middleware/upload.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// multer em memória (OK)
export const upload = multer({
  storage: multer.memoryStorage(),
});

// 🔥 FUNÇÃO PARA ENVIAR PARA CLOUDINARY
export const uploadToCloudinary = (fileBuffer, folder = "produtos") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};
