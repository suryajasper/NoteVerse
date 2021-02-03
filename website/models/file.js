const mongoose = require('mongoose');

var FileSchema = mongoose.Schema({
  authorUID: String,
  isFile: Boolean,
  fileName: String,
  parentFolderId: String,
  dateAdded: Date,
  dateModified: Date
});

module.exports = mongoose.model('File', FileSchema);