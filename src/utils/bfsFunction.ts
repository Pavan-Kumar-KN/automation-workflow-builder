export const getSubTree = (startNodeId, nodes, edges) => {

    // this will tract which node has to be yet visited
    let visited = new Set();

    // this will track which are node have to be visited
    let queue = [startNodeId];

    let subNode = [];
    let subEdge = [];

    while (queue.length) {
        // queue returns first element 
        let currNodeId = queue.shift();

        if (visited.has(currNodeId)) continue;

        visited.add(currNodeId);

        // Get the current node form id that is returned by queue
        let currNode = nodes.find((node) => node.id === currNodeId);

        // Skip end nodes (virtual-end, end, etc.)
        if (currNode && !currNode.id.includes('end') && currNode.type !== 'end') {
            subNode.push(currNode);
        }

        // Get all outgoing edges from current node
        let outgoingEdges = edges.filter((edge) => edge.source === currNodeId);

    
        // push the target nodes to the queue if it's not present on the visited set
        outgoingEdges.forEach(edge => {
            // Skip edges that connect to end nodes
            if (!edge.target.includes('end')) {
                subEdge.push(edge);
                if (!visited.has(edge.target)) {
                    queue.push(edge.target);
                }
            }
        });

    }

    return { subNode, subEdge };
}