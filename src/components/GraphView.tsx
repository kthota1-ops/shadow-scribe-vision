import { useState, useRef, useCallback } from "react";
import { FileText, Network, HardDrive, Shield, AlertTriangle, Zap } from "lucide-react";
import { Card } from "./ui/card";

interface GraphNode {
  id: string;
  type: "file" | "network" | "registry" | "process" | "threat" | "system";
  label: string;
  x: number;
  y: number;
  connections: string[];
  details: {
    description: string;
    riskLevel: "low" | "medium" | "high" | "critical";
    metadata: Record<string, string>;
  };
}

const mockNodes: GraphNode[] = [
  {
    id: "1",
    type: "file",
    label: "malware.exe",
    x: 200,
    y: 150,
    connections: ["2", "3"],
    details: {
      description: "Suspicious executable file detected",
      riskLevel: "critical",
      metadata: {
        "File Size": "2.3 MB",
        "Hash (MD5)": "d41d8cd98f00b204e9800998ecf8427e",
        "First Seen": "2024-01-15 14:30:22"
      }
    }
  },
  {
    id: "2",
    type: "network",
    label: "TCP 443",
    x: 400,
    y: 100,
    connections: ["4"],
    details: {
      description: "Outbound HTTPS connection",
      riskLevel: "high",
      metadata: {
        "Destination": "185.123.45.67",
        "Port": "443",
        "Protocol": "HTTPS"
      }
    }
  },
  {
    id: "3",
    type: "registry",
    label: "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
    x: 300,
    y: 300,
    connections: [],
    details: {
      description: "Registry modification for persistence",
      riskLevel: "high",
      metadata: {
        "Action": "Write",
        "Value": "malware.exe",
        "Type": "REG_SZ"
      }
    }
  },
  {
    id: "4",
    type: "threat",
    label: "C&C Server",
    x: 600,
    y: 150,
    connections: [],
    details: {
      description: "Command and control server communication",
      riskLevel: "critical",
      metadata: {
        "IP": "185.123.45.67",
        "Geolocation": "Russia",
        "Known Threat": "APT29"
      }
    }
  }
];

export const GraphView = () => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [nodes, setNodes] = useState(mockNodes);
  const svgRef = useRef<SVGSVGElement>(null);

  const getNodeIcon = (type: GraphNode["type"]) => {
    switch (type) {
      case "file": return FileText;
      case "network": return Network;
      case "registry": return HardDrive;
      case "process": return Zap;
      case "threat": return AlertTriangle;
      case "system": return Shield;
      default: return FileText;
    }
  };

  const getNodeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical": return "hsl(0 84% 60%)"; // destructive
      case "high": return "hsl(25 95% 53%)"; // orange
      case "medium": return "hsl(45 93% 47%)"; // yellow  
      case "low": return "hsl(142 76% 36%)"; // green
      default: return "hsl(var(--muted-foreground))"; // muted
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.max(0.5, Math.min(3, scale + e.deltaY * -0.001));
    setScale(newScale);
  };

  const handleNodeDrag = useCallback((nodeId: string, newX: number, newY: number) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId 
          ? { ...node, x: newX, y: newY }
          : node
      )
    );
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggedNode(nodeId);
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Store initial positions
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startNodeX = node.x;
    const startNodeY = node.y;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse movement in SVG coordinates
      const mouseX = (e.clientX - startMouseX) / scale;
      const mouseY = (e.clientY - startMouseY) / scale;
      
      // Update node position relative to its starting position
      const newX = startNodeX + mouseX;
      const newY = startNodeY + mouseY;
      
      handleNodeDrag(nodeId, newX, newY);
    };
    
    const handleMouseUp = () => {
      setDraggedNode(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleNodeDrag, scale, nodes]);

  return (
    <div className="h-full bg-background-tertiary relative overflow-hidden">
      {/* Graph Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onClick={() => setSelectedNode(null)}
      >
        <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
          {/* Connections */}
          {nodes.map((node) =>
            node.connections.map((targetId) => {
              const targetNode = nodes.find((n) => n.id === targetId);
              if (!targetNode) return null;
              
              const isHighlighted = hoveredNode === node.id || hoveredNode === targetId;
              
              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={node.x}
                  y1={node.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={isHighlighted ? getNodeColor(node.details.riskLevel) : "hsl(var(--primary))"}
                  strokeWidth={isHighlighted ? "4" : "2"}
                  opacity={isHighlighted ? "0.8" : "0.4"}
                  className={isHighlighted ? "animate-pulse" : "transition-all duration-300"}
                  style={{
                    filter: isHighlighted ? `drop-shadow(0 0 8px ${getNodeColor(node.details.riskLevel)})` : 'none'
                  }}
                />
              );
            })
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const Icon = getNodeIcon(node.type);
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode?.id === node.id;
            const isDragged = draggedNode === node.id;
            
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`cursor-pointer transition-all duration-300 ease-smooth ${isDragged ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ 
                  transformOrigin: '0 0',
                  transform: `translate(${node.x}px, ${node.y}px) scale(${isHovered && !isDragged ? 1.15 : isSelected ? 1.05 : 1})`,
                  transition: isDragged ? 'none' : 'transform 0.2s ease-out'
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                }}
              >
                {/* Outer glow effect */}
                <circle
                  cx="0"
                  cy="0"
                  r={isHovered && !isDragged ? "40" : "35"}
                  fill={getNodeColor(node.details.riskLevel)}
                  opacity={isHovered && !isDragged ? "0.3" : "0.2"}
                  className={isHovered && !isDragged ? "animate-pulse" : ""}
                  style={{
                    filter: isHovered && !isDragged ? `blur(2px)` : 'blur(1px)',
                    transition: isDragged ? 'none' : 'all 0.2s ease'
                  }}
                />
                
                {/* Middle glow */}
                {isHovered && !isDragged && (
                  <circle
                    cx="0"
                    cy="0"
                    r="30"
                    fill={getNodeColor(node.details.riskLevel)}
                    opacity="0.4"
                    style={{ filter: 'blur(1px)' }}
                  />
                )}
                
                {/* Node background */}
                <circle
                  cx="0"
                  cy="0"
                  r="25"
                  fill="hsl(var(--card))"
                  stroke={getNodeColor(node.details.riskLevel)}
                  strokeWidth={isSelected ? "4" : "3"}
                  className="transition-all duration-300"
                  style={{
                    filter: isHovered || isDragged ? `drop-shadow(0 0 15px ${getNodeColor(node.details.riskLevel)})` : 
                            isSelected ? `drop-shadow(0 0 8px ${getNodeColor(node.details.riskLevel)})` : 'none'
                  }}
                />
                
                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx="0"
                    cy="0"
                    r="30"
                    fill="none"
                    stroke={getNodeColor(node.details.riskLevel)}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.8"
                    className="animate-spin"
                    style={{ animationDuration: '3s' }}
                  />
                )}
                
                {/* Node icon */}
                <foreignObject 
                  x="-12" 
                  y="-12" 
                  width="24" 
                  height="24" 
                  className="pointer-events-none transition-all duration-300"
                  style={{
                    transform: isHovered || isDragged ? 'scale(1.2)' : 'scale(1)',
                    filter: isHovered || isDragged ? `drop-shadow(0 0 5px ${getNodeColor(node.details.riskLevel)})` : 'none'
                  }}
                >
                  <Icon
                    className="w-6 h-6 transition-all duration-300"
                    style={{ 
                      color: getNodeColor(node.details.riskLevel),
                      filter: isHovered || isDragged ? 'brightness(1.3)' : 'brightness(1)'
                    }}
                  />
                </foreignObject>
                
                {/* Node label */}
                <text
                  x="0"
                  y="45"
                  textAnchor="middle"
                  className="fill-foreground font-medium pointer-events-none select-none transition-all duration-300"
                  style={{ 
                    fontSize: isHovered || isDragged ? "14px" : "12px",
                    filter: isHovered || isDragged ? `drop-shadow(0 0 3px hsl(var(--foreground)))` : 'none'
                  }}
                >
                  {node.label.length > 15 ? node.label.slice(0, 15) + "..." : node.label}
                </text>
                
                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x="-60"
                      y="-80"
                      width="120"
                      height="30"
                      fill="hsl(var(--popover))"
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      rx="6"
                      className="animate-fade-in"
                      style={{
                        filter: 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.1))'
                      }}
                    />
                    <text
                      x="0"
                      y="-68"
                      textAnchor="middle"
                      className="fill-popover-foreground text-xs font-medium pointer-events-none select-none"
                      style={{ fontSize: "10px" }}
                    >
                      {node.details.riskLevel.toUpperCase()}
                    </text>
                    <text
                      x="0"
                      y="-58"
                      textAnchor="middle"
                      className="fill-muted-foreground text-xs pointer-events-none select-none"
                      style={{ fontSize: "9px" }}
                    >
                      Click to select
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setScale(s => Math.min(3, s + 0.2))}
          className="w-10 h-10 rounded-lg bg-background-secondary border border-border hover:bg-accent transition-colors text-foreground text-lg font-bold"
        >
          +
        </button>
        <button
          onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
          className="w-10 h-10 rounded-lg bg-background-secondary border border-border hover:bg-accent transition-colors text-foreground text-lg font-bold"
        >
          −
        </button>
        <button
          onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
          className="w-10 h-10 rounded-lg bg-background-secondary border border-border hover:bg-accent transition-colors text-foreground text-xs font-medium"
        >
          Reset
        </button>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <Card className="absolute top-4 left-4 w-80 bg-background-secondary border-border shadow-glow-soft">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              {(() => {
                const Icon = getNodeIcon(selectedNode.type);
                return <Icon className="w-6 h-6" style={{ color: getNodeColor(selectedNode.details.riskLevel) }} />;
              })()}
              <div>
                <h3 className="font-semibold text-foreground">{selectedNode.label}</h3>
                <p className="text-sm text-muted-foreground capitalize">{selectedNode.type}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm text-foreground">{selectedNode.details.description}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <span
                  className="inline-block px-2 py-1 rounded text-xs font-medium uppercase"
                  style={{
                    backgroundColor: getNodeColor(selectedNode.details.riskLevel) + "20",
                    color: getNodeColor(selectedNode.details.riskLevel)
                  }}
                >
                  {selectedNode.details.riskLevel}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Metadata</p>
                <div className="space-y-1">
                  {Object.entries(selectedNode.details.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="text-foreground font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};