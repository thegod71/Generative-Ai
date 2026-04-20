import express from "express";
import cors from "cors";
import main from "./app.js";
const app = express();
const PORT = 3001;

app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  console.log("Hello World");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, threadId } = req.body;
    console.log("1. Server received:", message, threadId);

    const botResponse = await main(message, threadId);
    //console.log("2. AI replied:", botResponse);

    res.json({ response: botResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
