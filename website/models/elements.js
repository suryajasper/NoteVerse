const mongoose = require('mongoose');

var Point = mongoose.Schema({
  x: Number,
  y: Number
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
  actionType: {
    type: String,
    enum: ['add', 'delete', 'update']
  },
  target: String
})

module.exports.Point = Point;
module.exports.Transform = Transform;
module.exports.Action = Action;