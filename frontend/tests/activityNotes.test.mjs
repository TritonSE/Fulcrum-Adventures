import assert from "node:assert/strict";
import { it } from "node:test";

import { loadActivityNotes, saveActivityNotes } from "../src/services/activityNotes.ts";

// A persistent key/value adapter models AsyncStorage without importing native modules in Node.
function memoryStorage() {
  const entries = new Map();
  return {
    entries,
    getItem: async (key) => entries.get(key) ?? null,
    setItem: async (key, value) => {
      entries.set(key, value);
    },
  };
}

it("an activity with no saved notes starts empty", async () => {
  assert.deepEqual(await loadActivityNotes(memoryStorage(), "one"), {
    text: "",
    rating: 0,
    date: null,
  });
});

it("text, rating, and date survive reopening and stay separate for each activity", async () => {
  const storage = memoryStorage();
  const first = {
    text: "Worked well with this group.\nTry outdoors next time.",
    rating: 4,
    date: "2026-11-24T18:00:00.000Z",
  };
  const second = { text: "Different activity", rating: 1, date: null };
  await saveActivityNotes(storage, "one", first);
  await saveActivityNotes(storage, "two", second);
  const reopenedStorage = { getItem: storage.getItem, setItem: storage.setItem };
  assert.deepEqual(await loadActivityNotes(reopenedStorage, "one"), first);
  assert.deepEqual(await loadActivityNotes(reopenedStorage, "two"), second);
});

it("clearing a note and removing its date persists", async () => {
  const storage = memoryStorage();
  await saveActivityNotes(storage, "one", {
    text: "Before",
    rating: 5,
    date: "2026-11-24T18:00:00Z",
  });
  await saveActivityNotes(storage, "one", { text: "", rating: 0, date: null });
  assert.deepEqual(await loadActivityNotes(storage, "one"), { text: "", rating: 0, date: null });
});

it("invalid stored data fails instead of looking like an empty note", async () => {
  await Promise.all(
    [
      "not json",
      "null",
      '{"text":"hi","rating":6,"date":null}',
      '{"text":"hi","rating":2,"date":"invalid"}',
    ].map(async (value) => {
      const storage = { ...memoryStorage(), getItem: async () => value };
      await assert.rejects(loadActivityNotes(storage, "one"));
    }),
  );
});

it("load and save failures propagate so the UI can preserve the draft and offer retry", async () => {
  const storage = {
    getItem: async () => {
      throw new Error("Read failed");
    },
    setItem: async () => {
      throw new Error("Storage full");
    },
  };
  await assert.rejects(loadActivityNotes(storage, "one"), /Read failed/);
  await assert.rejects(
    saveActivityNotes(storage, "one", { text: "Keep this draft", rating: 0, date: null }),
    /Storage full/,
  );
});
