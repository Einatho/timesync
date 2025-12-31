"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseDragSelectOptions {
  onSelectionComplete: (cells: Set<string>, mode: "add" | "remove") => void;
}

export function useDragSelect({ onSelectionComplete }: UseDragSelectOptions) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"add" | "remove">("add");
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [startCell, setStartCell] = useState<string | null>(null);
  const startCellWasSelected = useRef(false);

  const handleCellMouseDown = useCallback(
    (cellKey: string, isCurrentlySelected: boolean) => {
      setIsSelecting(true);
      setStartCell(cellKey);
      startCellWasSelected.current = isCurrentlySelected;
      setSelectionMode(isCurrentlySelected ? "remove" : "add");
      setSelectedCells(new Set([cellKey]));
    },
    []
  );

  const handleCellMouseEnter = useCallback(
    (cellKey: string) => {
      if (!isSelecting) return;
      setSelectedCells((prev) => new Set([...prev, cellKey]));
    },
    [isSelecting]
  );

  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectedCells.size > 0) {
      onSelectionComplete(selectedCells, selectionMode);
    }
    setIsSelecting(false);
    setSelectedCells(new Set());
    setStartCell(null);
  }, [isSelecting, selectedCells, selectionMode, onSelectionComplete]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback(
    (cellKey: string, isCurrentlySelected: boolean) => {
      handleCellMouseDown(cellKey, isCurrentlySelected);
    },
    [handleCellMouseDown]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent, getCellFromPoint: (x: number, y: number) => string | null) => {
      if (!isSelecting) return;

      const touch = e.touches[0];
      const cellKey = getCellFromPoint(touch.clientX, touch.clientY);
      if (cellKey) {
        setSelectedCells((prev) => new Set([...prev, cellKey]));
      }
    },
    [isSelecting]
  );

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        handleMouseUp();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [isSelecting, handleMouseUp]);

  return {
    isSelecting,
    selectionMode,
    selectedCells,
    startCell,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

