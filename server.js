const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());


mongoose.connect("mongodb+srv://soujanya_07:souj785@cluster0.wirfxp1.mongodb.net/trivia?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
});

const scoreSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    score: { type: Number, required: true }
});

const User = mongoose.model("User", userSchema);
const Score = mongoose.model("Score", scoreSchema);

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            if (user.password === password) {
                return res.status(200).json({ message: "Login successful", email });
            } else {
                return res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            return res.status(401).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error while logging in:", error);
        return res.status(500).json({ message: "Error occurred while logging in" });
    }
});

app.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const newUser = new User({ email, password });
        await newUser.save();
        return res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Error occurred during signup" });
    }
});

app.post("/submit-score", async (req, res) => {
    const { email, score } = req.body;
    try {
        const user = await User.findOne({ email });1
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const existingScore = await Score.findOne({ email });
        if (existingScore) {
            existingScore.score = score;
            await existingScore.save();
            return res.status(200).json({ message: "Score updated successfully!" });
        } else {
            const newScore = new Score({ email, score });
            await newScore.save();
            return res.status(200).json({ message: "Score submitted successfully!" });
        }
    } catch (error) {
        console.error("Error while saving score:", error);
        res.status(500).json({ message: "Error while saving score" });
    }
});

app.get("/scores", async (req, res) => {
    try {
        const allScores = await Score.find();
        res.status(200).json({ scores: allScores });
    } catch (error) {
        console.error("Error while fetching scores:", error);
        res.status(500).json({ message: "Error while fetching scores" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

