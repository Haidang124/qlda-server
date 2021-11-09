module.exports = (server) => {
  let io = require("socket.io").listen(server);
  const nsGame = io.of("project");
  const listOnline = [];
  const getSocketsbyRoomName = (roomName) => {
    if (typeof nsGame.adapter.rooms[roomName] !== "undefined") {
      let socketsId = nsGame.adapter.rooms[roomName].sockets;
      let sockets = [];
      for (const k in socketsId) {
        sockets.push(nsGame.connected[k]);
      }
      return sockets;
    } else {
      return null;
    }
  };
  const getIDbyRoomeName = (roomName) => {
    return getSocketsbyRoomName(roomName)
      ? getSocketsbyRoomName(roomName).map((socket) => socket.id)
      : null;
  };
  nsGame.on("connection", function (socket) {
    socket.on("joinRoom", (data) => {
      socket.join(data.roomId);
    });
    socket.on("createdPost", (data) => {
      io.of("project").to(data.roomId).emit("loadPost", { data: data });
    });
    socket.on("chatting", (data) => {
      console.log("hihhihi");
      io.of("project").to(data.roomId).emit("loadChat", { data: data });
    });
    socket.on("addTask", (data) => {
      io.of("project").to(data.roomId).emit("reloadTask", { data: data });
    });
    socket.on("online", (data) => {
      socket.join(data.roomId);
      listOnline.push({ socketId: socket.id, userId: data.userId });
      let listUserId = [];
      listOnline.map((value) => {
        listUserId.push(value.userId);
      });
      io.of("project")
        .to("online")
        .emit("reloadUserOnline", { data: listUserId });
    });
    socket.on("loadUserOnline", () => {
      let listUserId = [];
      listOnline.map((value) => {
        listUserId.push(value.userId);
      });
      io.of("project")
        .to("online")
        .emit("reloadUserOnline", { data: listUserId });
    });
    socket.on("loadMember", (data) => {
      io.of("project").to("online").emit("reloadMember", { data: data });
    });
    socket.on("disconnect", () => {
      for (var i = 0; i < listOnline.length; i++) {
        if (listOnline[i].socketId === socket.id) {
          listOnline.splice(i, 1);
          break;
        }
      }
      let listUserId = [];
      listOnline.map((value) => {
        listUserId.push(value.userId);
      });
      io.of("project")
        .to("online")
        .emit("reloadUserOnline", { data: listUserId });
    });
  });
  return io;
};
