export interface Narrator {
  id: string;
  name: string;
  bio: string;
  order: number; // To maintain the order from the book
}

export interface Hadith {
  id: number;
  narratorId: string;
  text: string;
  source: string; // e.g., Bukhari, Muslim
}