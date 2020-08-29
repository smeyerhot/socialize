// const { addUser, removeUser, getUser, getUsersInRoom } = require('./chat.controller');
import chatCtrl from '../controllers/chat.controller'


export default (server) => {
  const io = require('socket.io').listen(server)
  io.on('connect', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
      console.log(name)
      console.log(room)
      const { error, user } = chatCtrl.addUser({ id: socket.id, name, room });

      if(error) return callback(error);

      socket.join(user.room);

      socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
      socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

      io.to(user.room).emit('roomData', { room: user.room, users: chatCtrl.getUsersInRoom(user.room) });

      callback();
    });

    socket.on('sendMessage', (message, callback) => {
      const user = chatCtrl.getUser(socket.id);

      io.to(user.room).emit('message', { user: user.name, text: message });

      callback();
    });

    socket.on('disconnect', () => {
      const user = chatCtrl.removeUser(socket.id);

      if(user) {
        io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
        io.to(user.room).emit('roomData', { room: user.room, users: chatCtrl.getUsersInRoom(user.room)});
      }
    })
  });
}
// server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));