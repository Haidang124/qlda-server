const usersRouter = require("./usersRouter");
const postRouter = require("./postRouter");
const momoRouter = require("./momoRouter");
const projectRouter = require("./projectRouter");
const taskRouter = require("./taskRouter");
const mailer = require("./mailRouter");

const commentRouter = require("./commentRouter");

const { cloudinary } = require("../helper/cloudinary");
const {
  handleErrorResponse,
  handleSuccessResponse,
} = require("../helper/responseHelper");

module.exports = (app) => {
  app.use("/api/momo", momoRouter);
  app.use("/api/user", usersRouter);
  app.use("/api/post", postRouter);
  app.use("/api/project", projectRouter);
  app.use("/api/comment", commentRouter);
  app.use("/api/task", taskRouter);
  app.use("/api/mailer", mailer);
  app.get("/api/images", async (req, res) => {
    const { resources } = await cloudinary.search
      .expression("folder:dev_setups")
      .sort_by("public_id", "desc")
      .max_results(30)
      .execute();

    const publicIds = resources.map((file) => file.public_id);
    res.send(publicIds);
  });
  app.post("/api/upload/", async (req, res) => {
    try {
      const fileStr = req.body.data;
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: "dev_setups",
      });
      console.log(uploadResponse);
      return handleSuccessResponse(
        res,
        200,
        { uploadResponse: uploadResponse },
        "Upload thành công !"
      );
    } catch (err) {
      console.error(err);
      return handleErrorResponse(res, 500, "Something went wrong !");
    }
  });
};
