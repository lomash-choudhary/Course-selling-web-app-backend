const jwt = require("jsonwebtoken");
const { JWT_USER_SECRET } = require("../config")

function userMiddleware(req, res, next){
  const token = req.headers.token;
  const decodedUser = jwt.verify(token, JWT_USER_SECRET);
  if(decodedUser){
    req.userId = decodedUser.id;
    next();
  }
  else{
    res.json({
      message: "user is not authorized"
    })
  }
}

module.exports = {
  userMiddleware
}