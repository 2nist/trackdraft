import KeySelector from './KeySelector';
import ProgressionBuilder from './ProgressionBuilder';

export default function HarmonyView() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Harmony</h1>
        <p className="text-gray-400">Step 1: Choose your key and build your chord progression</p>
      </div>

      <div className="space-y-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Select Key</h2>
          <KeySelector />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Chord Progression</h2>
          <ProgressionBuilder />
        </div>
      </div>
    </div>
  );
}

