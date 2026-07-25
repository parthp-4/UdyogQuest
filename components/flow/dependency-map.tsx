"use client";

import { Background, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { SourceEmpty } from "@/components/ui/source-empty";

export function DependencyMap({ items }: { items: Array<{ id: string; label: string; dependsOn: string[] }> }) {
  if (items.length === 0) return <SourceEmpty title="Dependency graph is loading" detail="The curated food and export/import route map will appear here." />;

  const nodes: Node[] = items.map((item, index) => ({
    id: item.id,
    position: { x: index * 230, y: index % 2 === 0 ? 40 : 170 },
    data: { label: item.label },
    type: "default"
  }));

  const edges: Edge[] = items.flatMap((item) =>
    item.dependsOn.map((dependency) => ({
      id: `${dependency}-${item.id}`,
      source: dependency,
      target: item.id,
      animated: true
    }))
  );

  return (
    <div className="h-[460px] overflow-hidden rounded-lg border bg-card">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
