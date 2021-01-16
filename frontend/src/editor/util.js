import Two from 'two.js';

function getRelativeMousePosition(e, scale) {
  const rect = e.target.getBoundingClientRect();
  const pos = {
    x: (e.clientX - rect.left) / scale,
    y: (-(rect.top - e.clientY)) / scale,
  };
  return pos;
}

function makePoint(pos) {
  const v = new Two.Vector(pos.x, pos.y);
  v.position = new Two.Vector().copy(v);
  return v;
}

export {
  getRelativeMousePosition,
  makePoint,
};
