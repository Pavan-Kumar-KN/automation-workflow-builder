import { Handle, Position } from "@xyflow/react";

export const GhostNode = ({ targetPosition = Position.Top }) => (
  <div style={{ width: 5, height: 5 }}>
    <Handle
      type="target"
      position={targetPosition}
      style={{ background: 'white', visibility: 'hidden' }}
    />
  </div>
);