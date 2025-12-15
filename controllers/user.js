const {v4: uuidv4} = require('uuid')

const User = require('../models/user');
const URL = require('../models/url'); 
const {setUser} = require('../service/auth')

async function handleUserSingup(req, res) {
    try {
        const { name, email, password } = req.body;

        await User.create({ name, email, password });

        // Fetch URLs to display in the table
        const urls = await URL.find({}); // fetch all URLs or filter by user if needed

        // Pass URLs to the EJS template
        return res.render("home", { urls });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Something went wrong");
    }
}


//for the login where user is login then only can generate the urlencoded

async function handleUserlogin(req, res) {
    
        const { email, password } = req.body;
        const user = await User.findOne({email, password});
        if(!user)
            return res.render("login",{
        error: "Invalid Username or password",
        
            })
         
            //creating sessionId if all things is correct...
            const sessionId  = uuidv4();
            setUser(sessionId, user);
            res.cookie("uid", sessionId);


        // Fetch URLs to display in the table
        const urls = await URL.find({}); // fetch all URLs or filter by user if needed

        // Pass URLs to the EJS template
        return res.render("home", { urls });
}


module.exports = { 
    handleUserSingup,
    handleUserlogin,
 };
