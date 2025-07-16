export const getSubTree = (startNodeId, nodes, edges) => {

    console.log("node from the subtree function", nodes);

    console.log("the edges are " , edges);

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

        if (currNode) {
            subNode.push(currNode);
        }

        let outgoingEdges = edges.filter((edge) => edge.source === currNodeId);

        outgoingEdges.forEach(edge => {
            subEdge.push(edge);
            if (!visited.has(edge.target)) {
                queue.push(edge.target);
            }
        });

    }

    return { subNode, subEdge };
}