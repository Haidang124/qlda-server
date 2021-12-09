module.exports = (server) => {
  let io = require("socket.io").listen(server);
  const nsGame = io.of("project");
  const room = {};
  const socketUser = {};
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
    /**
     * data:
     */
    socket.on("joinRoom", (data) => {
      socket.join(data.roomId);
    });
    socket.on("createdPost", (data) => {
      io.of("project").to(data.roomId).emit("loadPost", { data: data });
    });
    socket.on("chatting", (data) => {
      io.of("project").to(data.roomId).emit("loadChat", { data: data });
    });

    /**
     * data: roomId, userId
     */
    socket.on("online", (data) => {
      socketUser[socket.id] = { roomId: data.roomId };
      if (room[data.roomId] === undefined) {
        room[data.roomId] = {};
        room[data.roomId].socketId = [];
        room[data.roomId].userId = [];
      }
      room[data.roomId].socketId.push(socket.id);
      room[data.roomId].userId.push(data.userId);
      room[data.roomId][socket.id] = {
        id: socket.id,
        userId: data.userId,
      };
      socket.join(data.roomId);
      io.of("project")
        .to(data.roomId)
        .emit("reloadUserOnline", room[data.roomId].userId);
    });
    socket.on("loadOnline", () => {
      if (!socketUser[socket.id]) {
        return;
      }
      let roomId = socketUser[socket.id].roomId;
      io.of("project").to(roomId).emit("reloadUserOnline", room[roomId].userId);
    });
    socket.on("loadMember", (data) => {
      let roomId = socketUser[socket.id].roomId;
      io.of("project").to(roomId).emit("reloadMember", data);
    });
    socket.on("disconnect", () => {
      if (!socketUser[socket.id]) {
        return;
      }
      let roomId = socketUser[socket.id].roomId;
      let userId = room[roomId][socket.id].userId;
      delete socketUser[socket.id];
      delete room[roomId][socket.id];
      if (room[roomId].userId.indexOf(userId) !== -1) {
        room[roomId].userId.splice(room[roomId].userId.indexOf(userId), 1);
      }
      if (room[roomId].socketId.indexOf(socket.id) !== -1) {
        room[roomId].userId.splice(room[roomId].socketId.indexOf(socket.id), 1);
      }
      io.of("project")
        .to("online")
        .emit("reloadUserOnline", room[roomId].userId);
    });
  });
  return io;
};
