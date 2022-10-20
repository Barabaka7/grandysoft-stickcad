import { Point } from "./classPoint";

export class Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
  }

  get lineCoord() {
    return { x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2 };
  }

  getIntersectionPoint(lineToCheck: Line) {
    let det, gamma, lambda: number;
    let noIntersection = new Point(-10, -10);

    det =
      (lineToCheck.x2 - lineToCheck.x1) * (this.y2 - this.y1) -
      (this.x2 - this.x1) * (lineToCheck.y2 - lineToCheck.y1);

    if (det === 0) {
      return noIntersection;
    } else {
      lambda =
        ((this.y2 - this.y1) * (this.x2 - lineToCheck.x1) +
          (this.x1 - this.x2) * (this.y2 - lineToCheck.y1)) /
        det;

      gamma =
        ((lineToCheck.y1 - lineToCheck.y2) * (this.x2 - lineToCheck.x1) +
          (lineToCheck.x2 - lineToCheck.x1) * (this.y2 - lineToCheck.y1)) /
        det;

      if (0 < lambda && lambda < 1 && 0 < gamma && gamma < 1) {
        let u1 =
          lineToCheck.x1 * lineToCheck.y2 - lineToCheck.y1 * lineToCheck.x2; // (x1 * y2 - y1 * x2)
        let u4 = this.x1 * this.y2 - this.y1 * this.x2; // (x3 * y4 - y3 * x4)

        // intersection point formula

        let px =
          (u1 * (this.x1 - this.x2) - (lineToCheck.x1 - lineToCheck.x2) * u4) /
          det;
        let py =
          (u1 * (this.y1 - this.y2) - (lineToCheck.y1 - lineToCheck.y2) * u4) /
          det;

        let p = new Point(Math.floor(px), Math.floor(py));
        return p;
      } else {
        return noIntersection;
      }
    }
  }

  getSmallerLineByStepFromBothSide(step: number): Line {
    let k = (this.y1 - this.y2) / (this.x1 - this.x2);
    let b = this.y1 - k * this.x1;
    let x1, x2, y1, y2: number;

    if (Math.abs(this.x1 - this.x2) >= Math.abs(this.y1 - this.y2)) {
      if (this.x1 < this.x2) {
        x1 = this.x1 + step;
        x2 = this.x2 - step;
      } else {
        x1 = this.x1 - step;
        x2 = this.x2 + step;
      }

      y1 = k * x1 + b;
      y2 = k * x2 + b;
    } else {
      if (this.y1 < this.y2) {
        y1 = this.y1 + step;
        y2 = this.y2 - step;
      } else {
        y1 = this.y1 - step;
        y2 = this.y2 + step;
      }

      x1 = (y1 - b) / k;
      x2 = (y2 - b) / k;
    }

    return new Line(x1, y1, x2, y2);
  }
}
