const nodemailer = require("nodemailer");
const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const config = require("../../config");
const User = require("../model/userModel");
const confirmMail = require("../model/confirmMailModel");
const Project = require("../model/projectModel");
const { joinProject } = require("../controllers/projectController");
const DOMAINNAME = config.DOMAINNAME;
const transporter = nodemailer.createTransport({
  service: "gmail",
  // port: 465,
  // secure: true,
  auth: {
    user: "qlda.lienhe@gmail.com",
    pass: "matkhau123",
  },
});

module.exports.sendEmail = async (req, res) => {
  let { email, projectId } = req.body;
  let userId = await getCurrentId(req);
  let member = await User.findOne({ email: email });
  if (!member) {
    return handleErrorResponse(res, 400, "ErrorEmailMember");
  }
  let project = await Project.findOne({
    $or: [
      { userId: member._id.toString() },
      { userJoin: member._id.toString() },
    ],
  });
  if (project) {
    return handleErrorResponse(res, 400, "MemberInProject"); // member đã tham gia project
  }
  if (
    !(await confirmMail.findOne({
      projectId: projectId,
      userInvited: member._id,
    }))
  ) {
    let code = new confirmMail({
      projectId: projectId,
      userInvite: userId,
      userInvited: member._id,
    });
    code.save(async function (err, obj) {
      let mainOptions = {
        from: "qlda.lienhe@gmail.com",
        to: email,
        subject: "Mail mời tham gia dự án",
        text: ``,
        html: `<a href="${DOMAINNAME}/confirm-project/${code._id}" style="text-decoration: none; padding: 10px; border: 1px solid black;">Xác nhận</a>`,
      };
      transporter.verify(function (error, success) {
        if (error) {
          return handleErrorResponse(res, 400, "ErrorConnection");
        } else {
          transporter.sendMail(mainOptions, function (err, inf) {
            if (err) {
              return handleErrorResponse(res, 400, "ErrorSendEmail");
            } else {
              return handleSuccessResponse(res, 200, {}, "SuccessSendEmail");
            }
          });
        }
      });
    });
  } else {
    let code = await confirmMail.findOne({
      projectId: projectId,
      userInvited: member._id,
    });
    let mainOptions = {
      from: "qlda.lienhe@gmail.com",
      to: email,
      subject: "Mail mời tham gia dự án",
      text: ``,
      html: `<a href="${DOMAINNAME}/confirm-project/${code._id}" style="text-decoration: none; padding: 10px; border: 1px solid black;">Xác nhận</a>`,
    };
    transporter.verify(function (error, success) {
      if (error) {
        return handleErrorResponse(res, 400, "ErrorConnection");
      } else {
        transporter.sendMail(mainOptions, function (err, inf) {
          if (err) {
            return handleErrorResponse(res, 400, "ErrorSendEmail");
          } else {
            return handleSuccessResponse(res, 200, {}, "SuccessSendEmail");
          }
        });
      }
    });
  }
};
module.exports.checkConfirmEmail = async (req, res) => {
  //req: {confirmId, memberId}
  let { confirmId } = req.body;
  let memberId = await getCurrentId(req);
  let confirm = await confirmMail.findByIdAndRemove(confirmId);
  if (!confirm) {
    return handleErrorResponse(res, 400, "FailCheckComfirm");
  }
  if (confirm.userInvited.toString() === memberId) {
    await joinProject(memberId, confirm.projectId);
    return handleSuccessResponse(
      res,
      200,
      { projectId: confirm.projectId.toString() },
      "SuccessComfirm"
    );
  }
  return handleErrorResponse(res, 400, "FailCheckComfirm");
};
