// utils/workflowConverter.js
export function convertNodesToAutomation(nodes, edges, workflowName) {
  // Find the trigger node (starting point)
  const triggerNode = nodes.find(node => node.type === 'trigger');
  if (!triggerNode) {
    throw new Error('Workflow must have a trigger');
  }

  // Build the automation config
  const automationConfig = {
    name: workflowName,
    trigger: {
      type: triggerNode.data.triggerType || 'form',
      config: triggerNode.data.config || {}
    },
    steps: []
  };

    let currentNode = triggerNode;
  let stepIndex = 1;

  while (currentNode) {
    // Find next connected node
    const nextEdge = edges.find(edge => edge.source === currentNode.id);
    if (!nextEdge) break;

    const nextNode = nodes.find(node => node.id === nextEdge.target);
    if (!nextNode) break;

    // Convert node to step
    const step = convertNodeToStep(nextNode, stepIndex);
    automationConfig.steps.push(step);

    currentNode = nextNode;
    stepIndex++;
  }

  return automationConfig;
}


