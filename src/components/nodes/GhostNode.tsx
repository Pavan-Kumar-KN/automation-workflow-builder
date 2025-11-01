import { Handle, Position } from "@xyflow/react";

export const GhostNode = ({ targetPosition }) => {
  // Use passed position or fallback to default
  const actualTargetPosition = targetPosition || Position.Top;

  return (
    <div style={{ width: 5, height: 5 }}>
      <Handle
        type="target"
        position={actualTargetPosition}
        style={{ background: 'white', visibility: 'hidden' }}
      />
    </div>
  );
};