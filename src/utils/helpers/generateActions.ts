export const generateNodesAndEdges = () => {
  const nodes = [];
  const edges = [];
  
  // Define node types and their properties
  const nodeTypes = [
    {
      type: 'trigger',
      label: 'Webhook Trigger',
      icon: 'Webhook',
      color: 'text-green-600',
      subtitle: 'Webhook received'
    },
    {
      type: 'action',
      label: 'Send Email',
      icon: 'Mail',
      color: 'text-blue-600',
      subtitle: 'Email action'
    },
    {
      type: 'action',
      label: 'HTTP Request',
      icon: 'Globe',
      color: 'text-purple-600',
      subtitle: 'API call'
    },
    {
      type: 'condition',
      label: 'Check Status',
      icon: 'GitBranch',
      color: 'text-orange-600',
      subtitle: 'Condition check'
    },
    {
      type: 'action',
      label: 'Update Database',
      icon: 'Database',
      color: 'text-red-600',
      subtitle: 'Database operation'
    },
    {
      type: 'action',
      label: 'Send SMS',
      icon: 'MessageSquare',
      color: 'text-indigo-600',
      subtitle: 'SMS notification'
    },
    {
      type: 'condition',
      label: 'Validate Data',
      icon: 'CheckCircle',
      color: 'text-emerald-600',
      subtitle: 'Data validation'
    },
    {
      type: 'action',
      label: 'Create File',
      icon: 'FileText',
      color: 'text-yellow-600',
      subtitle: 'File creation'
    },
    {
      type: 'action',
      label: 'Send Notification',
      icon: 'Bell',
      color: 'text-pink-600',
      subtitle: 'Push notification'
    },
    {
      type: 'condition',
      label: 'Time Check',
      icon: 'Clock',
      color: 'text-teal-600',
      subtitle: 'Time validation'
    }
  ];

  // Generate 1000 nodes
  for (let i = 0; i < 1000; i++) {
    // Select node type based on index to ensure variety
    const nodeTypeIndex = i % nodeTypes.length;
    const nodeTemplate = nodeTypes[nodeTypeIndex];
    
    // First node should always be a trigger
    const actualType = i === 0 ? 'trigger' : nodeTemplate.type;
    const actualTemplate = i === 0 ? nodeTypes[0] : nodeTemplate;
    
    // Calculate position (10 nodes per row)
    const x = (i % 10) * 320; // Increased spacing for better visibility
    const y = Math.floor(i / 10) * 120;
    
    // Create node with appropriate data structure
    const node = {
      id: `node-${i}`,
      type: actualType,
      position: { x, y },
      data: {
        label: `${actualTemplate.label} ${i}`,
        customLabel: `${actualTemplate.label} ${i}`,
        subtitle: actualTemplate.subtitle,
        icon: actualTemplate.icon,
        color: actualTemplate.color,
        showWarning: Math.random() > 0.8, // 20% chance of showing warning
        
        // Universal delete function for all node types
        onDelete: (nodeId) => {
          // This should be passed from your React Flow component
          // Example implementations:
          // Option 1: Using React Flow instance
          // flowInstance.setNodes((nds) => nds.filter((node) => node.id !== nodeId))
          
          // Option 2: Using state setter
          // setNodes((nds) => nds.filter((node) => node.id !== nodeId))
          // setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
          
          // Option 3: Using deleteElements API (React Flow v11.2+)
          // deleteElements({ nodes: [{ id: nodeId }] })
          
          console.log(`Delete node ${nodeId}`);
        },
        
        // Add type-specific properties
        ...(actualType === 'trigger' && {
          openTriggerModal: () => console.log(`Open trigger modal for node ${i}`),
          onReplaceTrigger: () => console.log(`Replace trigger for node ${i}`),
          onOpenConfig: () => console.log(`Open config for node ${i}`)
        }),
        
        ...(actualType === 'condition' && {
          branches: [
            { label: 'Yes', branchType: 'yes' },
            { label: 'No', branchType: 'no' }
          ],
          onReplace: (conditionId) => console.log(`Replace condition ${conditionId}`)
        }),
        
        ...(actualType === 'action' && {
          // Action nodes already had onDelete, but now it's consistent with the universal one
        })
      }
    };
    
    nodes.push(node);
  }

  // Generate edges to connect nodes
  for (let i = 0; i < 999; i++) { // 999 edges for 1000 nodes
    const sourceNode = nodes[i];
    const targetNode = nodes[i + 1];
    
    // Determine edge type based on source node type
    let edgeType = 'flowEdge';
    let sourceHandle = 'out';
    let targetHandle = 'in';
    
    if (sourceNode.type === 'condition') {
      edgeType = 'condition';
      // Alternate between 'yes' and 'no' handles for condition nodes
      sourceHandle = i % 2 === 0 ? 'yes' : 'no';
    }
    
    const edge = {
      id: `edge-${i}`,
      source: sourceNode.id,
      target: targetNode.id,
      sourceHandle,
      targetHandle,
      type: edgeType,
      data: {
        onOpenActionModal: (index) => console.log(`Open action modal at index ${index}`),
        index: i,
        ...(edgeType === 'condition' && {
          label: sourceHandle === 'yes' ? 'Yes' : 'No'
        })
      }
    };
    
    edges.push(edge);
  }

  // Add end node
  nodes.push({
    id: 'virtual-end',
    type: 'end',
    position: { x: 0, y: (Math.floor(1000 / 10) + 1) * 120 },
    data: {
      label: 'End',
      subtitle: 'Workflow complete',
      // End node typically shouldn't be deletable, but adding for consistency
      onDelete: (nodeId) => console.log(`Delete end node ${nodeId} (not recommended)`)
    }
  });

  // Connect last node to end node
  edges.push({
    id: 'edge-to-end',
    source: 'node-999',
    target: 'virtual-end',
    sourceHandle: 'out',
    targetHandle: 'in',
    type: 'flowEdge',
    data: {
      onOpenActionModal: (index) => console.log(`Open action modal at index ${index}`),
      index: 999
    }
  });

  console.log(`Generated ${nodes.length} nodes and ${edges.length} edges`);
  
  return { nodes, edges };
};