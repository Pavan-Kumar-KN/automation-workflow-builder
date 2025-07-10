import React, { useState } from 'react';
import { Background, Node, ReactFlow } from '@xyflow/react';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import ConditionNode from './nodes/ConditionNode';
import EndNode from './nodes/EndNode';
import { PlusButton } from './PlusButton';
import { NodeData } from '@/data/nodeData';
import * as LucideIcons from 'lucide-react';
import FlowEdge from './edges/FlowEdge';

interface SimpleWorkflowCanvasProps {
  nodes: Node[];
  selectedNodeId?: string;
  onSelectNode: (nodeType: string, nodeData: NodeData) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onOpenTriggerModal: () => void;
  onOpenActionModal: (insertIndex?: number) => void;
  onInsertNode?: (afterNodeIndex: number, nodeType: string, nodeData: NodeData) => void;
  onDeleteNode?: (nodeIndex: number) => void;
  onReplaceTrigger?: () => void;
  onOpenTriggerConfig?: (node: Node) => void;
  onAddBranchNode?: (conditionNodeIndex: number, branchType: 'branch1' | 'otherwise', insertIndex?: number) => void;
  onBranchNodeClick?: (conditionNodeIndex: number, branchType: 'branch1' | 'otherwise', nodeIndex: number, node: any) => void;
  onDeleteBranchNode?: (conditionNodeIndex: number, branchType: 'branch1' | 'otherwise', nodeIndex: number) => void;
  onReplaceBranchNode?: (conditionNodeIndex: number, branchType: 'branch1' | 'otherwise', nodeIndex: number) => void; // Add replace branch node
  onRouterClick?: (conditionNodeIndex: number) => void; // Add router click handler
  onReplaceRouter?: (conditionNodeIndex: number) => void; // Add replace router handler
  zoomLevel?: number;
}
// * configure the custom type nodes 
const nodeTypes = {
  condition: ConditionNode
}

export const SimpleWorkflowCanvas: React.FC<SimpleWorkflowCanvasProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onNodeClick,
  onOpenTriggerModal,
  onOpenActionModal,
  onInsertNode,
  onDeleteNode,
  onReplaceTrigger,
  onOpenTriggerConfig,
  onAddBranchNode,
  onBranchNodeClick,
  onDeleteBranchNode,
  onReplaceBranchNode,
  onRouterClick,
  onReplaceRouter,
  zoomLevel = 100,
}) => {
  const renderNode = (node: Node, index: number) => {
    const nodeProps = {
      data: {
        ...node.data,
        openTriggerModal: node.type === 'trigger' ? onOpenTriggerModal : undefined,
      },
      isSelected: selectedNodeId === node.id,
      onAddNode: node.type === 'condition' ? (branchType: 'true' | 'false' | 'after') => {
        console.log(`Add node to ${branchType} branch of condition ${node.id}`);
        if (onOpenActionModal) {
          onOpenActionModal(index);
        }
      } : undefined,
      onDelete: node.type !== 'trigger' ? () => onDeleteNode(index) : undefined,
      // Trigger-specific props
      onReplaceTrigger: node.type === 'trigger' ? onReplaceTrigger : undefined,
      onOpenConfig: node.type === 'trigger' ? () => onOpenTriggerConfig?.(node) : undefined,
    };

    let NodeComponent;
    switch (node.type) {
      case 'trigger':
        NodeComponent = TriggerNode;
        break;
      case 'action':
        NodeComponent = ActionNode;
        break;
      case 'condition':
        NodeComponent = ConditionNode;
        (nodeProps as any).onAddBranchNode = (branchType: 'branch1' | 'otherwise', insertIndex?: number) => {
          onAddBranchNode?.(index, branchType, insertIndex);
        };
        (nodeProps as any).onBranchNodeClick = (branchType: 'branch1' | 'otherwise', nodeIndex: number, branchNode: any) => {
          onBranchNodeClick?.(index, branchType, nodeIndex, branchNode);
        };
        (nodeProps as any).onDeleteBranchNode = (branchType: 'branch1' | 'otherwise', nodeIndex: number) => {
          onDeleteBranchNode?.(index, branchType, nodeIndex);
        };
        (nodeProps as any).onReplaceBranchNode = (branchType: 'branch1' | 'otherwise', nodeIndex: number) => {
          onReplaceBranchNode?.(index, branchType, nodeIndex);
        };
        (nodeProps as any).onRouterClick = () => {
          onRouterClick?.(index);
        };
        (nodeProps as any).onReplaceRouter = () => {
          onReplaceRouter?.(index);
        };
        break;
      case 'end':
        NodeComponent = EndNode;
        break;
      default:
        NodeComponent = ActionNode;
    }

    return (
      <div key={node.id} className="flex flex-col items-center">
        <div onClick={(e) => {
          // Only trigger node click for non-condition nodes
          // Condition nodes handle their own click events internally
          if (node.type !== 'condition') {
            onNodeClick(e, node);
          }
        }}>
          <NodeComponent key={node.id} {...nodeProps} />
        </div>

        {/* Connection Line and Plus Button (except for last node and after conditional nodes) */}
        {index < nodes.length - 1 && node.type !== 'condition' && (
          <FlowEdge onOpenActionModal={onOpenActionModal} index={index} />
        )}
      </div>
    );
  };

  const getValidNodeTypes = (sourceNode: Node) => {
    if (sourceNode.type === 'trigger') {
      return ['action', 'condition'];
    }
    if (sourceNode.type === 'action') {
      return ['action', 'condition'];
    }
    return ['action'];
  };

  // Empty state
  if (nodes.length === 0) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{
          backgroundColor: '#f8fafc',
          backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      >
        <div className="text-center">
          <PlusButton
            onSelectNode={onSelectNode}
            validNodeTypes={['trigger']}
            position="center"
          />

          <p className="text-sm text-gray-500 mt-4">Click to add your first step</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-auto">
      <div
        className="flex justify-center items-start min-h-full"
        style={{
          backgroundColor: '#f8fafc',
          backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          padding: `${50 * (zoomLevel / 100)}px`,
        }}
      >
        {/* <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'center top'
          }}
        >
          <div className="flex flex-col items-center py-8">
            <div className="flex flex-col items-center space-y-0">
              {nodes.map((node, index) => renderNode(node, index))}

              {nodes.length > 0 && nodes[nodes.length - 1].type !== 'condition' && (
                <>

                  <EndNode onOpenActionModal={onOpenActionModal} nodes={nodes} />
                  
                </>
              )}
            </div>
          </div>
        </div> */}

        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onNodeContextMenu={(event, node) => {
            event.preventDefault();
            onSelectNode(node.type, node.data);
          }}
        >

          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};
