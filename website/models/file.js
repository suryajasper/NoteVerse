const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');

var FileSchema = mongoose.Schema({
  authorUID: String,
  isFile: Boolean,
  isPointer: Boolean,
  pointerTo: ObjectID,
  visibility: {
    type: String,
    enum: ['private', 'restricted', 'public'],
    default: 'restricted' 
  },
  userPermissions: [{
    authorUID: String,
    username: String,
    editingMode: {
      type: String,
      enum: ['viewing', 'editing'],
      default: 'editing'
    },
    canShare: Boolean
  }],
  fileName: String,
  parentFolderId: String,
  dateAdded: Date,
  dateModified: Date
});

module.exports = mongoose.model('File', FileSchema);