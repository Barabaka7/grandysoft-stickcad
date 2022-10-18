const getIntersectionPoint = (a, b) => {
  let det, gamma, lambda;
  det = (a[2] - a[0]) * (b[3] - b[1]) - (b[2] - b[0]) * (a[3] - a[1]);
  if (det === 0) {
    let p = [0, 0];
    return p;
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
      console.log(`px ${px}`);

      return [Math.floor(px), Math.floor(py)];
    } else {
      return [0, 0];
    }
  }
};

//let i = getIntersectionPoint([85, 45, 260, 180], [225, 75, 65, 260]);

let i = getIntersectionPoint([475, 104, 223, 210], [598, 125, 773, 239]);

console.log(i);