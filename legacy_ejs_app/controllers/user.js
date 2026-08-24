const bcrypt = require("bcryptjs");

const User = require('../models/user');
const {setUser} = require('../service/auth')

//signup -> password is hashed with bcrypt before storing in MongoDB
async function handleUserSingup(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.render("signup", { error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("signup", {
                error: "Email is already registered, please login",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // log the user in right after signup
        const token = setUser(user);
        res.cookie("uid", token);
        return res.redirect("/");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Something went wrong");
    }
}

//login -> compares the password with the bcrypt hash stored in MongoDB
async function handleUserlogin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render("login", { error: "Email and Password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.render("login", { error: "Invalid Email or Password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", { error: "Invalid Email or Password" });
        }

        const token = setUser(user);
        res.cookie("uid", token);
        return res.redirect("/");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Something went wrong");
    }
}


module.exports = { 
    handleUserSingup,
    handleUserlogin,
 };
