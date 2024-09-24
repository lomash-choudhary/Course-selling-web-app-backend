const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_SECRET } = require("../config")
const { adminMiddleware } = require("../middleware/admin")

//admin sign in end point 
adminRouter.post("/signup",async function (req, res) {
  const requireBody = z.object({
    email: z.string().min(3, "please enter a valid email").max(100, "please enter a valid email").email(),
    password: z.string()
    .min(8, "password should be of minimum of 8 characters")
    .regex(/[A-Z]/, "password should contain atleast one uppercase")
    .regex(/[a-z]/, "password should contain atlease one lower case")
    .regex(/[0-9]/, "password should contain atleast one numeric character")
    .regex(/[\W_]/, "password should contain atleast one special character"),
    firstName: z.string().min(1, "enter a valid name").max(100, "enter a valid name"),
    lastName: z.string().min(1, "enter a valid name").max(100, "enter a valid name")
  })

  const parsedBody = requireBody.safeParse(req.body);

  if(parsedBody.error){
    return res.json({
      error: parsedBody.error.errors
    })
  }

  const { email, password, firstName, lastName } = req.body;

  const hashedPassword = await bcrypt.hash(password, 5)

  try{
    const admin = await adminModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName
    })

    res.json({
      message: "user Signed up on the app",
      adminId: admin._id
    })
  }
  catch(err){
    res.json({
      message: "user with this email already exists"
    })
  }
})

//singin end point
adminRouter.post("/signin", async function (req, res) {
  const {email, password, firstName, lastName} = req.body;

  const user = await adminModel.findOne({
    email: email
  })

  if(!user){
    return res.json({
      message: "user does not exists"
    })
  }

  const comparedPassword = await bcrypt.compare(password, user.password)
  if(!comparedPassword){
    return res.json({
      message: "entered password is wrong"
    })
  }

  const token = jwt.sign({
    id: user._id.toString()
  }, JWT_ADMIN_SECRET)

  res.json({
    token: token
  })  

})

//admin can add courses 
adminRouter.post("/course", adminMiddleware, async function(req, res) {
  adminId = req.adminId
  const {title, description, imageUrl, price} = req.body;

  if(!title || !description || !imageUrl || !price){
    return res.json({
      message: "please enter all the fileds"
    })
  }

  const course = await courseModel.create({
    title,
    description,
    imageUrl,
    price,
    creatorId: adminId
  })
  res.json({
    message: "course created",
    courseId: course._id
  })

})

//admin can update thier course
adminRouter.put("/course", adminMiddleware, async function (req, res){
  const adminId = req.adminId
  const { title, description, imageUrl, price, courseId } = req.body;
  try{
    const course = await courseModel.findOneAndUpdate(
      {
        _id: courseId,
        creatorId: adminId
      },
      {
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price,
      }
    )
    res.json({
      message: "coruse updated for the given id",
      courseId: course._id
    })
  }
  catch(err){
    res.json({
      message: "unable to update the course"
    })
  }
})

//delete course
adminRouter.delete("/course",adminMiddleware, async function(req, res) {
  const adminId = req.adminId;
  const { courseId } = req.body;
  
    const response = await courseModel.findOneAndDelete(
      {
        _id: courseId,
        creatorId: adminId
      }
    )
    if(!response){
      return res.json({
        message: "either the admin is not allowed to delete this course or this course does not exists"
      })
    }
    res.json({
      message: "coourse deleted of the given courseID"
    })    
})


//admin can see all their added course
adminRouter.get("/courses",adminMiddleware, async function (req, res) {
  const adminId = req.adminId;
  const courses = await courseModel.find({ 
    creatorId: adminId
  })
  res.json({
    courses
  })
    
})
module.exports = {
  adminRouter
}