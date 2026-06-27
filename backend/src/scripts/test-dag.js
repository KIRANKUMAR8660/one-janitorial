import { validateWorkflowDAG } from '../services/dagValidation.js';

console.log('--- STARTING DAG VALIDATION ENGINE TESTS ---');

// Test Case 1: Valid DAG
const validNodes = [
  { id: '1', type: 'TriggerNode' },
  { id: '2', type: 'ActionNode' },
  { id: '3', type: 'ActionNode' }
];
const validEdges = [
  { source: '1', target: '2' },
  { source: '2', target: '3' }
];

const result1 = validateWorkflowDAG(validNodes, validEdges);
console.log('Test 1 (Valid DAG):');
console.log('  isDag:', result1.isDag);
console.log('  executionPath:', result1.executionPath);
console.log('  errors:', result1.errors);
console.log('  warnings:', result1.warnings);
if (result1.isDag && result1.executionPath.join(',') === '1,2,3' && result1.errors.length === 0) {
  console.log('  RESULT: SUCCESS');
} else {
  console.log('  RESULT: FAILED');
}

console.log('\n----------------------------------------\n');

// Test Case 2: Circular Graph
const circularNodes = [
  { id: '1', type: 'TriggerNode' },
  { id: '2', type: 'ActionNode' },
  { id: '3', type: 'ActionNode' }
];
const circularEdges = [
  { source: '1', target: '2' },
  { source: '2', target: '3' },
  { source: '3', target: '1' } // Forms a cycle!
];

const result2 = validateWorkflowDAG(circularNodes, circularEdges);
console.log('Test 2 (Circular Graph):');
console.log('  isDag:', result2.isDag);
console.log('  executionPath:', result2.executionPath);
console.log('  errors:', result2.errors);
console.log('  warnings:', result2.warnings);
if (!result2.isDag && result2.errors.length > 0) {
  console.log('  RESULT: SUCCESS');
} else {
  console.log('  RESULT: FAILED');
}

console.log('--- DAG VALIDATION TESTS COMPLETE ---');
