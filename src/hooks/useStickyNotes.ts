type StickyNote = {
  id: string;
  text: string;
  color: string;
  position: { x: number; y: number };
};


type StickyNotesState = {
  notes: Record<string, StickyNote>;
  addNote: (note: StickyNote) => void;
  updateNote: (id: string, data: Partial<StickyNote>) => void;
  deleteNote: (id: string) => void;
};

