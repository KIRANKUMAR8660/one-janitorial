export const validateWorkflowDAG = (nodes = [], edges = []) => {
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const errors = [];
  const warnings = [];

  if (nodeCount === 0) {
    errors.push('Workflow must contain at least one node.');
    return {
      nodes: nodeCount,
      edges: edgeCount,
      isDag: false,
      executionPath: [],
      warnings,
      errors
    };
  }

  // Build adjacency list
  const adj = {};
  const inDegree = {};
  
  // Initialize
  nodes.forEach(node => {
    adj[node.id] = [];
    inDegree[node.id] = 0;
  });

  // Populate adjacency list and in-degrees
  edges.forEach(edge => {
    const { source, target } = edge;
    // Edge source and target must exist in the nodes list
    if (adj[source] !== undefined && adj[target] !== undefined) {
      adj[source].push(target);
      inDegree[target]++;
    } else {
      warnings.push(`Edge connects invalid nodes: source "${source}" -> target "${target}"`);
    }
  });

  // Check for orphan/isolated nodes
  const orphans = nodes.filter(n => {
    const hasIncoming = edges.some(e => e.target === n.id);
    const hasOutgoing = edges.some(e => e.source === n.id);
    return !hasIncoming && !hasOutgoing;
  });
  if (orphans.length > 0 && nodeCount > 1) {
    warnings.push(`${orphans.length} isolated nodes found: ${orphans.map(n => n.data?.name || n.id).join(', ')}`);
  }

  // Check for start nodes
  const triggers = nodes.filter(n => inDegree[n.id] === 0);
  if (triggers.length === 0) {
    errors.push('Circular graph detected: No start nodes (nodes with 0 incoming connections) found.');
  }

  // Kahn's algorithm for topological sorting and cycle detection
  const queue = [];
  nodes.forEach(node => {
    if (inDegree[node.id] === 0) {
      queue.push(node.id);
    }
  });

  const executionPath = [];
  while (queue.length > 0) {
    const u = queue.shift();
    executionPath.push(u);

    const neighbors = adj[u] || [];
    for (const v of neighbors) {
      inDegree[v]--;
      if (inDegree[v] === 0) {
        queue.push(v);
      }
    }
  }

  const isDag = executionPath.length === nodeCount;
  if (!isDag) {
    errors.push('Circular dependency detected! The workflow contains loops that form a cycle, which is not allowed for execution.');
  }

  // Estimated runtime estimation based on node types
  let estimatedRuntimeSeconds = 0;
  nodes.forEach(node => {
    const type = node.type || '';
    if (type.includes('AIAgent') || type.includes('OpenAI') || type.includes('Claude')) {
      estimatedRuntimeSeconds += 3; // AI nodes typically take a few seconds
    } else if (type.includes('Delay')) {
      estimatedRuntimeSeconds += parseInt(node.data?.config?.delaySeconds || 0, 10);
    } else {
      estimatedRuntimeSeconds += 0.5; // Action/API nodes
    }
  });

  return {
    nodes: nodeCount,
    edges: edgeCount,
    isDag,
    executionPath,
    warnings,
    errors,
    estimatedRuntimeSeconds
  };
};
