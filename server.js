var io = require('socket.io'),
  connect = require('connect');

var app = connect().use(connect.static('public')).listen(3000);
var chat_room = io.listen(app);
var connectCounter = 0;
var conn = [];

chat_room.sockets.on('connection', function (socket) {

  var nickname;
  var id;
  connectCounter = connectCounter + 1;
  id = connectCounter;
  socket.emit('entrance', {message: 'Welcome to the chat room!', id: connectCounter});

  socket.on('nickname', function(data){
  	nickname = data.message;

    chat_room.sockets.emit('entrance', { message: 'A new chatter: ' + nickname + ' is online.'});
  });

  socket.on('disconnect',function(){
    for(var i = 0; i < conn.length; i++) {

      if(conn[i].id == id){
        conn.splice(i,1);
      }
    }
    chat_room.sockets.emit('update_avatar_list_',{message: conn});
  	chat_room.sockets.emit('exit', {message: nickname + ' has disconnected. ' + id});
  
  });

  socket.on('chat', function  (data) {
    for(var i = 0; i < conn.length; i++) {

      if(conn[i].id == data.message.id){
        conn[i].current_message = data.message.current_message;
      }
    }
    chat_room.sockets.emit('update_avatar_list_',{message: conn});  
    //chat_room.sockets.emit('chat', {message: nickname + ': ' + data.message.current_message});
  });

  socket.on('new_avatar', function (data){

    conn.push(data.message);

    chat_room.sockets.emit('add_new_avatar',{message: conn});

  });
  socket.on('update_avatar_list', function (data){

    for(var i = 0; i < conn.length; i++) {

      if(conn[i].id == data.message.id){
        conn[i].x = data.message.x;
        conn[i].y = data.message.y;
      }
    }
    chat_room.sockets.emit('update_avatar_list_',{message: conn});
  });

});
