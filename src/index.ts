import express from "express";
import * as dotenv from "dotenv";
import menuRoutes from "./routes/menu.routes";
import feedbackRoutes from "./routes/feedback.routes";
import webhookRoutes from "./routes/webhook.routes";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());

// Webhook routes need to be before express.json() middleware
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());

app.use("/api/menu", menuRoutes);
app.use("/api/feedback", feedbackRoutes);
app.get("/", (req, res) => res.send("Hello World!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
