import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_BACKEND_URL, {
  transports: ["websocket"],
});



function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!canvas || !ctx) {
      console.error("Gerçek zamanlı canvas başlatılamadı.");
      return;
    }

    // **Backend'den gelen çizimleri al ve anlık olarak göster**
    socket.on("draw", ({ x, y, color }) => {
      console.log("Backend'den gelen veri:", x, y, color);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    socket.on("clear", () => {
      console.log("Canvas temizleme sinyali alındı!");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("draw");
      socket.off("clear");
    };
  }, []);

  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = "black";

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();

    socket.emit("draw", { x, y, color });
    console.log("Gönderilen veri:", x, y, color);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fetch("https://bf7b-2a02-4e0-2d30-9293-bc01-12dd-29d4-60ab.ngrok-free.app", {
      method: "POST",
    })
      .then(() => console.log("Çizimler temizlendi"))
      .catch((err) => console.error("Temizleme hatası:", err));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>Gerçek Zamanlı Çizim</h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "1px solid black" }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      <button onClick={handleClear} style={{ marginTop: 10 }}>Temizle</button>
    </div>
  );
}

export default App;
