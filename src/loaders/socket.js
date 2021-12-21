module.exports = (server) => {
  const io = require("socket.io").listen(server);
  const nsGame = io.of("project");
  /**
   * room: {  <project._id>: {
   *                userId: [<user._id>],
   *                socketId: [<socket.id>],
   *                <socket.id>: {
   *                    id: <socket.id>,
   *                    userId: <user._id>
   *                }
   *           }
   *        }
   */
  const room = {};
  /**
   * socketUser: { <user._id>: { roomId: <project._id> } }
   */
  const socketUser = {};
  /**
   * roomAll: {allUsers: Array<user._id>, allSocket: Array<socket.id>}
   */
  const roomAll = {
    allUsers: [],
    allSocket: [],
  };
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
     * data: {roomId: project._id}
     */
    socket.on("joinRoom", (data) => {
      socket.join(data.roomId);
    });

    /**
     * data: {roomId: project._id}
     */
    socket.on("createdPost", (data) => {
      io.of("project").to(data.roomId).emit("loadPost", { data: data });
    });

    /**
     * data: {roomId: project._id}
     */
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
      socket.join("roomAll");
      roomAll.allUsers.push(data.userId);
      roomAll.allSocket.push(socket.id);
      io.of("project")
        .to(data.roomId)
        .emit("reloadUserOnline", room[data.roomId].userId);
    });

    /**
     * data: userId: string; projectId: project._id, authorId: string, type: string
     */
    socket.on("newNotification", (data) => {
      if (
        data.type === "project-invite" ||
        data.type === "project-agree-invited" ||
        data.type === "project-refuse-invited"
      ) {
        io.of("project").to("roomAll").emit("newNotification-client", data);
        io.of("project").to("roomAll").emit("notification-reload", data);
      } else {
        io.of("project")
          .to(data.projectId)
          .emit("newNotification-client", data);
        io.of("project").to(data.projectId).emit("notification-reload", data);
      }
    });

    socket.on("loadOnline", () => {
      if (!socketUser[socket.id]) {
        return;
      }
      let roomId = socketUser[socket.id].roomId;
      io.of("project").to(roomId).emit("reloadUserOnline", room[roomId].userId);
    });

    // socket.on("loadMember", (data) => {
    //   let roomId = socketUser[socket.id].roomId;
    //   io.of("project").to(roomId).emit("reloadMember", data);
    // });

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
      if (roomAll.allUsers.includes(userId)) {
        roomAll.allUsers.splice(roomAll.allUsers.indexOf(userId), 1);
        roomAll.allSocket.splice(roomAll.allSocket.indexOf(socket.id), 1);
      }
      io.of("project").to(roomId).emit("reloadUserOnline", room[roomId].userId);
    });
  });
  return io;
};
