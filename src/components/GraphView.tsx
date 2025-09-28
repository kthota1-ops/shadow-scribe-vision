import { useState, useCallback } from "react";
import { GraphNode, GraphConnection, GraphViewport } from "@/types/graph";
import { GraphCanvas, GraphControls, NodeDetailPanel, NodeDetailWindow } from "./graph";
import { mockNodes, mockConnections } from "@/data/mockGraphData";

export const GraphView = () => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [viewport, setViewport] = useState<GraphViewport>({ scale: 1, offset: { x: 0, y: 0 } });
  const [nodes, setNodes] = useState<GraphNode[]>(mockNodes);
  const [connections, setConnections] = useState<GraphConnection[]>(mockConnections);
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set());
  const [windowPositions, setWindowPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedWindow, setDraggedWindow] = useState<string | null>(null);

  // Event handlers
  const handleNodeSelect = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const handleNodeDrag = useCallback((nodeId: string, newX: number, newY: number) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId 
          ? { ...node, x: newX, y: newY }
          : node
      )
    );
  }, []);

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId);
  }, []);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    setDraggedNode(nodeId);
  }, []);

  const handleViewportChange = useCallback((newViewport: GraphViewport) => {
    setViewport(newViewport);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleZoomIn = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.2) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.2) }));
  }, []);

  const handleReset = useCallback(() => {
    setViewport({ scale: 1, offset: { x: 0, y: 0 } });
  }, []);

  const openDetailWindow = useCallback((nodeId: string) => {
    setOpenWindows(prev => new Set([...prev, nodeId]));
    // Set initial position if not set
    if (!windowPositions[nodeId]) {
      const windowCount = openWindows.size;
      setWindowPositions(prev => ({
        ...prev,
        [nodeId]: { x: 100 + (windowCount * 50), y: 100 + (windowCount * 50) }
      }));
    }
  }, [openWindows, windowPositions]);

  const closeDetailWindow = useCallback((nodeId: string) => {
    setOpenWindows(prev => {
      const newSet = new Set(prev);
      newSet.delete(nodeId);
      return newSet;
    });
  }, []);

  const handleWindowMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggedWindow(nodeId);
    
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startWindowX = windowPositions[nodeId]?.x || 100;
    const startWindowY = windowPositions[nodeId]?.y || 100;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      
      setWindowPositions(prev => ({
        ...prev,
        [nodeId]: {
          x: Math.max(0, Math.min(window.innerWidth - 384, startWindowX + deltaX)),
          y: Math.max(0, Math.min(window.innerHeight - 100, startWindowY + deltaY))
        }
      }));
    };
    
    const handleMouseUp = () => {
      setDraggedWindow(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [windowPositions]);

  return (
    <div className="h-full bg-background-tertiary relative overflow-hidden">
      {/* Graph Canvas */}
      <GraphCanvas
        nodes={nodes}
        connections={connections}
        viewport={viewport}
        selectedNode={selectedNode}
        hoveredNode={hoveredNode}
        draggedNode={draggedNode}
        onNodeSelect={handleNodeSelect}
        onNodeDrag={handleNodeDrag}
        onNodeHover={handleNodeHover}
        onNodeMouseDown={handleNodeMouseDown}
        onViewportChange={handleViewportChange}
        onCanvasClick={handleCanvasClick}
      />

      {/* Controls */}
      <GraphControls
        scale={viewport.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />

      {/* Node Details Panel */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          position={{ x: 0, y: 0 }} // Position is calculated inside the component
          scale={viewport.scale}
          offset={viewport.offset}
          onExpand={openDetailWindow}
        />
      )}

      {/* Detail Windows */}
      {Array.from(openWindows).map((nodeId, index) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return null;

        const position = windowPositions[nodeId] || { x: 100 + (index * 50), y: 100 + (index * 50) };
        const isDragged = draggedWindow === nodeId;
        
        return (
          <NodeDetailWindow
            key={nodeId}
            node={node}
            position={position}
            isDragged={isDragged}
            onClose={() => closeDetailWindow(nodeId)}
            onDrag={handleWindowMouseDown}
          />
        );
      })}
    </div>
  );
};