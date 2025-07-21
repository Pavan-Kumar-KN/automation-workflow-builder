import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDuplicateMove } from '@/hooks/useDuplicateMove';
import { useGraphStore } from '@/store/useGraphStore';
import { runAllTests } from '@/utils/__tests__/duplicateMove.test';

export const TestDuplicateMove: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const { duplicateNode, duplicateFlow, moveNode, canDuplicateNode, canMoveNode } = useDuplicateMove();
  const nodes = useGraphStore((state) => state.nodes);

  const runTests = async () => {
    setIsRunning(true);
    try {
      console.log('🧪 Starting duplicate/move tests...');
      const results = runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('❌ Test error:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const createTestWorkflow = () => {
    const store = useGraphStore.getState();
    
    // Reset and create a simple test workflow
    store.reset();
    
    // Add trigger
    store.addNode({
      id: 'trigger-test',
      type: 'trigger',
      position: { x: 0, y: 0 },
      data: { label: 'Test Trigger' },
      children: ['action-test'],
      parent: undefined,
    });
    
    // Add action
    store.addNode({
      id: 'action-test',
      type: 'action',
      position: { x: 0, y: 150 },
      data: { label: 'Test Action' },
      children: ['end-test'],
      parent: 'trigger-test',
    });
    
    // Add end
    store.addNode({
      id: 'end-test',
      type: 'endNode',
      position: { x: 0, y: 300 },
      data: { label: 'End' },
      children: [],
      parent: 'action-test',
    });
    
    console.log('✅ Test workflow created');
  };

  const testDuplicateAction = () => {
    const actionNode = Object.values(nodes).find(node => node.type === 'action');
    if (actionNode) {
      console.log('🔍 Testing duplicate action:', actionNode.id);
      duplicateNode(actionNode.id);
    } else {
      console.log('❌ No action node found');
    }
  };

  const testDuplicateFlow = () => {
    const actionNode = Object.values(nodes).find(node => node.type === 'action');
    if (actionNode) {
      console.log('🔍 Testing duplicate flow from:', actionNode.id);
      duplicateFlow(actionNode.id);
    } else {
      console.log('❌ No action node found');
    }
  };

  const nodeList = Object.values(nodes);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Duplicate & Move Operations Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={createTestWorkflow} variant="outline">
            Create Test Workflow
          </Button>
          <Button onClick={testDuplicateAction} variant="outline">
            Test Duplicate Action
          </Button>
          <Button onClick={testDuplicateFlow} variant="outline">
            Test Duplicate Flow
          </Button>
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>

        {/* Current Nodes */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Current Nodes ({nodeList.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {nodeList.map((node) => (
              <div 
                key={node.id} 
                className="p-2 border rounded text-sm"
              >
                <div className="font-medium">{node.id}</div>
                <div className="text-gray-600">Type: {node.type}</div>
                <div className="text-gray-600">Label: {node.data.label}</div>
                <div className="text-gray-600">Parent: {node.parent || 'none'}</div>
                <div className="text-gray-600">
                  Children: {node.children?.join(', ') || 'none'}
                </div>
                {node.branches && (
                  <div className="text-gray-600">
                    Branches: Yes({node.branches.yes?.length || 0}), No({node.branches.no?.length || 0})
                  </div>
                )}
                <div className="mt-1 space-x-1">
                  <span className={`text-xs px-1 py-0.5 rounded ${canDuplicateNode(node.id) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {canDuplicateNode(node.id) ? 'Can Duplicate' : 'Cannot Duplicate'}
                  </span>
                  <span className={`text-xs px-1 py-0.5 rounded ${canMoveNode(node.id) ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                    {canMoveNode(node.id) ? 'Can Move' : 'Cannot Move'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Test Results</h3>
            <div className="bg-gray-100 p-4 rounded">
              {testResults.error ? (
                <div className="text-red-600">Error: {testResults.error}</div>
              ) : (
                <div>
                  <div className={`text-lg font-bold ${testResults.allPassed ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
                  </div>
                  <div className="mt-2 space-y-1">
                    {Object.entries(testResults.results).map(([test, passed]) => (
                      <div key={test} className={`${passed ? 'text-green-600' : 'text-red-600'}`}>
                        {test}: {passed ? '✅ PASSED' : '❌ FAILED'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600">
          <h4 className="font-semibold">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Create Test Workflow" to set up a basic workflow</li>
            <li>Use "Test Duplicate Action" to test single node duplication</li>
            <li>Use "Test Duplicate Flow" to test flow duplication</li>
            <li>Click "Run All Tests" to execute comprehensive tests</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
