export class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get pointCoord() {
    return { x: this.x, y: this.y };
  }

  drawRedPoint(canvasContext: CanvasRenderingContext2D): void {
    canvasContext.fillStyle = "red";
    canvasContext.strokeStyle = "black";
    canvasContext.beginPath();
    canvasContext.arc(this.x, this.y, 5, 0, 2 * Math.PI);
    canvasContext.fill();
    canvasContext.stroke();
  }
}
