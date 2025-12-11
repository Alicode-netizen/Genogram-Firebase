'use client';
import React from 'react';
import { type GenogramData, type Person } from '@/lib/types';

const PERSON_WIDTH = 80;
const PERSON_HEIGHT = 80;
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 120;
const RELATIONSHIP_HEIGHT = 20;

// Helper to render a single person
const PersonNode = ({ person, x, y }: { person: Person; x: number; y: number }) => {
  const isMale = person.gender === 'male';
  const symbol = isMale ? (
    <rect
      x={x - PERSON_WIDTH / 2}
      y={y - PERSON_HEIGHT / 2}
      width={PERSON_WIDTH}
      height={PERSON_HEIGHT}
      className="fill-white stroke-gray-800 stroke-2"
    />
  ) : (
    <circle
      cx={x}
      cy={y}
      r={PERSON_WIDTH / 2}
      className="fill-white stroke-gray-800 stroke-2"
    />
  );

  return (
    <g>
      {symbol}
      <text
        x={x}
        y={y + PERSON_HEIGHT / 2 + 15}
        textAnchor="middle"
        className="font-sans text-sm fill-gray-800"
      >
        {person.name}
      </text>
    </g>
  );
};


export const Genogram = ({ data }: { data: GenogramData }) => {
  const peopleMap = new Map(data.people.map((p) => [p.id, p]));
  const positions = new Map<string, { x: number; y: number }>();
  const renderedPeople = new Set<string>();

  // This is a simplified layout algorithm. For complex genograms, a more sophisticated library would be needed.
  let currentY = PERSON_HEIGHT;

  data.relationships.forEach((rel) => {
    let p1 = peopleMap.get(rel.partner1Id);
    let p2 = peopleMap.get(rel.partner2Id);

    if (!p1 || !p2) return;

    let p1Pos = positions.get(p1.id);
    if (!p1Pos) {
      p1Pos = { x: (PERSON_WIDTH + HORIZONTAL_SPACING) * positions.size + PERSON_WIDTH, y: currentY };
      positions.set(p1.id, p1Pos);
    }

    let p2Pos = positions.get(p2.id);
    if (!p2Pos) {
       p2Pos = { x: p1Pos.x + PERSON_WIDTH + HORIZONTAL_SPACING, y: currentY };
       positions.set(p2.id, p2Pos);
    }
    
    // Position children
    const childY = currentY + VERTICAL_SPACING;
    const children = rel.childrenIds.map(id => peopleMap.get(id)).filter(Boolean) as Person[];
    const childrenWidth = children.length * (PERSON_WIDTH + HORIZONTAL_SPACING) - HORIZONTAL_SPACING;
    let startX = p1Pos.x + (p2Pos.x - p1Pos.x - childrenWidth) / 2;

    children.forEach((child, index) => {
       if (!positions.has(child.id)) {
         positions.set(child.id, {
            x: startX + index * (PERSON_WIDTH + HORIZONTAL_SPACING) + PERSON_WIDTH / 2,
            y: childY,
         });
       }
    });

    if (rel.childrenIds.length > 0) {
      currentY += VERTICAL_SPACING;
    }
  });
  
  // Position any remaining people
   data.people.forEach(p => {
    if (!positions.has(p.id)) {
        positions.set(p.id, {x: (PERSON_WIDTH + HORIZONTAL_SPACING) * positions.size + PERSON_WIDTH, y: currentY});
    }
   });


  const width = Math.max(...Array.from(positions.values()).map(p => p.x)) + PERSON_WIDTH;
  const height = Math.max(...Array.from(positions.values()).map(p => p.y)) + PERSON_HEIGHT;

  return (
    <div className="w-full h-full overflow-auto border border-gray-300 rounded-lg p-4 bg-white">
      <svg width={width} height={height} className="min-w-full">
        {/* Render relationship lines */}
        {data.relationships.map((rel) => {
          const p1Pos = positions.get(rel.partner1Id);
          const p2Pos = positions.get(rel.partner2Id);

          if (!p1Pos || !p2Pos) return null;
          
          const midX = p1Pos.x + (p2Pos.x - p1Pos.x) / 2;
          const midY = p1Pos.y;

          const children = rel.childrenIds.map(id => peopleMap.get(id)).filter(Boolean) as Person[];

          return (
            <g key={rel.id}>
              {/* Line between partners */}
              <line
                x1={p1Pos.x}
                y1={p1Pos.y}
                x2={p2Pos.x}
                y2={p2Pos.y}
                className="stroke-gray-800 stroke-2"
              />
              {/* Line down to children */}
              {children.length > 0 && (
                <line
                  x1={midX}
                  y1={midY}
                  x2={midX}
                  y2={midY + VERTICAL_SPACING / 2}
                  className="stroke-gray-800 stroke-2"
                />
              )}
              {/* Lines to each child */}
              {children.map(child => {
                  const childPos = positions.get(child.id);
                  if (!childPos) return null;
                   return (
                     <line
                       key={child.id}
                       x1={midX}
                       y1={midY + VERTICAL_SPACING / 2}
                       x2={childPos.x}
                       y2={childPos.y - PERSON_HEIGHT / 2}
                       className="stroke-gray-800 stroke-2"
                     />
                   )
              })}
            </g>
          );
        })}

        {/* Render people */}
        {data.people.map((person) => {
          const pos = positions.get(person.id);
          if (!pos) return null;
          return <PersonNode key={person.id} person={person} x={pos.x} y={pos.y} />;
        })}
      </svg>
    </div>
  );
};
