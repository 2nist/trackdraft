import { useState } from 'react';
import FinishingTools from './FinishingTools';
import MixDashboard from './MixDashboard';
import { Sparkles, BarChart3 } from 'lucide-react';

export default function FinishingView() {
  const [activeTab, setActiveTab] = useState<'tools' | 'mix'>('tools');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Finishing</h1>
        <p className="text-gray-400">Step 7: Add final polish and export your song</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'tools'
              ? 'border-accent text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            Finishing Tools
          </div>
        </button>
        <button
          onClick={() => setActiveTab('mix')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'mix'
              ? 'border-accent text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={18} />
            Mix Dashboard
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'tools' && <FinishingTools />}
        {activeTab === 'mix' && <MixDashboard />}
      </div>
    </div>
  );
}

