import express from "express";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import healthRouter from "./routes/health.js";

const app = express();

app.use(express.json());
app.use("/api", healthRouter);
app.use("/api", notFound);
app.use(errorHandler);

export default app;