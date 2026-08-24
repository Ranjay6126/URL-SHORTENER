const jwt = require('jsonwebtoken');
// keep the secret in an environment variable (.env)
const secret = process.env.JWT_SECRET || "ranjay8848";


//this will create the token..
function setUser(user) {
    // const payload = {
    //     id,
    //     ...user,
    // };
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
      }, 
      secret,
    );
}

function getUser(token) {
  try {
    if (!token) return null;
    return jwt.verify(token, secret);
  } catch (error) {
    return null; // invalid / expired / tampered token
  }
}


module.exports = {
 setUser,
 getUser,

};