const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static(__dirname + '/client'));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});
const port = process.env.PORT || 2000;

const mongoose = require('mongoose');
const User = require('./models/user');
const Document = require('./models/document');
const File = require('./models/file');

const uri = "mongodb+srv://nanocheck:iPNNEole7FRCFplF@noteversecluster.oxlnj.mongodb.net/documents";
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
let db = mongoose.connection;

function findPropertyInArray(array, property, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].property == value) {
      return i;
    }
  }
  return -1;
}

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
    let user = new User({
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
 * Creates new folder for the given user
 * @param uid: author's UUID
 * @param fileName: name of new folder
 * @param parentFolderId: _id of folder containing the new folder
 */
app.post('/newFile', async (req, res) => {
  let fileInfo = req.query;
  console.log('newFile', req.query);
  if (!fileInfo) {
    return res.sendStatus(400);
  }

  let fileObj = {
    isFile: fileInfo.isFile,
    fileName: fileInfo.fileName,
    authorUID: fileInfo.uid,
    parentFolderId: fileInfo.parentFolderId,
    dateCreated: new Date(),
    dateModified: new Date()
  };

  if (fileInfo.isFile == true) {
    let docObj = {
      name: fileInfo.fileName,
      authorUID: fileInfo.uid,
      dateCreated: new Date(),
      dateLastEdited: new Date(),
      visibility: 'restricted'
    };

    let fileSetup = new File(fileObj);
    docObj.pointerToFile = fileSetup._id;

    let docSetup = new Document(docObj);
    await docSetup.save();
    await fileSetup.save();
  } else {
    let location = [];
    
    console.log('loc1', location);

    if (fileInfo.parentFolderId != 'root') {
      let currFolder = await File.findById(fileInfo.parentFolderId).exec();
      while (currFolder.parentFolderId != 'root') {
        location.unshift(currFolder.parentFolderId);
        currFolder = await File.findById(currFolder.parentFolderId).exec();
      }
    }
    
    location.unshift('root');

    console.log('saving location', location);

    fileObj.depth = location.length;
    fileObj.location = location;

    let folderSetup = new File(fileObj);
    await folderSetup.save();
  }
  res.status(201).send('added document');
})

/**
 * Update file/folder based on query
 * @param query: query object to find file/folder
 * @param update: object with key-value pairs to update
 * @returns old name and new name of file/folder
 */
app.post('/updateFolder', (req, res) => {
  let update = req.query;
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
app.post('/deleteFile', async (req, res) => {
  let query = req.query;

  if (!query) return res.sendStatus(400);


  console.log(query.idToDelete);
  await File.findByIdAndDelete(query.idToDelete).exec();
  
  let subFiles = await File.find({location: query.idToDelete}).exec();

  for (let file of subFiles) {
    await File.findByIdAndDelete(file._id).exec();
  }

  return res.status(200).json({success: true});
})

/**
 * Get files/folders in given folder
 * @param uid: authorUUID
 * @param parentFolderId: _id of parent folder (id=root if in root folder)
 * @returns array of files/folders
 */
app.get('/getDocuments', async (req, res) => {
  let pathInfo = req.query;
  console.log(req.query);
  if (!pathInfo) {
    return res.sendStatus(400);
  }

  let allDocs = await File.find({
    $and: [
      { parentFolderId: pathInfo.parentFolderId },
      { $or: [
        { authorUID: pathInfo.uid },
        {
          userPermissions: {
            $elemMatch: {
              authorUID: pathInfo.uid
            }
          }
        }
      ]}
    ]
  }).exec();
    
  for (let i = 0; i < allDocs.length; i++) {
    if (allDocs[i].isPointer) {
      console.log('doc is poitner');
      let pointerFile = await File.findById(allDocs[i].pointerTo).exec();
      if (pointerFile) {
        let thisUsersPerms;
        for (let perm of pointerFile.userPermissions) {
          if (perm.authorUID == pathInfo.uid) {
            thisUsersPerms = perm;
            break;
          }
        }
        allDocs[i] = Object.assign(allDocs[i], {
          fileName: pointerFile.fileName,
          userPermissions: pointerFile.userPermissions,
          ourPerms: thisUsersPerms
        });
      }
    }
  }

  if (allDocs.length > 0) {
    return res.json(allDocs);
  }

  if (pathInfo.parentFolderId == 'root') {
    console.log('-- in root');
    return res.json(allDocs);
  } else {
    let inNewFolder = await File.findById(pathInfo.parentFolderId).exec();
  
    if (inNewFolder) {
      return res.json(allDocs);
    }
  }

  return res.status(401).send('could not find location');
})

app.get('/document', (req, res) => {
  Document.findOne({pointerToFile: req.query.docId}, (err, document) => {
    if (err) return res.status(404).send('no such documents found');
    else return res.json(document);
  });
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
  let userInfo = await User.findById(req.query.uid).exec();
  if (!userInfo) {
    console.log('wrong credentials');
    return res.status(400);
  }

  let collaborators = [];
  for (let collaboratorId of userInfo.previousCollaborators) {
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
  let fileInfo = await File.findById(req.query.fileId);
  if (!fileInfo) {
    console.log('/getCOllaborators', 'no file found');
    return res.status(400).send('no such file');
  }

  console.log('loaded collaborators', fileInfo.userPermissions);

  if (fileInfo.userPermissions && fileInfo.userPermissions.length > 0)
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
  let userInfo = await User.findById(req.query.uid).exec();
  if (!userInfo) return res.status(400).send('wrong uid');

  let fileInfo = await File.findById(req.query.fileId).exec();
  if (!fileInfo) return res.status(400).send('no file');

  console.log(`updating collaborators`, req.query.collaborators);

  // stores collaborator ids
  let currCollabIds = [];
  for (let userPerm of fileInfo.userPermissions) {
    currCollabIds.push(userPerm.authorUID);
  }
  
  let resUIDs = [];

  let len = req.query.collaborators ? req.query.collaborators.length : 0;

  let addedCollaborator = false;

  for (let i = 0; i < len; i++) {
    let collaborator = req.query.collaborators[i];
    resUIDs.push(collaborator.authorUID);
    
    /* add collaborator if not already there */
    if (!currCollabIds.includes(collaborator.authorUID)) {
      addedCollaborator = true;
      await File.updateOne({_id: req.query.fileId}, {$addToSet: {userPermissions: collaborator}}).exec();
      const newFile = new File({
        authorUID: collaborator.authorUID,
        isFile: fileInfo.isFile,
        isPointer: true,
        isShared: true,
        pointerTo: req.query.fileId,
        parentFolderId: 'root',
        dateAdded: new Date(),
        dateModified: new Date()
      });
      newFile.save();
    }

    /* update collaborator if already there */
    else {
      await File.updateOne({_id: req.query.fileId, 'userPermissions.authorUID': collaborator.authorUID}, {$set: {
        'userPermissions.$.editingMode': collaborator.editingMode,
        'userPermissions.$.canShare': collaborator.canShare
      }}).exec();
    }
    
    await User.updateOne({_id: req.query.uid}, {$addToSet: {previousCollaborators: collaborator.authorUID}}).exec();
    await User.updateOne({_id: collaborator.authorUID}, {$addToSet: {previousCollaborators: req.query.uid}}).exec();
  }
  
  /* remove collaborators */
  let collaboratorsToRemove = fileInfo.userPermissions.filter(el => !resUIDs.includes(el.authorUID));

  for (let toRemove of collaboratorsToRemove) {
    await File.updateOne({_id: req.query.fileId}, {$pull: {
      userPermissions: {
        authorUID: toRemove.authorUID
      }
    }}).exec();
    await File.findOneAndRemove({authorUID: toRemove.authorUID, pointerTo: req.query.fileId}).exec();
  }

  /* update subfiles */
  if (!fileInfo.isFile) {
    const queue = await File.find({authorUID: req.query.uid, parentFolderId: req.query.fileId}).exec();

    while (queue.length > 0) {
      const currFile = queue.shift();

      if (!currFile.isFile) {
        const subFiles = await File.find({authorUID: req.query.uid, parentFolderId: currFile._id}).exec();
        if (subFiles) {
          for (const file of subFiles) {
            queue.push(file);
          }
        }
      }

      if (req.query.collaborators) {
        for (const collaborator of req.query.collaborators) {
          await File.updateOne({_id: currFile._id}, {
            $addToSet: {userPermissions: collaborator}
          }).exec();
        }
      }

      for (const toRemove of collaboratorsToRemove) {
        await File.updateOne({_id: currFile._id}, {$pull: {
          userPermissions: {
            authorUID: toRemove.authorUID
          }
        }}).exec();
      }

      let finalDoc = await File.findById(currFile._id).exec();
      if (finalDoc.userPermissions.length == 0)
        await File.updateOne({_id: currFile._id}, {isShared: false}).exec();
      else if (!finalDoc.isShared)
        await File.updateOne({_id: currFile._id}, {isShared: true}).exec();
    }
  }

  /* check if folder has collaborators to update whether it's shared or not */
  let finalFileInfo = await File.findById(req.query.fileId).exec();
  let hasCollaborators = finalFileInfo.userPermissions.length > 0;
  
  if (hasCollaborators != finalFileInfo.isShared) {
    await File.updateOne({_id: req.query.fileId}, {
      isShared: hasCollaborators
    }).exec();
  }
  
  console.log('completed!');
  return res.status(200).json({good: true});  
})


let docsToSockets = {};
let socketsToDoc = {};

io.on('connection', socket => {
  socket.on('disconnect', () => {
    if (docsToSockets[socketsToDoc[socket.id]]) {
      docsToSockets[socketsToDoc[socket.id]] = docsToSockets[socketsToDoc[socket.id]].filter(el => el != socket.id);
      delete socketsToDoc[socket.id]; 
    }
  })

  socket.on('confirmDocId', docId => {
    if (!docsToSockets[docId]) docsToSockets[docId] = [];
    if (!docsToSockets[docId].includes(socket.id)) {
      docsToSockets[docId].push(socket.id);
      if (socketsToDoc[socket.id]) {
        docsToSockets[docId] = docsToSockets[docId].filter(el => el != socket.id);
      }
      socketsToDoc[socket.id] = docId;
    }
    console.log('docsToSocket', docsToSockets);
    console.log('socketsToDoc', socketsToDoc);
  })

  socket.on('stroke', stroke => {
    for (let id of docsToSockets[socketsToDoc[socket.id]]) {
      if (id != socket.id) {
        io.to(id).emit('syncStroke', stroke);
        console.log('sending', stroke.length, 'to sync');
      }
    }
  })

  socket.on('send', (msg, ...data) => {
    for (let id of docsToSockets[socketsToDoc[socket.id]]) {
      if (id != socket.id) {
        console.log(socket.id, 'is sending', ...data, 'to', id);
        io.to(id).emit(msg, ...data);
      }
    }
  })
  
  socket.on('saveStroke', async data => {
    let doc = await Document.findOne({pointerToFile: data.docId}).exec();
    if (doc.pages && doc.pages.length > 0) {
      await Document.updateOne({pointerToFile: data.docId}, {
        $push: {
          'pages.0.strokes': {
            authorUID: data.uid,
            points: data.stroke.points,
            style: data.stroke.style
          }
        }
      }).exec();
    } else {
      await Document.updateOne({pointerToFile: data.docId}, {
        $addToSet: {
          pages: {
            strokes: {
              authorUID: data.uid,
              points: data.stroke.points,
              style: data.stroke.style
            }
          }
        }
      }).exec();
    }
  })
})

http.listen(port, function(){
  console.log('listening on 127.0.0.1:' + port.toString());
});