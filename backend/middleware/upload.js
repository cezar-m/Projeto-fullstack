import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer em memória
export const upload = multer({ storage: multer.memoryStorage() });

// Upload para Cloudinary usando buffer
export const uploadToCloudinary = (fileBuffer, folder = "produtos", filename = "file") =>
  new Promise((resolve, reject) => {
    if (!fileBuffer) return reject(new Error("Arquivo inválido"));

    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: filename, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
