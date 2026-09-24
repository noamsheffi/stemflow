"use client";

import Link from "next/link";
import dagre from "@dagrejs/dagre";
import {
  Background,
  Controls,
  Handle,
  ReactFlow,
  ReactFlowProvider,
  Position,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  type OnNodeDrag,
} from "@xyflow/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { courseAppPath } from "../lib/course-data";
import styles from "./concept-mind-map.module.css";

type Entry = { id: string; title: string; english: string; lesson: string; category: string; summary: string; search: string; connections: string[] };
type MindNodeData = {
  title: string;
  subtitle: string;
  href?: string;
  expanded: boolean;
  childCount: number;
  onToggle: (id: string) => void;
};
type MindNode = Node<MindNodeData, "mind">;

const rootId = "communication-systems-root";
const anchorIds = ["block-diagram", "transmitter", "receiver", "channel-noise", "filters", "time-freq-domains", "oscillator", "modulation-am"];
const nodeWidth = 312;
const nodeHeight = 94;
const rootWidth = 312;
const rootHeight = 94;

const MindMapNode = memo(function MindMapNode({ id, data }: NodeProps<MindNode>) {
  return (
    <div className={`${styles.node} ${id === rootId ? styles.rootNode : ""}`} dir="rtl">
      <span className={styles.nodeText}>
        {data.href ? <Link href={data.href} className={styles.nodeLink} draggable={false}>{data.title}</Link> : <strong>{data.title}</strong>}
        <small dir={id === rootId ? "rtl" : "ltr"}>{data.subtitle}</small>
      </span>
      {data.childCount > 0 && <button className={`${styles.expandButton} nodrag nopan`} type="button" onClick={() => data.onToggle(id)} aria-label={`${data.expanded ? "קיפול" : "פתיחת"} ענף ${data.title}`} aria-expanded={data.expanded}><span aria-hidden="true">{data.expanded ? "‹" : "›"}</span></button>}
      <Handle type="target" position={Position.Left} className={styles.flowHandle} />
      <Handle type="source" position={Position.Right} className={styles.flowHandle} />
    </div>
  );
});

const nodeTypes: NodeTypes = { mind: MindMapNode };

function makeTree(entries: Entry[]) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const neighbors = new Map(entries.map((entry) => [entry.id, new Set(entry.connections.filter((id) => byId.has(id)))]));
  for (const entry of entries) {
    for (const relatedId of entry.connections) neighbors.get(relatedId)?.add(entry.id);
  }

  const roots = anchorIds.filter((id) => byId.has(id));
  const parent = new Map<string, string>(roots.map((id) => [id, rootId]));
  const queue = [...roots];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    for (const neighbor of neighbors.get(current) ?? []) {
      if (!parent.has(neighbor)) {
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }
  for (const entry of entries) {
    if (!parent.has(entry.id)) parent.set(entry.id, rootId);
  }

  const children = new Map<string, string[]>();
  for (const [child, parentId] of parent) {
    const current = children.get(parentId) ?? [];
    current.push(child);
    children.set(parentId, current);
  }
  return { byId, parent, children };
}

function ConceptMindMapInner({ entries, visibleIds }: { entries: Entry[]; visibleIds: string[] }) {
  const { fitView } = useReactFlow<MindNode, Edge>();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([rootId]));
  const [nodes, setNodes, onNodesChange] = useNodesState<MindNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const movedPositions = useRef<Record<string, { x: number; y: number }>>({});
  const tree = useMemo(() => makeTree(entries), [entries]);
  const visible = useMemo(() => {
    const ids = new Set(visibleIds);
    const included = new Set<string>([rootId]);
    for (const id of ids) {
      let current: string | undefined = id;
      while (current && current !== rootId) {
        included.add(current);
        current = tree.parent.get(current);
      }
    }
    return included;
  }, [tree, visibleIds]);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const graph = new dagre.graphlib.Graph();
    graph.setDefaultEdgeLabel(() => ({}));
    graph.setGraph({ rankdir: "LR", nodesep: 24, ranksep: 100, edgesep: 18, marginx: 34, marginy: 34 });

    const renderedIds = new Set<string>();
    const visit = (id: string) => {
      if (renderedIds.has(id) || !visible.has(id)) return;
      renderedIds.add(id);
      if (expanded.has(id)) for (const child of tree.children.get(id) ?? []) visit(child);
    };
    visit(rootId);

    for (const id of renderedIds) graph.setNode(id, { width: id === rootId ? rootWidth : nodeWidth, height: id === rootId ? rootHeight : nodeHeight });
    for (const id of renderedIds) {
      if (id === rootId) continue;
      const parentId = tree.parent.get(id);
      if (parentId && renderedIds.has(parentId)) graph.setEdge(parentId, id);
    }
    dagre.layout(graph);

    const nextNodes: MindNode[] = [...renderedIds].map((id) => {
      const point = graph.node(id);
      const entry = tree.byId.get(id);
      const childIds = (tree.children.get(id) ?? []).filter((child) => visible.has(child));
      const title = id === rootId ? "מערכות תקשורת" : entry?.title ?? "מושג";
      return {
        id,
        type: "mind",
        position: movedPositions.current[id] ?? { x: point.x - point.width / 2, y: point.y - point.height / 2 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          title,
          subtitle: id === rootId ? "מפת מושגים אינטראקטיבית" : entry?.english ?? "",
          href: entry ? `${courseAppPath("concepts")}/${entry.id}` : undefined,
          expanded: expanded.has(id),
          childCount: childIds.length,
          onToggle: toggleExpanded,
        },
        width: point.width,
        height: point.height,
        draggable: id !== rootId,
      };
    });
    const nextEdges: Edge[] = [...renderedIds].flatMap((id) => {
      if (id === rootId) return [];
      const parentId = tree.parent.get(id);
      if (!parentId || !renderedIds.has(parentId)) return [];
      return [{ id: `${parentId}-${id}`, source: parentId, target: id, type: "bezier", style: { stroke: "#8295f5", strokeWidth: 2 } }];
    });
    setNodes(nextNodes);
    setEdges(nextEdges);
    requestAnimationFrame(() => void fitView({ padding: 0.18, duration: 220 }));
  }, [expanded, fitView, setEdges, setNodes, toggleExpanded, tree, visible]);

  const rememberPosition = useCallback<OnNodeDrag<MindNode>>((_, node) => {
    movedPositions.current[node.id] = node.position;
  }, []);

  return <section className={styles.map} aria-label="מפת קשרים אינטראקטיבית">
    <div className={styles.instructions}><span>גררו נושאים להזזתם</span><span>בחרו חץ כדי לפתוח או לקפל ענף</span><span>{visibleIds.length} מושגים זמינים במפה</span></div>
    <div className={styles.canvas} dir="ltr">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeDragStop={rememberPosition} nodesDraggable nodesConnectable={false} elementsSelectable={false} fitView fitViewOptions={{ padding: 0.14 }} minZoom={0.15} maxZoom={1.6} panOnScroll zoomOnDoubleClick={false} proOptions={{ hideAttribution: true }}>
        <Background color="#dce5ef" gap={22} size={1} />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </div>
  </section>;
}

export default function ConceptMindMap(props: { entries: Entry[]; visibleIds: string[] }) {
  return <ReactFlowProvider><ConceptMindMapInner {...props} /></ReactFlowProvider>;
}
