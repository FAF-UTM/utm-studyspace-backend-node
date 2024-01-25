const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");


const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, "Super secret key", {
        expiresIn: maxAge,
    });
};

const handleErrors = (err) => {
    let errors = { email: "", password: "" };

    console.log(err);
    if (err.message === "incorrect email") {
        errors.email = "That email is not registered";
    }

    if (err.message === "incorrect password") {
        errors.password = "That password is incorrect";
    }

    if (err.code === 11000) {
        errors.email = "Email is already registered";
        return errors;
    }

    if (err.message.includes("Users validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};

module.exports.register = async (req, res, next) => {
    try {

        const { username, email, password } = req.body;
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck)
            return res.json({ errors, status: false });
        const user = await User.create({ username, email, password });
        const token = createToken(user._id);

        res.cookie("jwt", token, {
            withCredentials: true,
            httpOnly: false,
            maxAge: maxAge * 1000,
        });

        res.status(201).json({ user: user._id, created: true });
    } catch (err) {
        console.log(err);
        const errors = handleErrors(err);
        res.json({ errors, created: false });
    }
};

module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id, status: true });
    } catch (err) {
        const errors = handleErrors(err);
        res.json({ errors, status: false });
    }
};



const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports.googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, picture } = ticket.getPayload();

        // Check if user exists in DB or create a new one
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ username: name, email, password: 'your-random-password' });
        }

        // Create JWT token
        const jwtToken = createToken(user._id);
        res.cookie("jwt", jwtToken, { httpOnly: false, maxAge: maxAge * 1000 });

        res.status(200).json({ user: user._id, status: true });
    } catch (error) {
        res.status(400).json({ error: "Google authentication failed" });
    }
};
