import { useState, useEffect, useRef, MouseEvent } from "react";
import "./App.css";
import {
  getIntersectionPoint,
  LineCoord,
  PointCoord,
} from "./helpers/intersection";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startingPoint, setStartingPoint] = useState<PointCoord>();
  const [canvasLines, setCanvasLines] = useState<LineCoord[]>([]);
  const [intersectionsPoints, setIntersectionsPoints] = useState<PointCoord[]>(
    []
  );
  const [tempIntersectionsPoints, setTempIntersectionsPoints] = useState<
    PointCoord[]
  >([]);
  const [currentLine, setCurrentLine] = useState<LineCoord>();

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
      let isNewPoint: PointCoord = getIntersectionPoint(
        line,
        canvasLines[canvasLines.length - 1]
      );
      if (isNewPoint[0] !== -10 && isNewPoint[1] !== -10) {
        setIntersectionsPoints((prev) => [...prev, isNewPoint]);
      }
    });
  }, [canvasLines]);

  useEffect(() => {
    clearCanvas();
    redrawCanvas(canvasLines, intersectionsPoints);

    intersectionsPoints.forEach((point) => {
      drawPoint(point);
    });
  }, [intersectionsPoints]);

  const startDrawing = ({ nativeEvent }: MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    setStartingPoint([offsetX, offsetY]);
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
      return [...prev, [...startingPoint, offsetX, offsetY]];
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
      contextRef.current?.moveTo(startingPoint[0], startingPoint[1]);
      contextRef.current?.lineTo(offsetX, offsetY);
      contextRef.current?.stroke();
      //******* Live */
      setCurrentLine([...startingPoint, offsetX, offsetY]);

      if (currentLine) {
        canvasLines.forEach((line) => {
          let isNewPoint: PointCoord = getIntersectionPoint(line, currentLine);
          if (isNewPoint[0] !== -10 && isNewPoint[1] !== -10) {
            setTempIntersectionsPoints((prev) => [...prev, isNewPoint]);
          }
        });
      }

      if (tempIntersectionsPoints) {
        tempIntersectionsPoints.forEach((point) => {
          drawPoint(point);
        });
      }
    }
  };

  const drawPoint = (point: PointCoord) => {
    if (contextRef.current) {
      contextRef.current.fillStyle = "red";
      contextRef.current.strokeStyle = "black";
      contextRef.current.beginPath();
      contextRef.current.arc(point[0], point[1], 5, 0, 2 * Math.PI);
      contextRef.current.fill();
      contextRef.current.stroke();
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
    canvasLinesToDraw: LineCoord[],
    intersectionsPointsToDraw: PointCoord[]
  ) => {
    if (canvasLinesToDraw.length === 0) {
      return;
    }

    // redraw each stored line
    for (let i = 0; i < canvasLinesToDraw.length; i++) {
      contextRef.current?.beginPath();
      contextRef.current?.moveTo(
        canvasLinesToDraw[i][0],
        canvasLinesToDraw[i][1]
      );
      contextRef.current?.lineTo(
        canvasLinesToDraw[i][2],
        canvasLinesToDraw[i][3]
      );
      contextRef.current?.stroke();
    }

    for (let j = 0; j < intersectionsPointsToDraw.length; j++) {
      drawPoint(intersectionsPointsToDraw[j]);
    }
  };

  const clearCanvasAnimated = (canvasLinesToCollapse: LineCoord[]) => {
    let step = 2;
    const smallerCanvasLines: LineCoord[] = canvasLinesToCollapse.map(
      (line) => {
        let k = (line[1] - line[3]) / (line[0] - line[2]);
        let b = line[1] - k * line[0];
        let x1, x2: number;

        if (line[0] < line[2]) {
          x1 = line[0] + step;
          x2 = line[2] - step;
        } else {
          x1 = line[0] - step;
          x2 = line[2] + step;
        }

        let y1 = k * x1 + b;
        let y2 = k * x2 + b;

        return [x1, y1, x2, y2];
      }
    );

    const filteredSmallerCanvasLines = smallerCanvasLines.filter(
      (line) => Math.abs(line[0] - line[2]) >= step + 1
    );

    let collapsingIntersectionsPoints: PointCoord[] = [];

    filteredSmallerCanvasLines.forEach((line1, index1) => {
      filteredSmallerCanvasLines.forEach((line2, index2) => {
        if (index1 !== index2) {
          let isNewPoint: PointCoord = getIntersectionPoint(line1, line2);
          if (isNewPoint[0] !== -10 && isNewPoint[1] !== -10) {
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
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
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
