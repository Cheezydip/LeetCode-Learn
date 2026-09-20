import React, { useEffect, useRef } from 'react';

// Deterministic PRNG (Mulberry32) for reproducible procedural cluster generation
function createPrng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CELL_SIZE = 32;
const CHUNK_ROWS = 24; // 24 rows * 32px = 768px height per chunk
const COLOR_ORANGE = 'rgba(255, 122, 0, 0.38)';
const COLOR_WHITE = 'rgba(240, 246, 252, 0.25)';
const COLOR_GRID_LINE = 'rgba(33, 38, 45, 0.55)';

/**
 * GridCanvas: Procedural clustered grid background with parallel / parallax scrolling.
 * Supports smooth, infinite vertical scrolling at a configurable speed factor.
 */
export const GridCanvas = ({ speed = 0.5, direction = -1 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let cols = Math.ceil(width / CELL_SIZE) + 2;
    const chunkCache = new Map();

    const getChunkClusters = (chunkY, currentCols) => {
      const cacheKey = `${chunkY}_${currentCols}`;
      if (chunkCache.has(cacheKey)) {
        return chunkCache.get(cacheKey);
      }

      const rand = createPrng((chunkY * 73856093) ^ 0x5bf03635);
      const baseRow = chunkY * CHUNK_ROWS;
      const numClusters = Math.floor((currentCols * CHUNK_ROWS) / 45);
      const occupied = new Set();
      const cells = [];

      const directions = [
        [1, 0], [-1, 0], [0, 1], [0, -1]
      ];

      for (let i = 0; i < numClusters; i++) {
        const anchorC = Math.floor(rand() * (currentCols - 4)) + 2;
        const anchorR = baseRow + Math.floor(rand() * (CHUNK_ROWS - 4)) + 2;
        const clusterColor = rand() > 0.45 ? COLOR_ORANGE : COLOR_WHITE;
        const groupSize = Math.floor(rand() * 5) + 3;

        const group = [{ c: anchorC, r: anchorR }];
        occupied.add(`${anchorC},${anchorR}`);

        let attempts = 0;
        while (group.length < groupSize && attempts < 25) {
          attempts++;
          const base = group[Math.floor(rand() * group.length)];
          const dir = directions[Math.floor(rand() * directions.length)];
          const nextC = base.c + dir[0];
          const nextR = base.r + dir[1];
          const key = `${nextC},${nextR}`;

          if (
            nextC >= 0 &&
            nextC < currentCols &&
            nextR >= baseRow &&
            nextR < baseRow + CHUNK_ROWS &&
            !occupied.has(key)
          ) {
            occupied.add(key);
            group.push({ c: nextC, r: nextR });
          }
        }

        for (const cell of group) {
          cells.push({ c: cell.c, r: cell.r, color: clusterColor });
        }
      }

      // Keep cache bounded
      if (chunkCache.size > 80) {
        const firstKey = chunkCache.keys().next().value;
        chunkCache.delete(firstKey);
      }

      chunkCache.set(cacheKey, cells);
      return cells;
    };

    const updateCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      cols = Math.ceil(width / CELL_SIZE) + 2;
      chunkCache.clear();

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      if (ctx.resetTransform) ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    const draw = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      // Scroll background in the opposite direction (counter-scroll)
      const offsetY = scrollY * speed * direction;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Grid Lines
      ctx.strokeStyle = COLOR_GRID_LINE;
      ctx.lineWidth = 1;
      ctx.beginPath();

      // Vertical lines
      for (let x = 0; x <= width + CELL_SIZE; x += CELL_SIZE) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
      }

      // Horizontal lines with scrolling offset
      const startRow = Math.floor(offsetY / CELL_SIZE) - 1;
      const endRow = Math.ceil((offsetY + height) / CELL_SIZE) + 1;

      for (let r = startRow; r <= endRow; r++) {
        const y = Math.round(r * CELL_SIZE - offsetY) + 0.5;
        if (y >= -1 && y <= height + 1) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
      }
      ctx.stroke();

      // 2. Draw Procedural Clusters for visible chunks
      const startChunk = Math.floor(startRow / CHUNK_ROWS);
      const endChunk = Math.floor(endRow / CHUNK_ROWS);

      for (let cy = startChunk; cy <= endChunk; cy++) {
        const clusterCells = getChunkClusters(cy, cols);
        for (let i = 0; i < clusterCells.length; i++) {
          const cell = clusterCells[i];
          const screenY = Math.round(cell.r * CELL_SIZE - offsetY);
          const screenX = cell.c * CELL_SIZE;

          if (screenY >= -CELL_SIZE && screenY <= height + CELL_SIZE) {
            ctx.fillStyle = cell.color;
            ctx.fillRect(screenX + 1, screenY + 1, CELL_SIZE - 1, CELL_SIZE - 1);
          }
        }
      }
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          draw();
          ticking = false;
        });
      }
    };

    const handleResize = () => {
      updateCanvasDimensions();
      draw();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    updateCanvasDimensions();
    draw();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [speed, direction]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
};
