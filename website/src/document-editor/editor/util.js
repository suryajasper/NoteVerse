import Two from 'two.js';

function getRelativeMousePosition(e, scale) {
  const rect = e.target.getBoundingClientRect();
  const raw_pos = e.clientX ? e : {clientX: e.x, clientY: e.y};
  const pos = {
    x: (raw_pos.clientX - rect.left) / scale,
    y: (-(rect.top - raw_pos.clientY)) / scale,
  };
  return pos;
}

function pixToIn(pos, target) {
  if (pos.target)
    target = pos.target;
  
  const rect = target.getBoundingClientRect();
  const pixInIn = (rect.right - rect.left) / 8;

  return {
    x: (pos.x || pos.clientX) / pixInIn,
    y: (pos.y || pos.clientY) / pixInIn,
  };
}

function inToPix(pos, target) {
  if (pos.target)
    target = pos.target;
  
  const rect = target.getBoundingClientRect();
  const pixInIn = (rect.right - rect.left) / 8;

  return {
    x: (pos.x || pos.clientX) * pixInIn,
    y: (pos.y || pos.clientY) * pixInIn,
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

function pointInRect(x1, y1, x2, y2, x, y)
{
  return (x > x1 && x < x2 && y > y1 && y < y2);
}

function pointInPolygon(polygon, p)
{
  let angle = 0;

  let p1 = {x: 0, y: 0};
  let p2 = {x: 0, y: 0};

  let n = polygon.length;

  for (let i = 0; i < n; i++) {
    p1.x = polygon[i].x - p.x;
    p1.y = polygon[i].y - p.y;

    p2.x = polygon[(i+1)%n].x - p.x;
    p2.y = polygon[(i+1)%n].y - p.y;

    angle += Angle2D(p1.x,p1.y,p2.x,p2.y);
  }

  return !(Math.abs(angle) < Math.PI);
}

function Angle2D(x1, y1, x2, y2)
{
  let theta1 = Math.atan2(y1,x1);
  let theta2 = Math.atan2(y2,x2);
  let dtheta = theta2 - theta1;

  while (dtheta > Math.PI)
    dtheta -= 2*Math.PI;
  while (dtheta < -Math.PI)
    dtheta += 2*Math.PI;
  
  return dtheta;
}

export {
  getRelativeMousePosition,
  makePoint,
  getTrueMousePosition,
  uuid,
  inToPix,
  pixToIn,
  pointInRect,
  pointInPolygon,
};
