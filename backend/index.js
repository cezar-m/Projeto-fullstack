import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";

const app = express();

app.use(cors({
  origin: "https://SEU-SITE.vercel.app",
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("API ONLINE 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API rodando"));