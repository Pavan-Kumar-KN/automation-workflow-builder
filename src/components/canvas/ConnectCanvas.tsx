import React, { useRef, useEffect } from "react";

interface ConnectionCanvasProps {
  data: {
    branchNodes?: {
      branch1?: any[];
      otherwise?: any[];
    };
  };
}

const ConnectionCanvas: React.FC<ConnectionCanvasProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const hasNodes = (data.branchNodes?.branch1?.length || 0) > 0 || (data.branchNodes?.otherwise?.length || 0) > 0;
    const canvasWidth = hasNodes ? 800 : 1000;
    const canvasHeight = 340;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Calculate paths to align with PlaceHolderNode positioning
    // The branches are positioned with w-1/2 and px-8, so we need to calculate accordingly
    // For 800px canvas: left branch at ~200px, right branch at ~600px
    // For 1000px canvas: left branch at ~250px, right branch at ~750px
    const leftPath = hasNodes ? 200 : 250;
    const rightPath = hasNodes ? 600 : 750;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set stroke style to match PlaceHolderNode lines
    ctx.strokeStyle = "#9ca3af"; // Same gray as PlaceHolderNode
    ctx.lineWidth = 2;

    // Draw left branch path - connects to PlaceHolderNode
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 50);  // Start from router node center
    ctx.lineTo(canvasWidth / 2, 110);  // Go down
    ctx.lineTo(leftPath, 110);         // Go left
    ctx.lineTo(leftPath, 170);        // End where PlaceHolderNode top line starts
    ctx.stroke();

    // Draw right branch path - connects to PlaceHolderNode
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 50);  // Start from router node center
    ctx.lineTo(canvasWidth / 2, 110);  // Go down
    ctx.lineTo(rightPath, 110);        // Go right
    ctx.lineTo(rightPath, 170);       // End where PlaceHolderNode top line starts
    ctx.stroke();
  }, [data]);

  return (
    <div className="absolute top-0 left-0 w-full h-[340px] pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default ConnectionCanvas;
