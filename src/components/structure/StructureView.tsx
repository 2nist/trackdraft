import { useState } from 'react';
import StructureVisualizer from './StructureVisualizer';
import NarrativePrompter from './NarrativePrompter';
import MapTemplateSelector from './MapTemplateSelector';
import BridgeBuilder from './BridgeBuilder';
import { Layout, FileText, Sparkles, Zap } from 'lucide-react';

export default function StructureView() {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'templates' | 'prompts' | 'bridge'>('visualizer');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Song Structure</h1>
        <p className="text-gray-400">Step 2: Map out your song's narrative structure</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'templates'
              ? 'border-accent text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            Templates
          </div>
        </button>
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'visualizer'
              ? 'border-accent text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layout size={18} />
            Structure
          </div>
        </button>
        <button
          onClick={() => setActiveTab('bridge')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'bridge'
              ? 'border-accent text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap size={18} />
            Bridge
          </div>
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'prompts'
              ? 'border-accent text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={18} />
            Prompts
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'templates' && (
          <div className="lg:col-span-3">
            <MapTemplateSelector />
          </div>
        )}

        {activeTab === 'visualizer' && (
          <>
            <div className="lg:col-span-2">
              <StructureVisualizer
                onSectionClick={(sectionId) => {
                  setSelectedSectionId(sectionId);
                  setActiveTab('prompts');
                }}
              />
            </div>
            <div className="lg:col-span-1">
              <NarrativePrompter sectionId={selectedSectionId || undefined} />
            </div>
          </>
        )}

        {activeTab === 'bridge' && (
          <div className="lg:col-span-3">
            <BridgeBuilder />
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="lg:col-span-3">
            <NarrativePrompter sectionId={selectedSectionId || undefined} />
          </div>
        )}
      </div>
    </div>
  );
}
