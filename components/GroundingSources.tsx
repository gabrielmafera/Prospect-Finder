import React from 'react';
import { GroundingChunk } from '../types';

interface Props {
  sources: GroundingChunk[];
}

export const GroundingSources: React.FC<Props> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  // Deduplicate sources by URI
  const uniqueSources = Array.from(new Set(sources.map(s => s.web?.uri || s.maps?.uri)))
    .map(uri => sources.find(s => (s.web?.uri === uri) || (s.maps?.uri === uri)))
    .filter(Boolean)
    .slice(0, 3); // Limit to top 3

  return (
    <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-2">
      <span className="uppercase tracking-wider font-semibold mr-2">Sources:</span>
      <div className="flex flex-wrap gap-2 mt-1">
        {uniqueSources.map((source, idx) => {
          const info = source?.web || source?.maps;
          if (!info) return null;
          return (
            <a 
              key={idx} 
              href={info.uri} 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-indigo-500 underline truncate max-w-[150px]"
              title={info.title}
            >
              {info.title || new URL(info.uri).hostname}
            </a>
          );
        })}
      </div>
    </div>
  );
};
