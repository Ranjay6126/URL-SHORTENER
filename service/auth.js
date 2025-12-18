const jwt = require('jsonwebtoken');
const secret = "ranjay8848"; // should be in env variable


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