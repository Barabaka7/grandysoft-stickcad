import React, { useState, useEffect, useRef, MouseEvent } from "react";
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

      // canvas.width = window.innerWidth * 2;
      // canvas.height = window.innerHeight * 2;
      // canvas.style.width = `${window.innerWidth}px`;
      // canvas.style.height = `${window.innerHeight}px`;

      canvas.width = 1600;
      canvas.height = 1000;
      canvas.style.width = `800px`;
      canvas.style.height = `500px`;

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

    // clearCanvas();
    // redrawCanvas();
  };

  const draw = ({ nativeEvent }: MouseEvent) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;

    if (canvasRef.current && startingPoint) {
      clearCanvas();
      redrawCanvas();
      setCurrentLine(undefined);
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

  const redrawCanvas = () => {
    if (canvasLines.length === 0) {
      return;
    }

    // redraw each stored line
    for (let i = 0; i < canvasLines.length; i++) {
      contextRef.current?.beginPath();
      contextRef.current?.moveTo(canvasLines[i][0], canvasLines[i][1]);
      contextRef.current?.lineTo(canvasLines[i][2], canvasLines[i][3]);
      contextRef.current?.stroke();
    }

    for (let j = 0; j < intersectionsPoints.length; j++) {
      drawPoint(intersectionsPoints[j]);
    }
  };

  return (
    <div className="App">
      <button
        onClick={() => {
          clearCanvas();
          canvasLines.length = 0;
          intersectionsPoints.length = 0;
        }}
      >
        collapse lines
      </button>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
      />
    </div>
  );
}

export default App;
