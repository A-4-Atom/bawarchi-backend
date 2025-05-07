import express from "express";
import * as dotenv from "dotenv";
import menuRoutes from "./routes/menu.routes";
// import feedbackRoutes from "./routes/feedback.routes";
// import { ClerkExpressWithAuth } from "@clerk/express";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// app.use(ClerkExpressWithAuth());

app.use("/api/menu", menuRoutes);
app.get("/", (req, res) => res.send("Hello World!"));


// app.use("/api/feedback", feedbackRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
