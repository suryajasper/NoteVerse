import Two from 'two.js';
import { pointInCircle, pointInRect } from './util';

export default class SelectTransform {
  constructor({two, initSize}) {
    this.two = two;
    this.initSize = initSize;
    this.initCenter = {
      x: (this.initSize[1].x+this.initSize[0].x) / 2, 
      y: (this.initSize[1].y+this.initSize[0].y) / 2,
      width: this.initSize[1].x-this.initSize[0].x, 
      height: this.initSize[1].y-this.initSize[0].y
    };
    this.center = {x: this.initCenter.x, y: this.initCenter.y};
    this.init();
  }

  init() {
    this.resizeRect = this.two.makeRectangle(
      this.initCenter.x, this.initCenter.y,
      this.initCenter.width, this.initCenter.height,
    );

    this.resizeRect.noFill();
    this.resizeRect.stroke = '#5fb2ce';
    this.resizeRect.linewidth = 1.5;

    this.controlPoints = [];

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const controlPoint = this.two.makeCircle(this.initSize[j].x, this.initSize[i].y, 5);
        controlPoint.fill = 'white';
        controlPoint.stroke = '#5fb2ce';
        controlPoint.linewidth = 1.5;
        this.controlPoints.push(controlPoint);
      }
    }
  }

  findClick(pos) {
    for (let cp = 0; cp < this.controlPoints.length; cp++) {
      if (pointInCircle( this.controlPoints[cp].translation, this.controlPoints[cp].radius, pos )) {
        this.circleForScale = cp;
        return 'scale';
      }
    }
    if (pointInRect(this.rect, pos)) {
      return 'move';
    }
    return 'new';
  }

  move(movement) {
    this.center.x += movement.x;
    this.center.y += movement.y;

    this.resizeRect.position.add(movement);
    for (let cp of this.controlPoints)
      cp.position.add(movement);
  }

  remove() {
    this.two.remove(this.resizeRect);
    for (let cp of this.controlPoints)
      this.two.remove(cp);
  }

  moveControlPoint(shift) {

    shift.y = shift.x * (this.initCenter.height / this.initCenter.width);

    this.controlPoints[this.circleForScale].position.add(shift);
    this.controlPoints[(this.circleForScale+2)%4].position.add(new Two.Vector(shift.x, 0));

    if (this.circleForScale % 2 == 0) {
      this.controlPoints[this.circleForScale+1].position.add(new Two.Vector(0, shift.y));
    } else {
      this.controlPoints[this.circleForScale-1].position.add(new Two.Vector(0, shift.y));
    }  
    
    this.resizeRect.translation.x = Math.abs(this.controlPoints[1].translation.x+this.controlPoints[0].translation.x)/2;
    this.resizeRect.translation.y = Math.abs(this.controlPoints[2].translation.y+this.controlPoints[0].translation.y)/2;

    this.center = {x: this.resizeRect.translation.x, y: this.resizeRect.translation.y};

    this.resizeRect.width  = this.controlPoints[1].translation.x-this.controlPoints[0].translation.x;
    this.resizeRect.height = this.controlPoints[2].translation.y-this.controlPoints[0].translation.y;
    
  }

  get rect() {
    return [
      {
        x: this.center.x - this.dim.width / 2,
        y: this.center.y - this.dim.height / 2,
      },
      {
        x: this.center.x + this.dim.width / 2,
        y: this.center.y + this.dim.height / 2,
      }
    ];
  }

  get dim() {
    return {
      width : this.resizeRect.width,
      height: this.resizeRect.height,
    };
  }
}