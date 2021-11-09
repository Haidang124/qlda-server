const mongoose = require("mongoose");

module.exports = () => {
  var config = {
    port: "27017",
    database: "qlda-server",
  };

  mongoose.connect(`mongodb://localhost:${config.port}/${config.database}`, {
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  var conn = mongoose.connection;

  conn.once("open", function () {
    console.log("connected mongodb");
  });
  return conn;
};
