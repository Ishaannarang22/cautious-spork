import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ExpandableNodeWidget from './ExpandableNodeWidget';
import { graphFlowData } from '@/data/mockData';

interface DiscoveryGraphProps {
  discoveredItems: Set<string>;
  userName: string;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  title: string;
  nodeType: 'source' | 'data' | 'document' | 'claim';
  count?: number;
  risk?: 'high' | 'medium' | 'low';
  details: string[];
}

interface Connection {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isDiscovered: boolean;
}

const DiscoveryGraph: React.FC<DiscoveryGraphProps> = ({ discoveredItems }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Helper to check if a node should be shown
  const isNodeDiscovered = (nodeId: string, nodeType: 'source' | 'data' | 'document' | 'claim'): boolean => {
    if (nodeType === 'source') {
      return discoveredItems.has(nodeId);
    }
    if (nodeType === 'data') {
      const dataItem = graphFlowData.dataItems.find(d => d.id === nodeId);
      return dataItem?.sources.some(s => discoveredItems.has(s)) || false;
    }
    if (nodeType === 'document') {
      const doc = graphFlowData.claimDocuments.find(d => d.id === nodeId);
      if (!doc) return false;
      return doc.dataItems.some(dataId => {
        const dataItem = graphFlowData.dataItems.find(d => d.id === dataId);
        return dataItem?.sources.some(s => discoveredItems.has(s)) || false;
      });
    }
    if (nodeType === 'claim') {
      const claim = graphFlowData.claimSources.find(c => c.id === nodeId);
      if (!claim) return false;
      return claim.documents.some(docId => {
        const doc = graphFlowData.claimDocuments.find(d => d.id === docId);
        if (!doc) return false;
        return doc.dataItems.some(dataId => {
          const dataItem = graphFlowData.dataItems.find(d => d.id === dataId);
          return dataItem?.sources.some(s => discoveredItems.has(s)) || false;
        });
      });
    }
    return false;
  };

  const toggleNodeExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Calculate node positions and connections with dynamic spacing
  const { nodePositions, connections, totalWidth } = useMemo(() => {
    const nodeWidth = 200;
    const nodeBaseHeight = 70;
    const nodeExpandedExtra = 30; // Extra height per detail line when expanded
    const baseRowGap = 20; // Reduced base gap
    const startX = 50;
    const startY = 50;

    // Calculate column gap to spread across full width
    // Assuming container is roughly 80% of viewport width
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth * 1 * 1.05 : 1200;
    const numColumns = 4;
    const totalNodeWidth = nodeWidth * numColumns;
    const availableSpace = containerWidth - totalNodeWidth - (startX * 2);
    const columnGap = Math.max(250, availableSpace / (numColumns - 1));

    const positions: NodePosition[] = [];
    const conns: Connection[] = [];

    // Helper to calculate node height
    const getNodeHeight = (nodeId: string, details: string[]) => {
      if (expandedNodes.has(nodeId)) {
        return nodeBaseHeight + (details.length * nodeExpandedExtra);
      }
      return nodeBaseHeight;
    };

    // Column 1: Individual Sources
    let currentY = startY;
    graphFlowData.individualSources.forEach((source) => {
      const details = source.dataItems.map(dataId => {
        const dataItem = graphFlowData.dataItems.find(d => d.id === dataId);
        return dataItem?.type || dataId;
      });

      positions.push({
        id: source.id,
        x: startX,
        y: currentY,
        title: source.name,
        nodeType: 'source',
        count: source.dataItems.length,
        details,
      });

      currentY += getNodeHeight(source.id, details) + baseRowGap;
    });

    // Column 2: Data Items
    currentY = startY;
    graphFlowData.dataItems.forEach((dataItem) => {
      const details = [
        `Found in: ${dataItem.sources.map(s => graphFlowData.individualSources.find(src => src.id === s)?.name || s).slice(0, 3).join(', ')}`,
        `Used in: ${dataItem.documents.length} document${dataItem.documents.length !== 1 ? 's' : ''}`,
      ];

      const dataNode = {
        id: dataItem.id,
        x: startX + columnGap,
        y: currentY,
        title: dataItem.type,
        nodeType: 'data' as const,
        count: dataItem.sources.length,
        details,
      };
      positions.push(dataNode);

      // Create connections from sources to this data item
      dataItem.sources.forEach(sourceId => {
        const sourceNode = positions.find(p => p.id === sourceId);
        if (sourceNode) {
          conns.push({
            from: { x: sourceNode.x + nodeWidth, y: sourceNode.y + nodeBaseHeight / 2 },
            to: { x: dataNode.x, y: dataNode.y + nodeBaseHeight / 2 },
            isDiscovered: discoveredItems.has(sourceId),
          });
        }
      });

      currentY += getNodeHeight(dataItem.id, details) + baseRowGap;
    });

    // Column 3: Claim Documents
    currentY = startY;
    graphFlowData.claimDocuments.forEach((doc) => {
      const details = [
        `Type: ${doc.type}`,
        `Addresses: ${doc.dataItems.map(id => graphFlowData.dataItems.find(d => d.id === id)?.type || id).slice(0, 2).join(', ')}`,
      ];

      const docNode = {
        id: doc.id,
        x: startX + columnGap * 2,
        y: currentY,
        title: doc.title,
        nodeType: 'document' as const,
        count: doc.dataItems.length,
        details,
      };
      positions.push(docNode);

      // Create connections from data items to this document
      doc.dataItems.forEach(dataId => {
        const dataNode = positions.find(p => p.id === dataId);
        if (dataNode) {
          const isDiscovered = graphFlowData.dataItems.find(d => d.id === dataId)?.sources.some(s => discoveredItems.has(s)) || false;
          conns.push({
            from: { x: dataNode.x + nodeWidth, y: dataNode.y + nodeBaseHeight / 2 },
            to: { x: docNode.x, y: docNode.y + nodeBaseHeight / 2 },
            isDiscovered,
          });
        }
      });

      currentY += getNodeHeight(doc.id, details) + baseRowGap;
    });

    // Column 4: Claim Sources
    currentY = startY;
    graphFlowData.claimSources.forEach((claim) => {
      const details = [
        `Risk Level: ${claim.risk.toUpperCase()}`,
        `Documents: ${claim.documents.length}`,
        ...claim.documents.map(docId => {
          const doc = graphFlowData.claimDocuments.find(d => d.id === docId);
          return doc?.title || docId;
        }),
      ];

      const claimNode = {
        id: claim.id,
        x: startX + columnGap * 3,
        y: currentY,
        title: claim.name,
        nodeType: 'claim' as const,
        risk: claim.risk,
        count: claim.documents.length,
        details,
      };
      positions.push(claimNode);

      // Create connections from documents to this claim source
      claim.documents.forEach(docId => {
        const docNode = positions.find(p => p.id === docId);
        if (docNode) {
          const doc = graphFlowData.claimDocuments.find(d => d.id === docId);
          const isDiscovered = doc?.dataItems.some(dataId => {
            const dataItem = graphFlowData.dataItems.find(d => d.id === dataId);
            return dataItem?.sources.some(s => discoveredItems.has(s)) || false;
          }) || false;
          conns.push({
            from: { x: docNode.x + nodeWidth, y: docNode.y + nodeBaseHeight / 2 },
            to: { x: claimNode.x, y: claimNode.y + nodeBaseHeight / 2 },
            isDiscovered,
          });
        }
      });

      currentY += getNodeHeight(claim.id, details) + baseRowGap;
    });

    const calculatedTotalWidth = startX + (columnGap * 3) + nodeWidth + startX;
    return { nodePositions: positions, connections: conns, totalWidth: calculatedTotalWidth };
  }, [discoveredItems, expandedNodes]);

  return (
    <div className="bg-white rounded-2xl border border-border p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-medium">Discovery to Claims Flow</h3>
        <div className="text-xs text-neutral-500">
          {discoveredItems.size} sources discovered
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-scroll scrollbar-hide relative min-h-0">
        <div className="relative" style={{ width: totalWidth, minWidth: '100%', minHeight: '100%' }}>
          {/* SVG layer for connection lines */}
          <svg
            className="absolute inset-0 pointer-events-none w-full h-full"
          >
            {connections.map((conn, i) => {
              if (!conn.isDiscovered) return null;

              // Calculate control point for curved line
              const controlX = (conn.from.x + conn.to.x) / 2;
              const path = `M ${conn.from.x} ${conn.from.y} Q ${controlX} ${conn.from.y}, ${controlX} ${(conn.from.y + conn.to.y) / 2} T ${conn.to.x} ${conn.to.y}`;

              return (
                <motion.path
                  key={i}
                  d={path}
                  stroke="#d1d5db"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              );
            })}
          </svg>

          {/* Nodes layer */}
          {nodePositions.map((node) => (
            <motion.div
              key={node.id}
              className="absolute"
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                left: node.x,
                top: node.y,
                width: 200,
              }}
            >
              <ExpandableNodeWidget
                id={node.id}
                title={node.title}
                nodeType={node.nodeType}
                count={node.count}
                risk={node.risk}
                details={node.details}
                isDiscovered={isNodeDiscovered(node.id, node.nodeType)}
                isExpanded={expandedNodes.has(node.id)}
                onClick={() => toggleNodeExpanded(node.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-neutral-500 flex-shrink-0">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-sky-400" />
            <span>Sources</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-400" />
            <span>Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-400" />
            <span>Documents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-400" />
            <span>Claims</span>
          </div>
        </div>
        <div>Click any node to expand details</div>
      </div>
    </div>
  );
};

export default DiscoveryGraph;
