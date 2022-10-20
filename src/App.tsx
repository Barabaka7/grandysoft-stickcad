import { useState, useEffect, useRef, MouseEvent } from "react";
import "./App.css";
import { Line } from "./classLine";
import { Point } from "./classPoint";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startingPoint, setStartingPoint] = useState<Point>();
  const [canvasLines, setCanvasLines] = useState<Line[]>([]);
  const [intersectionsPoints, setIntersectionsPoints] = useState<Point[]>([]);
  const [tempIntersectionsPoints, setTempIntersectionsPoints] = useState<
    Point[]
  >([]);
  const [currentLine, setCurrentLine] = useState<Line>();

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;

      canvas.width = 0.9 * window.innerWidth * 2;
      canvas.height = 0.7 * window.innerHeight * 2;
      canvas.style.width = `${0.9 * window.innerWidth}px`;
      canvas.style.height = `${0.7 * window.innerHeight}px`;

      canvas.style.border = `solid 2px red`;

      const context = canvas.getContext("2d");
      if (context) {
        context.scale(2, 2);
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 2;
      }

      contextRef.current = context;
    }
  }, []);

  useEffect(() => {
    if (!canvasLines) {
      return;
    }
    canvasLines.forEach((line) => {
      let isNewPoint =
        canvasLines[canvasLines.length - 1].getIntersectionPoint(line);

      if (isNewPoint.x !== -10 && isNewPoint.y !== -10) {
        setIntersectionsPoints((prev) => [...prev, isNewPoint]);
      }
    });
  }, [canvasLines]);

  useEffect(() => {
    clearCanvas();
    redrawCanvas(canvasLines, intersectionsPoints);

    intersectionsPoints.forEach((point) => {
      if (contextRef.current) {
        point.drawRedPoint(contextRef.current);
      }
    });
    // eslint-disable-next-line
  }, [intersectionsPoints]);

  const startDrawing = ({ nativeEvent }: MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    setStartingPoint(new Point(offsetX, offsetY));
    setIsDrawing(true);
  };

  const finishDrawing = ({ nativeEvent }: MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.closePath();

    setIsDrawing(false);
    if (!startingPoint) {
      return;
    }
    setCanvasLines((prev) => {
      return [
        ...prev,
        new Line(startingPoint.x, startingPoint.y, offsetX, offsetY),
      ];
    });
  };

  const draw = ({ nativeEvent }: MouseEvent) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;

    if (canvasRef.current && startingPoint) {
      clearCanvas();
      redrawCanvas(canvasLines, intersectionsPoints);
      setTempIntersectionsPoints([]);
      contextRef.current?.beginPath();
      contextRef.current?.moveTo(startingPoint.x, startingPoint.y);
      contextRef.current?.lineTo(offsetX, offsetY);
      contextRef.current?.stroke();
      //******* Live */
      setCurrentLine(
        new Line(startingPoint.x, startingPoint.y, offsetX, offsetY)
      );

      if (currentLine) {
        canvasLines.forEach((line) => {
          let isNewPoint = line.getIntersectionPoint(currentLine);
          if (isNewPoint.x !== -10 && isNewPoint.y !== -10) {
            setTempIntersectionsPoints((prev) => [...prev, isNewPoint]);
          }
        });
      }

      if (tempIntersectionsPoints) {
        tempIntersectionsPoints.forEach((point) => {
          if (contextRef.current) {
            point.drawRedPoint(contextRef.current);
          }
        });
      }
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      contextRef.current?.clearRect(
        0,
        0,
        canvasRef.current?.width,
        canvasRef.current.height
      );
    }
  };

  const redrawCanvas = (
    canvasLinesToDraw: Line[],
    intersectionsPointsToDraw: Point[]
  ) => {
    if (canvasLinesToDraw.length === 0) {
      return;
    }

    // redraw each stored line
    for (let i = 0; i < canvasLinesToDraw.length; i++) {
      contextRef.current?.beginPath();
      contextRef.current?.moveTo(
        canvasLinesToDraw[i].x1,
        canvasLinesToDraw[i].y1
      );
      contextRef.current?.lineTo(
        canvasLinesToDraw[i].x2,
        canvasLinesToDraw[i].y2
      );
      contextRef.current?.stroke();
    }

    for (let j = 0; j < intersectionsPointsToDraw.length; j++) {
      if (contextRef.current) {
        intersectionsPointsToDraw[j].drawRedPoint(contextRef.current);
      }
    }
  };

  const clearCanvasAnimated = (canvasLinesToCollapse: Line[]) => {
    let step = 2;

    const smallerCanvasLines: Line[] = canvasLinesToCollapse.map((line) =>
      line.getSmallerLineByStepFromBothSide(step)
    );

    const filteredSmallerCanvasLines = smallerCanvasLines.filter(
      (line) =>
        Math.abs(line.x1 - line.x2) >= step + 1 ||
        Math.abs(line.y1 - line.y2) >= step + 1
    );

    let collapsingIntersectionsPoints: Point[] = [];

    filteredSmallerCanvasLines.forEach((line1, index1) => {
      filteredSmallerCanvasLines.forEach((line2, index2) => {
        if (index1 !== index2) {
          let isNewPoint = line1.getIntersectionPoint(line2);
          if (isNewPoint.x !== -10 && isNewPoint.y !== -10) {
            collapsingIntersectionsPoints.push(isNewPoint);
          }
        }
      });
    });

    if (filteredSmallerCanvasLines.length === 0) {
      clearCanvas();
      return;
    }

    clearCanvas();
    redrawCanvas(filteredSmallerCanvasLines, collapsingIntersectionsPoints);
    setTimeout(() => clearCanvasAnimated(filteredSmallerCanvasLines), 10);
  };

  return (
    <div className="App">
      <canvas
        onMouseDown={(e) => {
          if (e.button === 2) {
            if (isDrawing) {
              setIsDrawing(false);
              setStartingPoint(undefined);
              clearCanvas();
              redrawCanvas(canvasLines, intersectionsPoints);
            }
          }
        }}
        onMouseUp={(e) => {
          if (e.button === 0) {
            if (!isDrawing) {
              startDrawing(e);
            } else {
              finishDrawing(e);
            }
          }
        }}
        onMouseMove={draw}
        ref={canvasRef}
      />
      <button
        onClick={() => {
          clearCanvasAnimated(canvasLines);
          canvasLines.length = 0;
          intersectionsPoints.length = 0;
          setTempIntersectionsPoints([]);
        }}
      >
        collapse lines
      </button>
    </div>
  );
}

export default App;
