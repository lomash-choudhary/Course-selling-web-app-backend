const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId

const userSchema = new Schema({
  email: {type: String, unique: true},
  password: String,
  firstName: String,
  lastName: String
})

const courseSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  imageUrl: String,
  creatorId: ObjectId
})

const adminSchema = new Schema ({
  email: {type: String, unique: true},
  password: String,
  firstName: String,
  lastName: String
})

const purchaseSchema = new Schema ({
  userId: ObjectId,
  courseId: ObjectId
})

const userModel = mongoose.model("users", userSchema);
const courseModel = mongoose.model("courses", courseSchema);
const adminModel = mongoose.model("admin", adminSchema);
const purchaseModel = mongoose.model("purchases", purchaseSchema);

module.exports = {
  userModel,
  courseModel,
  adminModel,
  purchaseModel
}