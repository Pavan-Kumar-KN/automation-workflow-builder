
import { GitBranch, Filter, Split } from 'lucide-react';
import { NodeData } from './types';

export const conditionNodes: NodeData[] = [
  { 
    id: 'condition', 
    label: 'If/Then Condition', 
    icon: GitBranch,
    description: 'Add conditional logic to workflow',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'filter-condition', 
    label: 'Filter Condition', 
    icon: Filter,
    description: 'Filter contacts based on criteria',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'split-condition', 
    label: 'Split', 
    icon: Split,
    description: 'Split contacts into multiple paths based on percentage distribution',
    color: 'bg-purple-50 border-purple-200'
  },
];
