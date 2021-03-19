import Two from 'two.js';

function getRelativeMousePosition(e, scale) {
  const rect = e.target.getBoundingClientRect();
  const pos = {
    x: (e.clientX - rect.left) / scale,
    y: (-(rect.top - e.clientY)) / scale,
  };
  return pos;
}

function getAbsoluteMousePosition(pos, target) {
  if (pos.target)
    target = pos.target;

  const rect = target.getBoundingClientRect();
  return {
    x: pos.x + rect.left,
    y: pos.y + rect.top,
  };
}

function pixToIn(pos, target) {
  if (pos.target)
    target = pos.target;
  
  const rect = target.getBoundingClientRect();
  const pixInIn = (rect.right - rect.left) / 8;

  return {
    x: pos.x / pixInIn,
    y: pos.y / pixInIn,
  };
}

function inToPix(pos, target) {
  if (pos.target)
    target = pos.target;
  
  const rect = target.getBoundingClientRect();
  const pixInIn = (rect.right - rect.left) / 8;

  return {
    x: pos.x * pixInIn,
    y: pos.y * pixInIn,
  };
}

function makePoint(pos) {
  const v = new Two.Vector(pos.x, pos.y);
  v.position = new Two.Vector().copy(v);
  return v;
}

function getTrueMousePosition(e, target, scale) {
  const f = {
    target,
    clientX: e.clientX,
    clientY: e.clientY,
  };
  return getRelativeMousePosition(f, scale);
}

function uuid() {
  var d = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16;
    r = (d + r)%16 | 0;
    d = Math.floor(d/16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export {
  getRelativeMousePosition,
  getAbsoluteMousePosition,
  makePoint,
  getTrueMousePosition,
  uuid,
  inToPix,
  pixToIn,
};
