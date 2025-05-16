
import React, { useEffect, useRef } from 'react';

const LogoGenerator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Setze Canvas-Größe
    canvas.width = 512;
    canvas.height = 512;
    
    // Hintergrund (transparent)
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grüner Kreis im Hintergrund
    ctx.fillStyle = '#F2FCE2'; // Soft Green Hintergrund
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.fill();
    
    // Das "R" zeichnen
    ctx.font = 'bold 300px Arial';
    ctx.fillStyle = '#2E8B57'; // Sea Green für das R
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R', 256, 256);
    
    // Schatten-Effekt
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // Anleitung zum Herunterladen
    console.log('Logo generiert! Rechtsklick auf das Logo und "Bild speichern unter..." wählen, um logo.png zu erhalten.');
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">Rasenpilot Logo Generator</h1>
      <div className="border-2 border-dashed border-gray-300 p-2 rounded-lg mb-4">
        <canvas 
          ref={canvasRef} 
          width={512} 
          height={512}
          style={{ width: '256px', height: '256px' }}
          className="bg-white"
        />
      </div>
      <p className="text-sm text-gray-600 mb-2">Rechtsklick → "Bild speichern unter..." → Speichern als "logo.png"</p>
      <p className="text-sm text-gray-600">Speichern Sie die Datei im public-Verzeichnis als logo.png</p>
    </div>
  );
};

export default LogoGenerator;
