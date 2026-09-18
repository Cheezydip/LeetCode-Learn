import React, { useEffect, useRef } from 'react';

export const GridCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 32;
    const COLOR_ORANGE = 'rgba(255, 122, 0, 0.38)';
    const COLOR_WHITE = 'rgba(240, 246, 252, 0.25)';

    let clusterCells = [];

    const initGrid = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      if (ctx.resetTransform) ctx.resetTransform();
      ctx.scale(dpr, dpr);

      const cols = Math.ceil(width / cellSize) + 2;
      const rows = Math.ceil(height / cellSize) + 2;

      clusterCells = [];
      const occupied = new Set();

      const numClusters = Math.floor((cols * rows) / 45);

      for (let i = 0; i < numClusters; i++) {
        const anchorC = Math.floor(Math.random() * (cols - 4)) + 2;
        const anchorR = Math.floor(Math.random() * (rows - 4)) + 2;
        const clusterColor = Math.random() > 0.45 ? COLOR_ORANGE : COLOR_WHITE;
        const groupSize = Math.floor(Math.random() * 5) + 3;

        const group = [{ c: anchorC, r: anchorR }];
        occupied.add(`${anchorC},${anchorR}`);

        const directions = [
          [1, 0], [-1, 0], [0, 1], [0, -1]
        ];

        let attempts = 0;
        while (group.length < groupSize && attempts < 25) {
          attempts++;
          const base = group[Math.floor(Math.random() * group.length)];
          const dir = directions[Math.floor(Math.random() * directions.length)];
          const nextC = base.c + dir[0];
          const nextR = base.r + dir[1];
          const key = `${nextC},${nextR}`;

          if (nextC >= 0 && nextC < cols && nextR >= 0 && nextR < rows && !occupied.has(key)) {
            occupied.add(key);
            group.push({ c: nextC, r: nextR });
          }
        }

        for (const cell of group) {
          clusterCells.push({ c: cell.c, r: cell.r, color: clusterColor });
        }
      }

      drawGrid(width, height);
    };

    const drawGrid = (width, height) => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(33, 38, 45, 0.55)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      for (let x = 0; x <= width + cellSize; x += cellSize) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height + cellSize);
      }
      for (let y = 0; y <= height + cellSize; y += cellSize) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width + cellSize, y + 0.5);
      }
      ctx.stroke();

      for (const cell of clusterCells) {
        ctx.fillStyle = cell.color;
        ctx.fillRect(cell.c * cellSize + 1, cell.r * cellSize + 1, cellSize - 1, cellSize - 1);
      }
    };

    window.addEventListener('resize', initGrid);
    initGrid();

    return () => {
      window.removeEventListener('resize', initGrid);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
};
