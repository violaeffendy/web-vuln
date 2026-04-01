import React, { useState } from 'react';
import { Target, Search, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Scanner() {
  const [target, setTarget] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    if (!target) return;
    
    setScanning(true);
    setResults(null);
    
    fetch('http://localhost:8000/api/scan', {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        setTimeout(() => {
          setResults(data);
          setScanning(false);
        }, 1500); // simulate scan time
      })
      .catch(err => {
        console.error(err);
        setScanning(false);
      });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-medium text-[#202124] tracking-tight">Vulnerability Scanner</h1>
          <p className="text-[#5f6368] mt-1 text-sm">Actively probe the backend infrastructure for known CVEs and misconfigurations.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-sm">
        <h2 className="text-lg font-medium text-[#202124] mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#f9ab00]" />
          Target Definition
        </h2>
        
        <form className="flex flex-col sm:flex-row gap-4 max-w-2xl" onSubmit={handleScan}>
          <div className="flex-1 relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#5f6368]" />
             </div>
             <input 
               type="text" 
               value={target}
               onChange={(e) => setTarget(e.target.value)}
               placeholder="Enter target URL (e.g. https://target-app.com)" 
               className="block w-full pl-10 pr-3 py-2.5 border border-[#dadce0] rounded-md focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-[#202124] sm:text-sm font-mono shadow-sm"
             />
          </div>
          <button 
            type="submit" 
            disabled={scanning}
            className={`px-6 justify-center py-2.5 rounded-md text-white font-medium text-sm flex items-center gap-2 transition shadow-sm ${
              scanning ? 'bg-[#bdc1c6] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'
            }`}
          >
            {scanning ? (
              <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Scanning...</>
            ) : (
              <><Search className="w-4 h-4" /> Start Scan</>
            )}
          </button>
        </form>
      </div>

      {results && (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#202124] mb-4 flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-[#137333]" />
               Scan Report
            </h2>
            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-4 mb-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4">
                  <CheckCircle2 className="w-12 h-12 text-[#34a853] opacity-20" />
               </div>
               <div className="text-sm text-[#5f6368] font-mono mb-1">Target Initialized</div>
               <div className="text-lg font-medium text-[#202124]">{results.target}</div>
               <div className="flex gap-4 mt-4">
                  <div className="bg-white px-3 py-1.5 rounded-md border border-[#dadce0] text-sm font-medium text-[#5f6368]">
                    Found: <span className="text-[#d93025]">{results.results?.length || 0} Issues</span>
                  </div>
               </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[#5f6368] uppercase tracking-wider mb-2">Detailed Findings</h3>
              {results.results?.map((res, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl border-[#dadce0] hover:shadow-sm transition bg-white">
                  <div className="flex items-start gap-3 mb-3 md:mb-0">
                     <AlertTriangle className={`w-5 h-5 mt-0.5 ${res.severity === 'Medium' ? 'text-[#f9ab00]' : 'text-[#f29900]'}`} />
                     <div>
                       <div className="font-medium text-[#202124]">{res.vuln}</div>
                       <div className="font-mono text-xs text-[#5f6368] mt-1 bg-[#f1f3f4] inline-block px-1.5 py-0.5 rounded">{res.endpoint}</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                       res.severity === 'Medium' 
                         ? 'bg-[#fef7e0] text-[#ea8600] border-[#fce8b2]' 
                         : 'bg-[#f1f3f4] text-[#5f6368] border-[#dadce0]'
                     }`}>
                       {res.severity}
                     </span>
                     <button className="text-xs text-[#1a73e8] hover:underline font-medium">View Patch Info</button>
                  </div>
                </div>
              ))}
              {(!results.results || results.results.length === 0) && (
                <p className="text-sm text-[#5f6368] py-4 text-center">No vulnerabilities found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
