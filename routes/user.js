const { Router } = require("express");
const userRouter = Router();
const { userModel, purchaseModel, courseModel} = require("../db");
const bcrypt = require("bcrypt");
const { z } = require("zod")
const jwt = require("jsonwebtoken");
const { JWT_USER_SECRET }= require("../config")
const { userMiddleware } = require("../middleware/user");

//signup end point
userRouter.post("/signup", async function (req, res) {
  const requireBody = z.object({
    email: z.string().min(3, "please enter a valid email").max(100,"please enter a valid email").email(),
    password: z.string()
    .min(8, "password should be 8 characters long")
    .regex(/[A-Z]/, "password should contain atleast one uppercase")
    .regex(/[a-z]/, "password must contain atleast one lower case")
    .regex(/[0-9]/, "password must contain atleast one numeric character")
    .regex(/[\W_]/, "password must contain atleast one special character"),
    firstName: z.string().min(1, "enter a valid first name").max(50, "enter a valid first name"),
    lastName: z.string().min(1, "please enter a valid last name").max(50, "enter a valid last name")
  })

  const parsedBody = requireBody.safeParse(req.body);

  if(parsedBody.error){
    return res.json({
      error: parsedBody.error.errors
    })
  }

  const { email, password, firstName, lastName} = req.body;

  const hashedPassword = await bcrypt.hash(password, 5)
  try{
    const user = await userModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName
    })
    res.json({
      message: "user signed up on the app successfully",
      userId: user._id
    })
  }
  catch(err){
    res.json({
      message: "user with this email already exists"
    })
  }
})

//signin end point
userRouter.post("/signin", async function (req, res) {
  try{
    const { email, password, firstName, lastName } = req.body;
    const user = await userModel.findOne({
      email: email
    })

    const comparedPassword = await bcrypt.compare(password, user.password)
    
    if(!comparedPassword){
      return res.json({
        message: "password is incorrect"
      })
    }

    const token = jwt.sign({
      id: user._id
    },JWT_USER_SECRET)
    res.json({
      token: token
    })
  }
  catch(err){
    res.json({
      message: "provide valid data to sign up"
    })
  }
})

//see purchased course
userRouter.get("/purchases",userMiddleware, async function (req, res) {
  userId = req.userId;
  try{
    const purchases = await purchaseModel.find({
      userId
    })
    const coursesdata = await courseModel.find({
      _id: {$in: purchases.map(x => x.courseId)}
    })
    res.json({
      purchases,  
      coursesdata
    })
  }
  catch(err){
    res.json({
      message: "user does not have any course which he purchased"
    })
  }
})

module.exports = {
  userRouter
}