require("dotenv").config()
const express = require("express")
const app = express();
const port = 3000;
const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/courses");
const { adminRouter } = require("./routes/admin");
const mongoose = require("mongoose");
app.use(express.json());

app.use("/user", userRouter)
app.use("/courses", courseRouter);
app.use("/admin", adminRouter);

async function main(){
  await mongoose.connect(process.env.Mongoose_URL)
  app.listen(port, () => {
    console.log("app is listening on port", port);
  })
}
main();