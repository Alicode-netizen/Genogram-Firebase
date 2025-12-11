export interface Person {
  id: string;
  name: string;
  gender: 'male' | 'female';
}

export interface Relationship {
  id: string;
  partner1Id: string;
  partner2Id: string;
  childrenIds: string[];
}

export interface GenogramData {
  people: Person[];
  relationships: Relationship[];
}
