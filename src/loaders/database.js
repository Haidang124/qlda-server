const mongoose = require("mongoose");
module.exports = () => {
  var config = {
    port: process.env.DB_PORT || 27017,
    database: process.env.DB_NAME || "qlda-server",
    dbHost: process.env.DB_HOST || "localhost",
  };
  mongoose.connect(
    `mongodb://${config.dbHost}:${config.port}/${config.database}`,
    {
      useFindAndModify: false,
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
      reconnectInterval: 500, // Reconnect every 500ms
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    }
  );
  var conn = mongoose.connection;
  conn.once("open", function () {
    console.log("connected mongodb");
  });
  return conn;
};
