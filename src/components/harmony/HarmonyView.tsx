import EnhancedProgressionBuilder from "./EnhancedProgressionBuilder";
import { useSongStore } from "../../store/songStore";

export default function HarmonyView() {
  const { currentSong } = useSongStore();

  if (!currentSong) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">Create a song first to explore harmony</p>
      </div>
    );
  }

  return <EnhancedProgressionBuilder />;
}
