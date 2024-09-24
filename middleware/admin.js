const jwt = require("jsonwebtoken");
const { JWT_ADMIN_SECRET } = require("../config");

function adminMiddleware(req, res, next){
  const token = req.headers.token;
  try{
    const decodedUser = jwt.verify(token, JWT_ADMIN_SECRET);

    req.adminId = decodedUser.id;
    next();
    
  }
  catch(err){
    res.json({
      message: "You are unauthorized"
    })
  }
}

module.exports = {
  adminMiddleware: adminMiddleware
}