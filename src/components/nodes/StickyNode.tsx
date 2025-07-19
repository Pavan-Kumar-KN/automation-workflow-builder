// StickyNoteNode.tsx
import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

const StickyNoteNode = ({ data, id }: any) => {
  const [text, setText] = useState(data.text || '');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    data.onChange(id, e.target.value);
  };

  return (
    <div style={{
      padding: 10,
      backgroundColor: '#fffa8b',
      border: '1px solid #e2e2e2',
      borderRadius: 8,
      width: 150,
      minHeight: 100,
      fontSize: 14,
    }}>
      <textarea
        style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', resize: 'none' }}
        value={text}
        onChange={handleChange}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default StickyNoteNode;
