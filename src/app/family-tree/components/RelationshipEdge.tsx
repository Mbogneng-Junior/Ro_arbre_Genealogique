"use client";

import { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { Relationship } from '../lib/types';

const RelationshipEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps<Relationship>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Define edge styling based on relationship type
  let edgeStyle = { ...style };
  let labelStyle = "text-xs py-1 px-2 rounded-full";
  
  if (data?.type === 'parent-child') {
    edgeStyle = { 
      ...edgeStyle, 
      stroke: '#3b82f6', 
      strokeWidth: 2,
    };
    labelStyle += " bg-blue-100 text-blue-800";
  } else if (data?.type === 'spouse') {
    edgeStyle = { 
      ...edgeStyle, 
      stroke: '#ec4899', 
      strokeWidth: 2,
      strokeDasharray: '5,5',
    };
    labelStyle += " bg-pink-100 text-pink-800";
  } else {
    labelStyle += " bg-gray-100 text-gray-800";
  }

  // Display label based on relationship weight
  let relationshipLabel = "";
  if (data?.weight === 1) {
    relationshipLabel = "parent";
  } else if (data?.weight === 2) {
    relationshipLabel = "grand-parent";
  } else if (data?.weight === 3) {
    relationshipLabel = "arrière-grand-parent";
  } else if (data?.type === 'spouse') {
    relationshipLabel = "conjoint";
  } else if (data?.type === 'other') {
    relationshipLabel = "autre";
  }

  return (
    <>
      <path
        id={id}
        style={edgeStyle}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {relationshipLabel && (
        <foreignObject
          width={100}
          height={40}
          x={labelX - 50}
          y={labelY - 20}
          className="overflow-visible"
        >
          <div className="flex justify-center items-center h-full">
            <div className={labelStyle}>
              {relationshipLabel}
            </div>
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default memo(RelationshipEdge);