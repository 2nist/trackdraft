import { Chord } from "../../types/music";
import { SubstitutionOption } from "../../lib/harmony/substitutions";
import { X, RotateCw, Minus, Plus, Trash2 } from "lucide-react";

interface ChordEditorToolbarProps {
  chord: Chord | null;
  onSubstitute: (substitution: SubstitutionOption) => void;
  onClose: () => void;
  onRotate?: () => void;
  canRotate?: boolean;
  onBeatsChange?: (beats: number) => void;
  onRemove?: () => void;
  substitutions: {
    commonTone: SubstitutionOption[];
    functional: SubstitutionOption[];
    modalInterchange: SubstitutionOption[];
  } | null;
}

export default function ChordEditorToolbar({
  chord,
  onSubstitute,
  onClose,
  onRotate,
  canRotate = false,
  onBeatsChange,
  onRemove,
  substitutions,
}: ChordEditorToolbarProps) {
  if (!chord) {
    return (
      <div className="text-sm text-white text-center py-8">
        Select a chord to edit
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-sm font-semibold text-white">Chord Editor</h3>
        <div className="flex items-center gap-2">
          {onRotate && (
            <button
              onClick={onRotate}
              disabled={!canRotate}
              className="text-white hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Rotate progression"
            >
              <RotateCw size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Current Chord Info */}
        <div className="pb-2">
          <div className="text-base font-bold text-white">{chord.name}</div>
          <div className="text-xs text-white mt-0.5">{chord.romanNumeral}</div>
          <div className="text-xs text-white mt-0.5">{chord.function}</div>
        </div>

        {/* Beats Control */}
        {onBeatsChange && (
          <div className="pb-2">
            <div className="text-xs font-semibold text-white mb-1.5">Beats</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const currentBeats = chord.beats || 2;
                  if (currentBeats > 0.5) {
                    onBeatsChange(currentBeats - 0.5);
                  }
                }}
                className="p-1 bg-black hover:bg-black rounded border-none text-white transition-colors"
                title="Decrease beats"
              >
                <Minus size={12} />
              </button>
              <span className="text-white font-semibold text-sm flex-1 text-center">
                {chord.beats || 2}
              </span>
              <button
                onClick={() => {
                  const currentBeats = chord.beats || 2;
                  if (currentBeats < 8) {
                    onBeatsChange(currentBeats + 0.5);
                  }
                }}
                className="p-1 bg-black hover:bg-black rounded border-none text-white transition-colors"
                title="Increase beats"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Remove Chord */}
        {onRemove && (
          <div className="pb-2">
            <button
              onClick={onRemove}
              className="w-full px-2 py-1.5 text-xs bg-red-900/30 hover:bg-red-900/50 rounded border-none text-red-300 transition-colors flex items-center justify-center gap-1.5"
              title="Remove chord from progression"
            >
              <Trash2 size={12} />
              Remove Chord
            </button>
          </div>
        )}

        {/* Common Tone Substitutions */}
        {substitutions?.commonTone && substitutions.commonTone.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-white mb-2">
              Common Tone
            </div>
            <div className="space-y-1">
              {substitutions.commonTone.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => onSubstitute(sub)}
                  className="w-full text-left px-2 py-1.5 text-xs bg-black hover:bg-black rounded border-none transition-colors"
                >
                  <div className="font-semibold text-white">{sub.chord.name}</div>
                  <div className="text-white">{sub.reason}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Functional Substitutions */}
        {substitutions?.functional && substitutions.functional.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-white mb-2">
              Functional
            </div>
            <div className="space-y-1">
              {substitutions.functional.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => onSubstitute(sub)}
                  className="w-full text-left px-2 py-1.5 text-xs bg-black hover:bg-black rounded border-none transition-colors"
                >
                  <div className="font-semibold text-white">{sub.chord.name}</div>
                  <div className="text-white">{sub.reason}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Interchange */}
        {substitutions?.modalInterchange &&
          substitutions.modalInterchange.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-white mb-2">
                Modal Interchange
              </div>
              <div className="space-y-1">
                {substitutions.modalInterchange.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSubstitute(sub)}
                    className="w-full text-left px-2 py-1.5 text-xs bg-black hover:bg-black rounded border-none transition-colors"
                  >
                    <div className="font-semibold text-white">
                      {sub.chord.name}
                    </div>
                    <div className="text-white">{sub.reason}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
