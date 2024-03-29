const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');

var FileSchema = mongoose.Schema({
  authorUID: String,
  isFile: Boolean,
  isPointer: {
    type: Boolean,
    default: false
  },
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
  fileName: String,
  location: [String],
  parentFolderId: String,
  depth: Number,
  dateAdded: Date,
  dateModified: Date
});

module.exports = mongoose.model('File', FileSchema);