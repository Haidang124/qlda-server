const { handleSuccessResponse, getCurrentId } = require("../helper/responseHelper");
const User = require("../model/userModel");
module.exports.payment = async (req, res) => {
  var partnerCode = "MOMO";
  var accessKey = "F8BBA842ECF85";
  var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var requestId = partnerCode + new Date().getTime();
  var orderId = requestId;
  var orderInfo = "pay with MoMo";
  var redirectUrl = callBackPayment().toString();
  var ipnUrl = callBackPayment().toString();
  // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
  var amount = req.query.amount ? req.query.amount : "50000";
  var requestType = "captureWallet";
  var extraData = ""; //pass empty value if your merchant does not have stores
  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  const crypto = require("crypto");
  var signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });
  //Create the HTTPS objects
  //   console.log(requestBody);
  const https = require("https");
  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };
  const reqMomo = https.request(options, (resMomo) => {
    let result = "";
    resMomo.setEncoding("utf8");
    resMomo
      .on("data", (body) => {
        result += body;
      })
      .on("end", function () {
        handleSuccessResponse(
          res,
          200,
          { payUrl: JSON.parse(result).payUrl },
          "Thành công!"
        );
      });
    //   console.log(JSON.parse(JSON.stringify(body)));
    //   handleSuccessResponse(
    //     res,
    //     200,
    //     { payUrl: JSON.stringify(body) },
    //     "Thành công!"
    //   );
    // });
    resMomo.on("end", () => { });
  });

  req.on("error", (e) => {
    console.log(`problem with request: ${e.message}`);
  });
  reqMomo.write(requestBody);
  reqMomo.end();
};
module.exports.checkPayment = async (req, res) => {
  const { amount, message, resultCode } = req.body
  if (message === 'Successful.' && resultCode === '0') {
    let userId = await getCurrentId(req);
    let user = await User.findById(userId);
    if (user) {

      switch (amount) {
        case '50000':
          user.role = 'MemberPlus'
          break;
        case '100000':
          user.role = 'MemberPro'
          break;
        default:
          break;
      }
      user.save(function (err, obj) {
        if (err) {
          return handleErrorResponse(res, 400, null, "Thất bại");
        }
        return handleSuccessResponse(res, 200, user, "Thành công");
      });
    }
  }
};
const callBackPayment = () => {
  return "http://localhost:3001/status-payment";
};
