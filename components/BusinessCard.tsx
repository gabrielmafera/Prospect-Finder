import React, { useState } from 'react';
import { Business, AuditResult, AuditState, PitchState } from '../types';
import { auditBusiness, generateProposal } from '../services/geminiService';
import { ProposalModal } from './ProposalModal';
import { GroundingSources } from './GroundingSources';

interface Props {
  business: Business;
}

export const BusinessCard: React.FC<Props> = ({ business }) => {
  const [auditState, setAuditState] = useState<AuditState>('idle');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditSources, setAuditSources] = useState<any[]>([]);
  
  const [pitchState, setPitchState] = useState<PitchState>('idle');
  const [pitchText, setPitchText] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAudit = async () => {
    setAuditState('analyzing');
    try {
      const { result, sources } = await auditBusiness(business);
      setAuditResult(result);
      setAuditSources(sources);
      setAuditState('completed');
    } catch (e) {
      setAuditState('error');
    }
  };

  const handleGeneratePitch = async () => {
    if (!auditResult) return;
    setPitchState('thinking');
    setIsModalOpen(true); // Open modal immediately to show loading/thinking state
    try {
      const proposal = await generateProposal(business, auditResult);
      setPitchText(proposal);
      setPitchState('completed');
    } catch (e) {
      setPitchState('error');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-600 bg-red-100 border-red-200';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-slate-900 leading-tight">{business.name}</h3>
            {business.rating && (
                <span className="flex items-center text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">
                    ★ {business.rating}
                </span>
            )}
        </div>
        <p className="text-sm text-slate-500 mb-1">{business.address}</p>
        
        {business.mapsLink && (
           <a href={business.mapsLink} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 mb-3 transition-colors">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             View Location
           </a>
        )}
        
        {business.website ? (
          <a href={business.website} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline break-all block mb-4">
            {business.website}
          </a>
        ) : (
          <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded mb-4 inline-block">
            No Website Detected
          </span>
        )}

        {/* Audit Section */}
        {auditState === 'idle' && (
          <button
            onClick={handleAudit}
            className="w-full mt-2 py-2 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Run Web Audit
          </button>
        )}

        {auditState === 'analyzing' && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
             <div className="flex items-center gap-2 text-sm text-indigo-600 animate-pulse">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing web presence...
             </div>
          </div>
        )}

        {auditState === 'completed' && auditResult && (
          <div className="mt-4 space-y-3">
             <div className={`p-3 rounded-lg border ${getScoreColor(auditResult.score)}`}>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">Prospect Score</span>
                    <span className="font-bold text-lg">{auditResult.score}/10</span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">{auditResult.summary}</p>
             </div>
             
             {auditSources.length > 0 && <GroundingSources sources={auditSources} />}

             <button
               onClick={handleGeneratePitch}
               className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Draft Proposal
             </button>
          </div>
        )}
      </div>

      <ProposalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        state={pitchState} 
        content={pitchText}
        businessName={business.name}
      />
    </div>
  );
};