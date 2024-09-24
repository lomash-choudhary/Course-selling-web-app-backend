const { Router } = require("express");
const courseRouter = Router();
const { purchaseModel, courseModel } = require("../db");
const { userMiddleware } = require("../middleware/user")

//purchase course end point
courseRouter.post("/purchase", userMiddleware, async function (req, res) {
  const userId = req.userId;
  const courseId = req.body.courseId;
  
  const alreadyBought = await purchaseModel.findOne({
    userId: userId,
    courseId: courseId
  })

  if(alreadyBought){
    return res.json({
      message: "you have already bought the course"
    })
  }

  const firstTime = await purchaseModel.create({
    userId: userId,
    courseId: courseId
  })

  res.json({
    message: "course bought successfuly",
    purchaseId: firstTime._id
  })

})  


//see all courses
courseRouter.get("/preview", async function(req, res) {
  const courses = await courseModel.find({})
  res.json({
    courses
  })
})

  
module.exports = {
  courseRouter
}