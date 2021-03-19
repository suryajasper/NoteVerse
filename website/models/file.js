const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');

var FileSchema = mongoose.Schema({
  authorUID: String,
  isFile: Boolean,
  isPointer: Boolean,
  isShared: {
    type: Boolean,
    default: false
  },
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
  permParentPointer: {
    id: ObjectID,
    depth: Number
  },
  fileName: String,
  parentFolderId: String,
  location: [String],
  depth: Number,
  dateAdded: Date,
  dateModified: Date
});

module.exports = mongoose.model('File', FileSchema);