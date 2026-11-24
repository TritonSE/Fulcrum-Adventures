export type ActivityNotes = {
  text: string;
  rating: number;
  date: string | null;
};

type NotesStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

// Keep each activity's notes independent from the downloaded activity cache.
function notesKey(activityId: string): string {
  return `fulcrum-adventures:notes:v1:${encodeURIComponent(activityId)}`;
}

// Reject malformed stored data instead of silently overwriting it with an empty note.
function isActivityNotes(value: unknown): value is ActivityNotes {
  if (!value || typeof value !== "object") return false;
  const notes = value as Partial<ActivityNotes>;
  return (
    typeof notes.text === "string" &&
    typeof notes.rating === "number" &&
    Number.isInteger(notes.rating) &&
    notes.rating >= 0 &&
    notes.rating <= 5 &&
    (notes.date === null ||
      (typeof notes.date === "string" && Number.isFinite(Date.parse(notes.date))))
  );
}

// Load persisted notes; an activity with no saved note starts empty.
export async function loadActivityNotes(
  storage: NotesStorage,
  activityId: string,
): Promise<ActivityNotes> {
  const raw = await storage.getItem(notesKey(activityId));
  if (raw === null) return { text: "", rating: 0, date: null };
  const notes: unknown = JSON.parse(raw);
  if (!isActivityNotes(notes)) throw new Error("Saved notes could not be read.");
  return notes;
}

// Await storage completion so the UI only reports success after the note is written.
export async function saveActivityNotes(
  storage: NotesStorage,
  activityId: string,
  notes: ActivityNotes,
): Promise<void> {
  if (!isActivityNotes(notes)) throw new Error("Invalid activity notes.");
  await storage.setItem(notesKey(activityId), JSON.stringify(notes));
}
