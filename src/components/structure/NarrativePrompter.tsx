import { useSongStore } from '../../store/songStore';
import { getSongMapById } from '../../data/songMaps';
import { Lightbulb, Target, HelpCircle, Eye } from 'lucide-react';

interface NarrativePrompterProps {
  sectionId?: string;
}

export default function NarrativePrompter({ sectionId }: NarrativePrompterProps) {
  const { currentSong } = useSongStore();
  
  // For now, we'll show general prompts. Later this can be section-specific
  const section = sectionId 
    ? currentSong?.sections.find((s) => s.id === sectionId)
    : currentSong?.sections[0];

  if (!section) {
    return (
      <div className="card">
        <p className="text-gray-400 text-sm">Select a section to see writing prompts</p>
      </div>
    );
  }

  // Try to find the MAP template that matches the song structure
  // For now, show generic prompts based on section type
  const getPromptsForSection = () => {
    switch (section.type) {
      case 'verse':
        return {
          primaryGoal: 'Develop the narrative and add details',
          secondaryConsiderations: [
            'Add specific, concrete details',
            'Show progression from previous verse',
            'Use sensory language',
            'Advance the story',
          ],
          questions: [
            'What new information does this verse reveal?',
            'How does it differ from previous verses?',
            'What specific details can you add?',
            'Where is this happening?',
          ],
          sensoryChecklist: ['Visual details', 'Physical setting', 'Emotional state', 'Specific actions'],
        };
      case 'chorus':
        return {
          primaryGoal: 'Express the core emotional message',
          secondaryConsiderations: [
            'Make it memorable and repeatable',
            'Use strong, emotional language',
            'Create a hook that sticks',
            'Keep it consistent across repetitions',
          ],
          questions: [
            'What is the main message?',
            'What emotion are you trying to convey?',
            'What do you want listeners to remember?',
            'Is this the strongest possible hook?',
          ],
          sensoryChecklist: ['Emotional intensity', 'Memorable phrases', 'Repetition', 'Impact'],
        };
      case 'bridge':
        return {
          primaryGoal: 'Provide contrast and new perspective',
          secondaryConsiderations: [
            'Offer a different angle',
            'Show growth or change',
            'Create contrast with verses/chorus',
            'Build toward the final chorus',
          ],
          questions: [
            'What new perspective can you offer?',
            'How has the situation changed?',
            'What realization or insight?',
            'How does this contrast with the rest?',
          ],
          sensoryChecklist: ['New perspective', 'Contrast', 'Transformation', 'Insight'],
        };
      case 'intro':
        return {
          primaryGoal: 'Set the scene and hook the listener',
          secondaryConsiderations: [
            'Establish atmosphere',
            'Create intrigue',
            'Set the mood',
            'Hook immediately',
          ],
          questions: [
            'What is the mood or atmosphere?',
            'How to grab attention immediately?',
            'What scene are you setting?',
            'What is the first impression?',
          ],
          sensoryChecklist: ['Atmosphere', 'Mood', 'Initial hook', 'Scene setting'],
        };
      case 'outro':
        return {
          primaryGoal: 'Bring the song to a satisfying close',
          secondaryConsiderations: [
            'Echo themes from earlier',
            'Leave lasting impression',
            'Can fade or end strong',
            'Resolve or leave open',
          ],
          questions: [
            'How to end memorably?',
            'What is the final message?',
            'Should it echo the intro?',
            'What impression do you want to leave?',
          ],
          sensoryChecklist: ['Memorable ending', 'Final impression', 'Resolution', 'Echo'],
        };
      default:
        return {
          primaryGoal: 'Develop this section',
          secondaryConsiderations: ['Add details', 'Use sensory language'],
          questions: ['What is this section about?'],
          sensoryChecklist: ['Details', 'Sensory language'],
        };
    }
  };

  const prompts = getPromptsForSection();

  return (
    <div className="card space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-yellow-400" size={20} />
        <h3 className="text-lg font-semibold text-white">Writing Prompts</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${
          section.type === 'verse' ? 'bg-blue-500/20 text-blue-300' :
          section.type === 'chorus' ? 'bg-yellow-500/20 text-yellow-300' :
          section.type === 'bridge' ? 'bg-purple-500/20 text-purple-300' :
          'bg-gray-500/20 text-gray-300'
        }`}>
          {section.type.toUpperCase()}
        </span>
      </div>

      {/* Primary Goal */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target className="text-accent" size={16} />
          <h4 className="text-sm font-semibold text-white">Primary Goal</h4>
        </div>
        <p className="text-sm text-gray-300 ml-6">{prompts.primaryGoal}</p>
      </div>

      {/* Secondary Considerations */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="text-blue-400" size={16} />
          <h4 className="text-sm font-semibold text-white">Considerations</h4>
        </div>
        <ul className="ml-6 space-y-1">
          {prompts.secondaryConsiderations.map((consideration, index) => (
            <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
              <span className="text-gray-600 mt-1">•</span>
              <span>{consideration}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Questions to Answer */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="text-green-400" size={16} />
          <h4 className="text-sm font-semibold text-white">Questions to Answer</h4>
        </div>
        <ul className="ml-6 space-y-2">
          {prompts.questions.map((question, index) => (
            <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-gray-600 mt-1">?</span>
              <span>{question}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sensory Checklist */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Eye className="text-purple-400" size={16} />
          <h4 className="text-sm font-semibold text-white">Sensory Checklist</h4>
        </div>
        <div className="ml-6 flex flex-wrap gap-2">
          {prompts.sensoryChecklist.map((sense, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-dark-elevated rounded border border-gray-800 text-gray-300"
            >
              {sense}
            </span>
          ))}
        </div>
      </div>

      {/* Smart Suggestions */}
      {section.lyrics && (
        <div className="pt-4 border-t border-gray-800">
          <h4 className="text-sm font-semibold text-white mb-2">Smart Suggestions</h4>
          <div className="space-y-2 text-sm text-gray-400">
            {section.lyrics.split('\n').length < 4 && (
              <p>💡 This section could use more lines. Aim for 4-8 lines.</p>
            )}
            {section.lyrics && !section.lyrics.match(/[.!?]$/m) && (
              <p>💡 Consider varying sentence types. Add questions or exclamations for variety.</p>
            )}
            {section.type === 'verse' && section.lyrics && (
              <p>💡 Make sure this verse adds new information or perspective compared to previous verses.</p>
            )}
            {section.type === 'chorus' && section.lyrics && (
              <p>💡 The chorus should be the most memorable part. Is this your strongest hook?</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

