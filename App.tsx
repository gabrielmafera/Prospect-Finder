import React, { useState } from 'react';
import { findBusinesses } from './services/geminiService';
import { Business, SearchState } from './types';
import { BusinessCard } from './components/BusinessCard';
import { GroundingSources } from './components/GroundingSources';

const App: React.FC = () => {
  const [businessType, setBusinessType] = useState('Plumber');
  const [location, setLocation] = useState('Windhoek');
  
  const [state, setState] = useState<SearchState>('idle');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [mapSources, setMapSources] = useState<any[]>([]);
  const [rawText, setRawText] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType || !location) return;

    setState('loading');
    setBusinesses([]);
    setMapSources([]);
    setRawText('');

    try {
      const { businesses: foundBusinesses, mapLinks, rawText: text } = await findBusinesses(businessType, location);
      setBusinesses(foundBusinesses);
      setMapSources(mapLinks);
      setRawText(text);
      setState('success');
    } catch (error) {
      setState('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <div>
                 <h1 className="text-2xl font-bold tracking-tight text-slate-900">ProspectFinder AI</h1>
                 <p className="text-xs text-slate-500 font-medium">Find & Audit Local Clients</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl flex gap-2">
              <div className="relative flex-grow">
                 <label htmlFor="type" className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Business Type</label>
                 <input
                    id="type"
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. Plumber, Dentist"
                    className="w-full h-11 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 bg-slate-50/50 hover:bg-white text-sm"
                 />
              </div>
              <div className="relative flex-grow">
                 <label htmlFor="location" className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Location</label>
                 <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Cape Town"
                    className="w-full h-11 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 bg-slate-50/50 hover:bg-white text-sm"
                 />
              </div>
              <button
                type="submit"
                disabled={state === 'loading'}
                className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {state === 'loading' ? 'Searching...' : 'Find Prospects'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {state === 'idle' && (
           <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
              <svg className="w-20 h-20 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h2 className="text-xl font-medium text-slate-600">Start your search</h2>
              <p className="text-slate-400 max-w-md mt-2">Enter a business niche and a city to find prospects. We use Google Maps data to locate real businesses.</p>
           </div>
        )}

        {state === 'error' && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             Something went wrong retrieving businesses. Please check your connection and API key.
          </div>
        )}

        {state === 'success' && (
          <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800">
                    Found {businesses.length} Prospects in {location}
                </h2>
                {mapSources.length > 0 && (
                    <div className="max-w-xs text-right">
                       <GroundingSources sources={mapSources} />
                    </div>
                )}
            </div>

            {businesses.length === 0 ? (
               <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center">
                  <p className="text-slate-500 mb-2">We couldn't parse structured data, but here is what the model found:</p>
                  <div className="text-left bg-slate-50 p-4 rounded text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                     {rawText}
                  </div>
               </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {businesses.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                ))}
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
