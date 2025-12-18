const express = require("express");
const path = require("path");
const cookieParser = require('cookie-parser')

const { connectToMongoDB } = require("./connect");
const { restrictToLoggedInUserOnly } = require("./middlewares/auth");

 
const URL = require("./models/url");


//routes
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const UserRoute = require("./routes/user");

const app = express();
const PORT = 3000;

connectToMongoDB("mongodb://127.0.0.1:27017/urlshortner")
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

//using  ejs in  the server side rendring
app.set("view engine", "ejs"); // saying the express that i am using ejs
app.set("views", path.resolve("./views"));

//to pass the form data we need
app.use(express.urlencoded({ extended: false }));

//buit in middleware // to parse json data
app.use(express.json());
app.use(cookieParser());



app.use(express.static(path.join(__dirname, "public")));

//rendring the home page
// app.get('/test', async (req, res) => {
//   try {
//     const allUrls = await URL.find({});
//     res.render('home', { urls: allUrls });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// });

app.use("/url", restrictToLoggedInUserOnly, urlRoute);
app.use("/user", UserRoute);// for authentication
app.use("/", staticRoute); // using static route for the frontend

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;

  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitHistory: { timestamp: Date.now() },
      },
    },
    { new: true }
  );

  if (!entry) {
    return res.status(404).send("Short URL not found");
  }

  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => {
  console.log(`Server is listen on ${PORT}`);
});
