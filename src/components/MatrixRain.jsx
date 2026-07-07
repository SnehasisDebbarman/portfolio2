import React, { useEffect, useRef } from "react";

export default function MatrixRain({ onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Characters: mix of binary, katakana, and numbers
    const chars = "0101010101ABCDEFGHIJKLMNOPQRSTUVWXYZｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
    const charArray = chars.split("");

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Array to track the y-coordinate of the rain drops for each column
    const rainDrops = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = Math.random() * -canvas.height; // Staggered starting heights
    }

    let animationFrameId;

    const draw = () => {
      // Semi-transparent black background to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0F0"; // Neon green text
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < rainDrops.length; i++) {
        // Pick a random character
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Draw the character
        const x = i * fontSize;
        const y = rainDrops[i];

        // Highlight the head of the drop with white
        if (Math.random() > 0.98) {
          ctx.fillStyle = "#FFF";
        } else {
          ctx.fillStyle = "#00FF66";
        }
        
        ctx.fillText(text, x, y);

        // Reset drop back to top once it goes past screen height + a random offset
        if (y > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }

        // Move drop downwards
        rainDrops[i] += fontSize;
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Event listener to close the matrix overlay on any interaction
    const handleClose = () => {
      if (onClose) onClose();
    };

    canvas.addEventListener("click", handleClose);
    window.addEventListener("keydown", handleClose);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleClose);
    };
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-50 cursor-pointer overflow-hidden rounded-b-lg">
      <canvas ref={canvasRef} className="w-full h-full block bg-black" />
      <div className="absolute bottom-4 right-4 text-xs font-mono text-[#0F0] animate-pulse pointer-events-none select-none bg-black/75 px-3 py-1 rounded border border-[#0F0]/30">
        Press ANY key or click to EXIT matrix mode
      </div>
    </div>
  );
}
