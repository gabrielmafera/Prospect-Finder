import React from 'react';
import { PitchState } from '../types';
import ReactMarkdown from 'react-markdown'; // Wait, standard libraries only. We'll use simple whitespace pre-wrap.

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: PitchState;
  content: string | null;
  businessName: string;
}

export const ProposalModal: React.FC<Props> = ({ isOpen, onClose, state, content, businessName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">
            {state === 'thinking' ? 'Generating Strategy...' : `Proposal for ${businessName}`}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-white custom-scrollbar">
          {state === 'thinking' && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="relative w-16 h-16">
                 <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div>
                <p className="text-lg font-medium text-slate-800">Thinking deeply...</p>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                    Analyzing industry trends, the business's current digital footprint, and crafting the perfect angle.
                </p>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-8 text-red-600">
              <p>Something went wrong generating the proposal. Please try again.</p>
            </div>
          )}

          {state === 'completed' && content && (
            <div className="prose prose-indigo max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
                {content}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
            Close
          </button>
          {state === 'completed' && (
            <button 
                onClick={() => {
                    navigator.clipboard.writeText(content || "");
                    alert("Copied to clipboard!");
                }}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
            >
                Copy to Clipboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
