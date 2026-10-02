import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.config.js";

const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error starting the server:", error);
    process.exit(1);
  });
