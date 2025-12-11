'use client';
import { Genogram } from '@/components/Genogram';
import { type GenogramData } from '@/lib/types';

// Sample data for the genogram
const sampleGenogramData: GenogramData = {
  people: [
    { id: '1', name: 'John', gender: 'male' },
    { id: '2', name: 'Mary', gender: 'female' },
    { id: '3', name: 'Peter', gender: 'male' },
    { id: '4', name: 'Susan', gender: 'female' },
    { id: '5', name: 'Paul', gender: 'male' },
  ],
  relationships: [
    {
      id: 'r1',
      partner1Id: '1',
      partner2Id: '2',
      childrenIds: ['3', '4'],
    },
     {
      id: 'r2',
      partner1Id: '3',
      partner2Id: '5',
      childrenIds: [],
    },
  ],
};


export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">Family Genogram</h1>
        <Genogram data={sampleGenogramData} />
      </div>
    </main>
  );
}
