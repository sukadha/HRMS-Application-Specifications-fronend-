const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb+srv://tarun:tarunsai2341@cluster0.tbd0fbb.mongodb.net/mydatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Error:", err));


const UserSchema = new mongoose.Schema({
    name: { type:String, required: true },
    email: { type: String, required: true, unique: true },    
    password: { type: String, required: true },
    profilePic: { type: String, default: "https://cdn.pixabay.com/photo/2017/01/31/21/22/avatar-2027363_640.png" } // Default avatar

});

const User = mongoose.model("User", UserSchema);

app.post("/signup", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Validate Inputs
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "Signup successful!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        res.json({ 
            success: true, 
            message: "Login successful", 
            name: user.name,   // Send user name
            profilePic: user.profilePic || "https://cdn.pixabay.com/photo/2017/01/31/21/22/avatar-2027363_640.png"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
});




let otpStore = {};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "tarunsaisrinivas7@gmail.com",
        pass: "cgtw trom outi dsdw"
    }
});

app.post("/send-otp", (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    const mailOptions = {
        from: "tarunsaisrinivas4@gmail.com",
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            res.json({ success: false, message: "Error sending OTP" });
        } else {
            res.json({ success: true, message: "OTP sent successfully" });
        }
    });
});


app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    if (otpStore[email] && otpStore[email] == otp) {
        delete otpStore[email];
        res.json({ success: true, message: "OTP verified" });
    } else {
        res.json({ success: false, message: "Invalid OTP" });
    }
});

app.listen(5000, () => {
   
    console.log("Server running on port 5000");
});
