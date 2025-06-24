
import { useMemo } from 'react';
import { NodeData } from '@/data/nodeData';

export const useNodeFilter = (nodes: NodeData[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return nodes;
    
    const searchLower = searchTerm.toLowerCase();
    return nodes.filter(node => {
      const label = node.label.toLowerCase();
      const description = node.description.toLowerCase();
      
      // Check if search term is contained in label or description
      const containsMatch = label.includes(searchLower) || description.includes(searchLower);
      
      // Check if search term matches first letter or word
      const words = label.split(' ');
      const firstLetterMatch = label.startsWith(searchLower);
      const firstWordMatch = words.some(word => word.toLowerCase().startsWith(searchLower));
      
      return containsMatch || firstLetterMatch || firstWordMatch;
    });
  }, [nodes, searchTerm]);
};
