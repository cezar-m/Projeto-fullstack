// middleware/upload.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer em memória
export const upload = multer({
  storage: multer.memoryStorage(),
});

// upload para cloudinary
export const uploadToCloudinary = (fileBuffer, folder = "produtos") => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      return reject(new Error("Arquivo não enviado"));
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};
