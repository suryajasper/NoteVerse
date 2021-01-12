const mongoose = require('mongoose');
var {Point, Transform, Action} = require('./elements');

var documentSchema = mongoose.Schema({
  name: String,
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
    canShare: Boolean
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
    images: [String],
    strokes: [{
      authorUID: String,
      transform: Transform,
      color: String,
      points: [Point],
      thickness: [Number]
    }]
  }]
})

module.exports.Document = mongoose.model('Document', documentSchema, 'document');