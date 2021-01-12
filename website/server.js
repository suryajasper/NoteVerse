var express = require('express');
const bodyParser = require('body-parser');
var app = express();
app.use(express.static(__dirname + '/client'));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:2000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 2000;

const mongoose = require('mongoose');
require(__dirname + '/models/user.js');
require(__dirname + '/models/document.js');
require(__dirname + '/models/elements.js');

const uri = "mongodb+srv://nanocheck:iPNNEole7FRCFplF@noteversecluster.oxlnj.mongodb.net/documents";
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
var db = mongoose.connection;

app.post('/createUser', (req, res) => {
  req.body;
  res.sendStatus(200);
});

app.post('/newDocument', (req, res) => {
  var docInfo = req.body;
  console.log(req.body);
  if (!docInfo) {
    return res.sendStatus(400);
  }
  var docSetup = new Document({
    name: docInfo.name,
    authorUID: docInfo.uid,
    dateCreated: new Date(),
    dateLastEdited: new Date(),
    visibility: 'restricted',
    userPermissions: [{
      authorUID: docInfo.uid,
      editingMode: 'editing',
      canShare: true
    }]
  });
  docSetup.save();
  res.status(201).send('added document');
})

app.post('/addCollaborator', (req, res) => {
  var collabInfo = req.body;
  if (!collabInfo) {
    return res.status(400).send('missing query');
  }
  Document.updateOne({name: collabInfo.docName}, 
    {$addToSet: { userPermissions: [{
      authorUID: collabInfo.uid,
      editingMode: collabInfo.editingMode,
      canShare: collabInfo.canShare
  }]} })
})

app.post('/updateCollaborator', (req, res) => {

})

app.get('/document', (req, res) => {
  if (req.query && req.query.name) {    
    db.collection('documents').findOne({name: req.query.name}, (err, document) => {
      if (err) return res.status(404).send('no such documents found');
      else return res.json(document);
    });
  } else {
    res.status(400).send('missing query');
  }
})

io.on('connection', socket => {
  
})

http.listen(port, function(){
  console.log('listening on 127.0.0.1:' + port.toString());
});
  