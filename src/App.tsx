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

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;

      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

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
      setIntersectionsPoints((prev) => [...prev, isNewPoint]);
    });
    console.log(canvasLines);
    console.log(intersectionsPoints);
  }, [canvasLines]);

  useEffect(() => {
    intersectionsPoints.forEach((point) => {
      console.log(`I will draw point ${point}`);
      drawPoint(point);
    });
  }, [intersectionsPoints]);

  const startDrawing = ({ nativeEvent }: MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    setStartingPoint([offsetX, offsetY]);
    // setCanvasLines((prev) => {
    //   return [...prev, [offsetX, offsetY]];
    // });

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
      redrawCanvas();
      contextRef.current?.beginPath();
      contextRef.current?.moveTo(startingPoint[0], startingPoint[1]);
      contextRef.current?.lineTo(offsetX, offsetY);
      contextRef.current?.stroke();
    }
  };

  const drawPoint = (point: PointCoord) => {
    if (contextRef.current) {
      contextRef.current.fillStyle = "red";
      contextRef.current.fillRect(point[0], point[1], 10, 10);
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
        Clear
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
