const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static(__dirname + '/client'));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8812');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 2000;

const mongoose = require('mongoose');
const User = require('./models/user');
const Document = require('./models/document');
const File = require('./models/file');

const uri = "mongodb+srv://nanocheck:iPNNEole7FRCFplF@noteversecluster.oxlnj.mongodb.net/documents";
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
var db = mongoose.connection;


app.post('/createUser', (req, res) => {
  if (!(req.body && req.body.username && req.body.email && req.body.password)) return res.status(400).send('no data');
  User.findOne({email: req.body.email}, (err, document) => {
    if (err) return res.send(err);
    if (document != null) return res.status(400).send('email address already taken');
    console.log('passouter', req.body.password);
    console.log('good unique address');
    var user = new User({
      username: req.body.username,
      email: req.body.email,
      hash: req.body.password
    });
    // user.setPassword(req.body.password);
    user.save().then(function(newRes) {
      console.log('salt', newRes.salt);
      console.log('email', newRes.email);
      res.status(300).send('user successfully created');
    });
  })
});

app.post('/authenticateUser', (req, res) => {
  if (!(req.body && req.body.password && (req.body.username || req.body.email))) return res.status(400).send('no data');
  User.findOne({email: req.body.email}, (err, document) => {
    if (!document || err) return res.status(401).send('could not find user');
    if (document.isValidPassword(req.body.password)) {
      return res.status(200).send('valid password');
    } else {
      return res.status(400).send('invalid password');
    }
  })
})

app.post('/newDocument', (req, res) => {
  var docInfo = req.query;
  console.log('new document params', req.query);
  if (!docInfo) {
    return res.sendStatus(400);
  }
  var docSetup = new Document({
    name: docInfo.fileName,
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
  var fileSetup = new File({
    isFile: true,
    fileName: docInfo.fileName,
    authorUID: docInfo.uid,
    parentFolderId: docInfo.parentFolderId,
    dateCreated: new Date(),
    dateModified: new Date()
  });
  fileSetup.save();
  res.status(201).send('added document');
})

app.post('/newFolder', (req, res) => {
  var folderInfo = req.query;
  console.log(req.query);
  if (!folderInfo) {
    return res.sendStatus(400);
  }
  var folderSetup = new File({
    isFile: false,
    fileName: folderInfo.fileName,
    authorUID: folderInfo.uid,
    parentFolderId: folderInfo.parentFolderId,
    dateCreated: new Date(),
    dateModified: new Date()
  });
  folderSetup.save();
  res.status(201).send('added document');
})

app.post('/updateFolder', (req, res) => {
  var update = req.query;
  console.log('update', update);
  if (!update) {
    return res.sendStatus(400);
  }

  File.updateOne(update.query, update.update).then(function(result) {
    console.log('updated!');
  });
  
  return res.json({oldName: update.query.fileName, newName: update.update.fileName});
})

app.post('/deleteFile', (req, res) => {
  var query = req.query;

  console.log('delete', query);

  if (!query) return res.sendStatus(400);

  File.findByIdAndDelete(query.idToDelete, function(err) {
    if (err) return res.status(400).send(err.message);

    return res.status(200);
  });
})

app.get('/getDocuments', async (req, res) => {
  var pathInfo = req.query;
  console.log(req.query);
  if (!pathInfo) {
    return res.sendStatus(400);
  }

  var allDocs = await File.find({
    authorUID: pathInfo.uid,
    parentFolderId: pathInfo.parentFolderId
  }).exec();

  if (allDocs.length > 0) {
    return res.json(allDocs);
  }

  if (pathInfo.parentFolderId == 'root') {
    console.log('-- in root');
    return res.json(allDocs);
  } else {
    var inNewFolder = await File.findOne({
      authorUID: pathInfo.uid,
      isFile: false,
      _id: pathInfo.parentFolderId
    });
  
    if (inNewFolder) {
      return res.json(allDocs);
    }
  }

  return res.status(401).send('could not find location');
})

app.post('/addCollaborator', async (req, res) => {
  var collabInfo = req.body;
  if (!collabInfo) {
    return res.status(400).send('missing query');
  }

  var userInfo = await User.findOne({email: req.body.email});
  if (userInfo == null) return res.status(400).send('no user with matching credentials');

  var docInfo = await Document.findOne(collabInfo.docId);
  if (docInfo == null) return res.status(400).send('could not find document with id', collabInfo.docId);

  Document.updateOne({id: collabInfo.docId}, {
    $addToSet: { 
      userPermissions: [{
        authorUID: userInfo.id,
        editingMode: collabInfo.editingMode,
        canShare: collabInfo.canShare
      }]
    } 
  })
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