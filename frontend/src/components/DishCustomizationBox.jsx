import React, { useState, useEffect } from 'react';
import { Sparkles, Edit3, Check, X, Trash2 } from 'lucide-react';
import { getItemCustomizationType, CUSTOMIZATION_PRESETS } from '../utils/customizationPresets';

export default function DishCustomizationBox({
  item,
  onSaveInstructions,
  isExpanded = false,
  onToggleExpand,
}) {
  const currentInstructions = item.specialInstructions || '';
  const [inputText, setInputText] = useState(currentInstructions);

  useEffect(() => {
    setInputText(item.specialInstructions || '');
  }, [item.specialInstructions]);

  const presetType = getItemCustomizationType(item.name, item.category);
  const preset = CUSTOMIZATION_PRESETS[presetType] || CUSTOMIZATION_PRESETS.FOOD;

  const handleChipClick = (chipValue) => {
    // If the input already contains this chip, do nothing or toggle
    if (inputText.includes(chipValue)) {
      return;
    }
    // For single-choice sugar preference on tea/coffee, if it starts with sugar, replace it or append cleanly
    let newText = '';
    if (presetType === 'BEVERAGE' && (chipValue.includes('Cheeni') || chipValue.includes('Sugar') || chipValue.includes('Meetha'))) {
      // Replace existing sugar mention if any, or set directly
      const nonSugarParts = inputText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s && !s.includes('Cheeni') && !s.includes('Sugar') && !s.includes('Meetha'));
      newText = [chipValue, ...nonSugarParts].join(', ');
    } else {
      newText = inputText ? `${inputText}, ${chipValue}` : chipValue;
    }

    setInputText(newText);
    onSaveInstructions(newText);
  };

  const handleSave = () => {
    onSaveInstructions(inputText.trim());
    if (onToggleExpand) onToggleExpand();
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    setInputText('');
    onSaveInstructions('');
  };

  return (
    <div className="mt-2 text-xs">
      {/* 1. Collapsed View: Either Badge or '+ Add Customization' pill */}
      {!isExpanded ? (
        <div className="flex items-center flex-wrap gap-1.5">
          {currentInstructions ? (
            <div className="inline-flex items-center gap-1.5 bg-amber-100/90 text-amber-950 px-2.5 py-1 rounded-xl border border-amber-300 font-medium shadow-2xs">
              <span className="text-amber-700 font-black">📝</span>
              <span className="font-bold text-[11px] truncate max-w-[200px] sm:max-w-xs">
                {currentInstructions}
              </span>
              <button
                type="button"
                onClick={onToggleExpand}
                className="text-stone-600 hover:text-stone-900 ml-1 p-0.5 rounded hover:bg-amber-200/60 transition"
                title="निर्देश बदलें (Edit)"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-red-600 hover:text-red-800 p-0.5 rounded hover:bg-red-100 transition"
                title="नोट हटाएं (Clear)"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleExpand}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl border border-dashed border-amber-300 transition active:scale-95 cursor-pointer"
            >
              <span>{preset.icon}</span>
              <span>
                {presetType === 'BEVERAGE'
                  ? '+ कितनी चम्मच चीनी? (Add Sugar/Chai Note)'
                  : '+ 📝 निर्देश (तीखापन / मक्खन / जैन)'}
              </span>
            </button>
          )}
        </div>
      ) : (
        /* 2. Expanded Interactive Customization Box */
        <div className="bg-amber-50/90 border-2 border-amber-300/90 rounded-2xl p-3 shadow-xs space-y-2.5 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/70">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{preset.icon}</span>
              <div>
                <span className="font-brand font-black text-xs text-amber-950 block leading-tight">
                  {preset.title}
                </span>
                <span className="text-[10px] text-stone-600 font-medium block">
                  {preset.subtitle}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleExpand}
              className="w-6 h-6 rounded-full bg-amber-200/60 hover:bg-amber-300 text-stone-700 flex items-center justify-center transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Choice Chips */}
          <div className="flex flex-wrap gap-1.5">
            {preset.chips.map((chip, idx) => {
              const isSelected = inputText.includes(chip.value);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip.value)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all shadow-2xs border active:scale-95 ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-white hover:bg-amber-100 text-stone-800 border-amber-300'
                  }`}
                >
                  {isSelected ? `✓ ${chip.label}` : chip.label}
                </button>
              );
            })}
          </div>

          {/* Custom Editable Text Input Box */}
          <div className="relative">
            <input
              type="text"
              placeholder={preset.placeholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
            />
            {inputText && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-red-600 transition"
                title="Clear text"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Footer Controls: Save & Done */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-amber-900/80 font-semibold">
              💡 Chef ko ticket par direct dikhega
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleExpand}
                className="px-2.5 py-1 text-[11px] text-stone-600 hover:text-stone-900 font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white font-brand font-black text-[11px] px-3.5 py-1 rounded-xl shadow-xs flex items-center gap-1 transition active:scale-95"
              >
                <Check className="w-3 h-3" />
                <span>Save Note (सेव)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
