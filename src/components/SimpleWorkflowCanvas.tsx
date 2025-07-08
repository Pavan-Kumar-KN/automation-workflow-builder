import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import ConditionNode  from './nodes/ConditionNode';
import { EndNode } from './nodes/EndNode';
import { PlusButton } from './PlusButton';
import { NodeData } from '@/data/nodeData';
import * as LucideIcons from 'lucide-react';

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
          <div className="flex flex-col items-center relative">
            {/* Uniform vertical lines - compact height */}
            <div className="w-0.5 h-6 bg-gray-400"></div>
            <div className="relative">
              <button
                onClick={() => onOpenActionModal(index)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
              >
                <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
              </button>
            </div>
            <div className="w-0.5 h-6 bg-gray-400"></div>
          </div>
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

  // Removed completion status text as requested

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
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'center top'
          }}
        >
          <div className="flex flex-col items-center py-8">
            {/* Workflow Nodes */}
            <div className="flex flex-col items-center space-y-0">
              {nodes.map((node, index) => renderNode(node, index))}

              {/* Final connection to End - Only show if last node is not a router/conditional */}
              {nodes.length > 0 && nodes[nodes.length - 1].type !== 'condition' && (
                <>
                  <div className="flex flex-col items-center relative">
                    {/* Uniform vertical lines - compact height */}
                    <div className="w-0.5 h-6 bg-gray-400"></div>
                    <div className="relative">
                      <button
                        onClick={() => onOpenActionModal(nodes.length - 1)}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                      >
                        <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                      </button>
                    </div>
                    <div className="w-0.5 h-6 bg-gray-400"></div>
                  </div>

                  {/* End Node */}  
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 bg-gray-100 rounded-lg px-4 py-2 border border-gray-300">
                      End
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
