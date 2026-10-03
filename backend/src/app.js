import express from "express";
import cors from "cors";
import helmet from "helmet";
import errorHandler from "../src/middleware/error.middleware.js";
import router from "../src/routes/index.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));
app.use("/api/v1", router);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

app.use(errorHandler);

export default app;
