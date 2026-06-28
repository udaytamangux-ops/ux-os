"use client";

import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { NavigationMap, NavMapNode } from "@/types";

interface NavMapBuilderProps {
  value: NavigationMap;
  onChange: (map: NavigationMap) => void;
}

type NodeKind = "page" | "entry" | "external" | "modal";

// Light-theme node styles aligned with the app's design tokens.
const nodeStyles: Record<NodeKind, React.CSSProperties> = {
  page: {
    background: "#FFFFFF",
    border: "1px solid rgba(36,77,122,0.35)",
    borderRadius: 8,
    padding: "8px 16px",
    color: "#111827",
    fontSize: 13,
    fontFamily: "var(--font-display)",
  },
  entry: {
    background: "#E4EDF8",
    border: "1px solid #244D7A",
    borderRadius: 8,
    padding: "8px 16px",
    color: "#244D7A",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "var(--font-display)",
  },
  external: {
    background: "#F9FBFF",
    border: "1px dashed rgba(24,48,84,0.3)",
    borderRadius: 8,
    padding: "8px 16px",
    color: "#7D8BA4",
    fontSize: 13,
    fontFamily: "var(--font-display)",
  },
  modal: {
    background: "#E8F0FF",
    border: "1px solid #3C609C",
    borderRadius: 8,
    padding: "8px 16px",
    color: "#3C609C",
    fontSize: 13,
    fontFamily: "var(--font-display)",
  },
};

function styleForType(type: string): React.CSSProperties {
  return nodeStyles[(type as NodeKind)] ?? nodeStyles.page;
}

export default function NavMapBuilder({ value, onChange }: NavMapBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    value.nodes.map((n) => ({
      ...n,
      type: "default",
      style: styleForType(n.type),
      data: n.data,
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(value.edges);

  // Sync to parent on change (strip rendering-only style + reactflow internals).
  useEffect(() => {
    const cleanNodes: NavMapNode[] = nodes.map((n) => {
      // Derive the semantic kind back from the node's style colour family.
      const kind = (n.data as { kind?: NodeKind })?.kind ?? "page";
      return {
        id: n.id,
        type: kind,
        position: n.position,
        data: { label: String((n.data as { label?: string })?.label ?? "") },
      };
    });
    onChange({ nodes: cleanNodes, edges: edges as unknown as NavigationMap["edges"] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: uuid(),
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(36,77,122,0.8)" },
          },
          eds
        )
      ),
    [setEdges]
  );

  const addNode = (kind: NodeKind) => {
    setNodes((nds) => {
      const i = nds.length;
      // Lay new nodes out on a grid so positions are deterministic (no Math.random).
      const newNode: Node = {
        id: uuid(),
        type: "default",
        position: { x: 120 + (i % 4) * 190, y: 100 + Math.floor(i / 4) * 120 },
        data: { label: kind === "entry" ? "Entry Point" : "New Page", kind },
        style: styleForType(kind),
      };
      return [...nds, newNode];
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 font-mono text-[11px] uppercase tracking-wider text-t2">Add Node:</span>
        {(["page", "entry", "modal", "external"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => addNode(kind)}
            className="interactive-lift focus-ring rounded-md border border-border bg-card px-3 py-1.5 text-[11px] capitalize text-t2 transition-all hover:border-border-s hover:text-t1"
          >
            + {kind}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-t3">Drag nodes · Connect handles · Delete with Backspace</span>
      </div>

      {/* React Flow Canvas */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg" style={{ height: 480 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          deleteKeyCode="Backspace"
          defaultEdgeOptions={{
            style: { stroke: "rgba(36,77,122,0.55)", strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(36,77,122,0.8)" },
          }}
        >
          <Background color="#C9D6E8" gap={20} />
          <Controls
            style={{ background: "#FFFFFF", border: "1px solid rgba(24,48,84,0.13)", borderRadius: 8 }}
          />
          <MiniMap
            style={{ background: "#F9FBFF", border: "1px solid rgba(24,48,84,0.13)", borderRadius: 8 }}
            nodeColor="#244D7A"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {[
          { type: "page", color: "text-accent", label: "Page" },
          { type: "entry", color: "text-accent", label: "Entry Point" },
          { type: "modal", color: "text-mint", label: "Modal / Overlay" },
          { type: "external", color: "text-t2", label: "External" },
        ].map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${item.color.replace("text-", "bg-")}`} />
            <span className={`font-mono text-[11px] ${item.color}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
