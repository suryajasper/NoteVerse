var express = require('express');
var app = express();
app.use(express.static(__dirname + '/client'));
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4002');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
	next();
});
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 2000; 

io.on('connection', socket => {
    socket.on('stroke', function(strokeArr) {
        socket.broadcast.emit('receivedStroke', strokeArr);
    })
})

http.listen(port, function(){
    console.log('listening on 127.0.0.1:' + port.toString());
});
  