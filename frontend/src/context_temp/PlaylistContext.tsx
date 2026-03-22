import { createContext, type ReactNode, use, useState } from "react";

export type Playlist = {
  id: string;
  name: string;
  color: string;
  activityIds: string[];
};

type PlaylistContextType = {
  playlists: Playlist[];
  createPlaylist: (name: string, color: string) => void;
  updatePlaylist: (id: string, name: string, color: string) => void;
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
};

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const createPlaylist = (name: string, color: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      color,
      activityIds: [],
    };

    setPlaylists((prev) => [...prev, newPlaylist]);
  };

  const updatePlaylist = (id: string, name: string, color: string) => {
    setPlaylists((prev) => prev.map((p) => (p.id === id ? { ...p, name, color } : p)));
  };

  return (
    <PlaylistContext
      value={{
        playlists,
        createPlaylist,
        updatePlaylist,
        setPlaylists,
      }}
    >
      {children}
    </PlaylistContext>
  );
}

export function usePlaylists() {
  const context = use(PlaylistContext);

  if (!context) {
    throw new Error("usePlaylists must be used inside PlaylistProvider");
  }

  return context;
}
