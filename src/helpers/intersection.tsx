export type LineCoord = [number, number, number, number];
export type PointCoord = [number, number];

export const getIntersectionPoint = (a: LineCoord, b: LineCoord) => {
  let det, gamma, lambda: number;
  let nothing: PointCoord = [-10, -10];

  det = (a[2] - a[0]) * (b[3] - b[1]) - (b[2] - b[0]) * (a[3] - a[1]);
  if (det === 0) {
    return nothing;
  } else {
    lambda =
      ((b[3] - b[1]) * (b[2] - a[0]) + (b[0] - b[2]) * (b[3] - a[1])) / det;
    gamma =
      ((a[1] - a[3]) * (b[2] - a[0]) + (a[2] - a[0]) * (b[3] - a[1])) / det;
    if (0 < lambda && lambda < 1 && 0 < gamma && gamma < 1) {
      let u1 = a[0] * a[3] - a[1] * a[2]; // (x1 * y2 - y1 * x2)
      let u4 = b[0] * b[3] - b[1] * b[2]; // (x3 * y4 - y3 * x4)

      // intersection point formula

      let px = (u1 * (b[0] - b[2]) - (a[0] - a[2]) * u4) / det;
      let py = (u1 * (b[1] - b[3]) - (a[1] - a[3]) * u4) / det;

      let p: PointCoord = [Math.floor(px), Math.floor(py)];
      return p;
    } else {
      return nothing;
    }
  }
};
