import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer usando memória (para pegar buffer)
export const upload = multer({ storage: multer.memoryStorage() });

// Função para upload com buffer
export const uploadToCloudinary = (fileBuffer, folder = "produtos") =>
  new Promise((resolve, reject) => {
    if (!fileBuffer) return reject(new Error("Arquivo inválido"));

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
