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

const mongoose = require('mongoose');
const uri = "mongodb+srv://nanocheck:abd6K5BKjFFBBr7@noteversecluster.oxlnj.mongodb.net/mydb";
mongoose.connect(uri, { useNewUrlParser: true });

var Point = mongoose.Schema({
  x: Number,
  Y: Number
})

var Transform = mongoose.Schema({
  position: Point,
  dimensions: {
    height: Number,
    width: Number
  },
  rotation: Number
})

var Action = mongoose.Schema({
  authorUID: String,
  type: {
    type: String,
    enum: ['add', 'delete', 'update']
  },
  target: String
})

var Author = mongoose.Schema({
  authorUID: String,
  passwordHash: String,
  name: {
    first: String,
    last: String
  },
  username: String,
  profilePic: Buffer
})

var documentSchema = mongoose.Schema({
  authorUID: String,
  dateCreated: Date,
  dateLastEdited: Date,
  visibility: {
    type: String,
    enum: ['private', 'restricted', 'public'],
    default: 'restricted' 
  },
  userPermissions: [{
    authorUID: String,
    editingMode: {
      type: String,
      enum: ['viewing', 'suggesting', 'editing'],
      default: 'editing'
    },
    share: Boolean
  }],
  actionQueue: [Action],
  theme: {
    backgroundColor: String,
    pageSize: {
      type: String,
      enum: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'C5E', 'Comm10E', 'DLE', 'Executive', 'Folio', 'Ledger', 'Legal', 'Letter', 'Tabloid'],
      default: 'A4'
    },
  },
  pages: [{
    textFields: [{
      authorUID: String,
      transform: Transform,
      color: String
    }],
    images: [{
      authorUID: String,
      transform: Transform,
      data: Buffer
    }],
    strokes: [{
      authorUID: String,
      transform: Transform,
      color: String,
      points: [Point],
      thickness: [Number]
    }]
  }]
})

var Document = mongoose.model('Document');

client.connect((err, db) => {
  if (err) throw err;
  client.close();
});


io.on('connection', socket => {
  
})

http.listen(port, function(){
  console.log('listening on 127.0.0.1:' + port.toString());
});
  