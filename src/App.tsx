import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSongStore } from "./store/songStore";
import { useEffect, useRef } from "react";
import Dashboard from "./components/dashboard/Dashboard";
import HarmonyView from "./components/harmony/HarmonyView";
import StructureView from "./components/structure/StructureView";
import LyricsView from "./components/lyrics/LyricsView";
import MelodyView from "./components/melody/MelodyView";
import FinishingView from "./components/finishing/FinishingView";
import SettingsView from "./components/settings/SettingsView";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import PlayerBar from "./components/layout/PlayerBar";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { ToastContainer } from "./components/common/Toast";
import { useToastStore } from "./store/toastStore";

function App() {
  const { currentSong, createNewSong, autoSave } = useSongStore();
  const { toasts, removeToast } = useToastStore();
  const autoSaveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Create a default song if none exists
    if (!currentSong) {
      createNewSong("My First Song");
    }
  }, [currentSong, createNewSong]);

  // Auto-save with debouncing (1.5 seconds after last change)
  useEffect(() => {
    // Don't auto-save if there's no song
    if (!currentSong) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current !== null) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout to auto-save after 1.5 seconds of inactivity
    autoSaveTimeoutRef.current = window.setTimeout(() => {
      autoSave();
      autoSaveTimeoutRef.current = null;
    }, 1500);

    // Cleanup on unmount or when song changes
    return () => {
      if (autoSaveTimeoutRef.current !== null) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [currentSong, autoSave]); // Trigger auto-save when currentSong changes

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex h-screen bg-black text-text-primary overflow-hidden">
          <ErrorBoundary>
            <Sidebar />
          </ErrorBoundary>
          <div className="flex flex-col flex-1 overflow-hidden">
            <ErrorBoundary>
              <TopBar />
            </ErrorBoundary>
            <main className="flex-1 overflow-y-auto p-6 bg-black">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                  <Route path="/harmony" element={<ErrorBoundary><HarmonyView /></ErrorBoundary>} />
                  <Route path="/structure" element={<ErrorBoundary><StructureView /></ErrorBoundary>} />
                  <Route path="/lyrics" element={<ErrorBoundary><LyricsView /></ErrorBoundary>} />
                  <Route path="/melody" element={<ErrorBoundary><MelodyView /></ErrorBoundary>} />
                  <Route path="/finishing" element={<ErrorBoundary><FinishingView /></ErrorBoundary>} />
                  <Route path="/settings" element={<ErrorBoundary><SettingsView /></ErrorBoundary>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
            </main>
            <ErrorBoundary>
              <PlayerBar />
            </ErrorBoundary>
          </div>
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
