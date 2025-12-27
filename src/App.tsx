import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSongStore } from "./store/songStore";
import { useEffect } from "react";
import Dashboard from "./components/dashboard/Dashboard";
import HarmonyView from "./components/harmony/HarmonyView";
import StructureView from "./components/structure/StructureView";
import LyricsView from "./components/lyrics/LyricsView";
import MelodyView from "./components/melody/MelodyView";
import FinishingView from "./components/finishing/FinishingView";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import PlayerBar from "./components/layout/PlayerBar";

function App() {
  const { currentSong, createNewSong } = useSongStore();

  useEffect(() => {
    // Create a default song if none exists
    if (!currentSong) {
      createNewSong("My First Song");
    }
  }, [currentSong, createNewSong]);

  return (
    <Router>
      <div className="flex h-screen bg-surface-0 text-text-primary overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/harmony" element={<HarmonyView />} />
              <Route path="/structure" element={<StructureView />} />
              <Route path="/lyrics" element={<LyricsView />} />
              <Route path="/melody" element={<MelodyView />} />
              <Route path="/finishing" element={<FinishingView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <PlayerBar />
        </div>
      </div>
    </Router>
  );
}

export default App;
