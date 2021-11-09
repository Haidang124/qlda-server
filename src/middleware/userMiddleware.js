const jwt = require("jsonwebtoken");
const {
  handleErrorResponse,
  getCurrentId,
} = require("../helper/responseHelper");
module.exports = async (req, res, next) => {
  let id = await getCurrentId(req);
  if (id === "") {
    return handleErrorResponse(res, 401, "ErrorLogin");
  } else {
    req.id = id;
    next();
  }
};
