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
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 2000;

const mongoose = require('mongoose');
const User = require('./models/user');
const Document = require('./models/document');
const File = require('./models/file');
const { deprecate } = require('util');

const uri = "mongodb+srv://nanocheck:iPNNEole7FRCFplF@noteversecluster.oxlnj.mongodb.net/documents";
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
var db = mongoose.connection;

/**
 * Sign up new user
 * @param username
 * @param email
 * @param password
 * @returns new user's UUID
 */
app.post('/createUser', (req, res) => {
  console.log('newuser', req.query);
  if (!(req.query && req.query.username && req.query.email && req.query.password)) return res.status(400).send('no data');
  User.findOne({email: req.query.email}, (err, document) => {
    if (err) return res.send(err);
    if (document != null) return res.status(400).send('email address already taken');
    console.log('passouter', req.query.password);
    console.log('good unique address');
    var user = new User({
      username: req.query.username,
      email: req.query.email,
      hash: req.query.password
    });
    // user.setPassword(req.query.password);
    user.save().then(function(newRes) {
      console.log(`${req.query.username} registered with email ${req.query.email}`);
      res.json({uid: newRes._id});
    });
  })
});

/**
 * Log in existing user
 * @param email
 * @param password
 * @returns UUID if valid
 */
app.post('/authenticateUser', (req, res) => {
  console.log('login', req.query);
  if (!(req.query && req.query.password && req.query.email)) return res.status(400).send('no data');
  User.findOne({email: req.query.email}, (err, document) => {
    if (!document || err) {
      console.log('no user found');
      return res.status(401).send('could not find user');
    }
    if (document.isValidPassword(req.query.password)) {
      return res.json({uid: document._id});
    } else {
      console.log('invalid password');
      return res.status(400).send('invalid password');
    }
  })
})

/**
 * Creates new note document for the given user
 * @param authorUUID: author's UUID
 * @param fileName
 * @param parentFolderId: _id of folder containing the new file
 */
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

/**
 * Creates new folder for the given user
 * @param uid: author's UUID
 * @param fileName: name of new folder
 * @param parentFolderId: _id of folder containing the new folder
 */
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

/**
 * Update file/folder based on query
 * @param query: query object to find file/folder
 * @param update: object with key-value pairs to update
 * @returns old name and new name of file/folder
 */
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

/**
 * Delete file or folder
 * @param idToDelete: _id of file/folder to remove
 */
app.post('/deleteFile', (req, res) => {
  var query = req.query;

  console.log('delete', query);

  if (!query) return res.sendStatus(400);

  File.findByIdAndDelete(query.idToDelete, function(err) {
    if (err) return res.status(400).send(err.message);

    return res.status(200);
  });
})

/**
 * Get files/folders in given folder
 * @param uid: authorUUID
 * @param parentFolderId: _id of parent folder (id=root if in root folder)
 * @returns array of files/folders
 */
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

/**
 * get user info based on query object
 * @param query
 * @returns user info
 */
app.get('/getUser', (req, res) => {
  User.findOne(req.query.query, (err, document) => {
    if (err) return res.status(404).send('no such user found');
    else {
      return res.json(document);
    }
  });
})

/**
 * get list of users that user has previously shared docs with
 * @param uid: authorUUID
 * @returns array of user infos for each previous collaborator
 */
app.get('/getPreviousCollaborators', async (req, res) => {
  console.log('bruh', req.query);
  var userInfo = await User.findById(req.query.uid).exec();
  if (!userInfo) {
    console.log('wrong credentials');
    return res.status(400);
  }

  var collaborators = [];
  for (var collaboratorId of userInfo.previousCollaborators) {
    collaborators.push(await User.findOne({_id: collaboratorId}).exec());
  }

  return res.json(collaborators);
})

/**
 * get collaborators for file/folder
 * @param fileId: _id of fild/folder
 * @returns array of each collaborator's access permissions
 */
app.get('/getCollaborators', async (req, res) => {
  console.log('hi');
  var fileInfo = await File.findById(req.query.fileId);
  if (!fileInfo) {
    console.log('/getCOllaborators', 'no file found');
    return res.status(400).send('no such file');
  }

  console.log('shoot', fileInfo.userPermissions);

  if (fileInfo.userPermissions)
    return res.json(fileInfo.userPermissions);
  return res.json([]);
})

/**
 * Add/remove/update collaborators for file/folder
 * Receives user permissions
 *    Adds new collaborators
 *    Updates existing collaborators
 *    Deletes collaborators that are not received
 * @param uid: authorUUID
 * @param fileId: _id for file/folder
 * @param collaborators: array of user permission objects
 *    @param collaborator.authorUID
 *    @param collaborator.editingMode: either viewing or editing
 *    @param collaborator.canShare: whether the collaborator can share the file/folder with others
 */
app.post('/updateCollaborators', async (req, res) => {
  var userInfo = await User.findById(req.query.uid).exec();
  if (!userInfo) return res.status(400).send('wrong uid');

  var fileInfo = await File.findById(req.query.fileId).exec();
  if (!fileInfo) return res.status(400).send('no file');
  
  var currCollabIds = [];
  for (var userPerm of fileInfo.userPermissions) {
    currCollabIds.push(userPerm.authorUID);
  }

  console.log('updating collaborators', currCollabIds, req.query.collaborators);

  let resUIDs = [];

  for (var i = 0; i < req.query.collaborators.length; i++) {
    let collaborator = req.query.collaborators[i];
    resUIDs.push(collaborator.authorUID);

    console.log(`[${i}/${req.query.collaborators.length}] started update`);
    
    if (!currCollabIds.includes(collaborator.authorUID)) {
      console.log(`[${i}/${req.query.collaborators.length}] doesn't exist updating`);
      await File.updateOne({_id: req.query.fileId}, {$addToSet: {userPermissions: collaborator}}).exec();
      console.log(`[${i}/${req.query.collaborators.length}] doesn't exist updated`);
    } else {
      console.log(`[${i}/${req.query.collaborators.length}] already exists updating`);
      await File.updateOne({_id: req.query.fileId, 'userPermissions.authorUID': collaborator.authorUID}, {$set: {
        'userPermissions.$.editingMode': collaborator.editingMode,
        'userPermissions.$.canShare': collaborator.canShare
      }}).exec();
      console.log(`[${i}/${req.query.collaborators.length}] already exists updated`);
    }
    
    console.log(`[${i}/${req.query.collaborators.length}] updating previous collaborators`);
    await User.updateOne({_id: req.query.uid}, {$addToSet: {previousCollaborators: collaborator.authorUID}}).exec();
    await User.updateOne({_id: collaborator.authorUID}, {$addToSet: {previousCollaborators: req.query.uid}}).exec();
    console.log(`[${i}/${req.query.collaborators.length}] updated previous collaborators`);
  }

  let idsToRemove = currCollabIds.filter(el => !resUIDs.includes(el));
  for (var toRemove of idsToRemove) {
    await File.updateOne({_id: req.query.fileId}, {$pull: {
      userPermissions: {
        authorUID: toRemove
      }
    }}).exec();
  }
  
  console.log('completed!');
  return res.status(200).json({good: true});  
})

io.on('connection', socket => {
  
})

http.listen(port, function(){
  console.log('listening on 127.0.0.1:' + port.toString());
});