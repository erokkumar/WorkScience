const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = "mongodb+srv://Attendance:EPnSU3gmQZr63IzN@workscience.l4q30.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1);
    });

// JWT Secret Key
const JWT_SECRET = "yourSecretKey";

// ✅ User Schema (Employee Authentication)
const userSchema = new mongoose.Schema({
    employeeName: { type: String, required: true },
    userId: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// ✅ Attendance Schema (IST Time Format)
const attendanceSchema = new mongoose.Schema({
    employeeName: { type: String, required: true },
    loginTime: { type: String, default: () => getISTTimeString() }, // Store IST time
    logoutTime: { type: String }, // Store IST on checkout
    date: { type: String, required: true }
});
const Attendance = mongoose.model("Attendance", attendanceSchema);

// 📌 Middleware to Protect Routes
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        req.user = decoded;
        next();
    });
};

// 📌 Register Employee API
app.post("/register", async (req, res) => {
    const { employeeName, userId, password } = req.body;

    try {
        const existingUser = await User.findOne({ userId });
        if (existingUser) return res.status(400).json({ message: "User ID already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ employeeName, userId, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Employee Login API
app.post("/login", async (req, res) => {
    const { userId, password } = req.body;

    try {
        const user = await User.findOne({ userId });
        if (!user) return res.status(400).json({ message: "Invalid User ID." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password." });

        const token = jwt.sign({ userId: user.userId, employeeName: user.employeeName }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful.", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Attendance APIs

// ✅ Check-In API (Clock In)
app.post("/attendance", authenticate, async (req, res) => {
    const { employeeName } = req.user;
    const date = new Date().toISOString().split("T")[0];

    const existingAttendance = await Attendance.findOne({ employeeName, date });
    if (existingAttendance) {
        return res.status(400).json({ message: "You have already checked in today." });
    }

    const newAttendance = new Attendance({ employeeName, date, loginTime: getISTTimeString() });
    await newAttendance.save();

    res.status(201).json({ message: "Checked in successfully." });
});

// ✅ Check-Out API (Clock Out)
app.post("/logout", authenticate, async (req, res) => {
    const { employeeName } = req.user;
    const date = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({ employeeName, date, logoutTime: { $exists: false } });
    if (!attendance) return res.status(400).json({ message: "You haven't checked in today." });

    attendance.logoutTime = getISTTimeString();
    await attendance.save();

    res.status(200).json({ message: "Checked out successfully." });
});

// 📌 Fetch Attendance Records API
app.get("/attendance", authenticate, async (req, res) => {
    const { employeeName } = req.user;
    
    try {
        const records = await Attendance.find({ employeeName }).sort({ date: -1 });
        res.status(200).json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Function to Get Current IST Time (HH:mm:ss format)
function getISTTimeString() {
    const now = new Date();
    const ISTOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const ISTTime = new Date(now.getTime() + ISTOffset);

    const hours = String(ISTTime.getUTCHours()).padStart(2, "0");
    const minutes = String(ISTTime.getUTCMinutes()).padStart(2, "0");
    const seconds = String(ISTTime.getUTCSeconds()).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
}

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
