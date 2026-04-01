import { useEffect, useState } from "react";
import axios from "axios";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";

export default function TrafficLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/logs");
      setLogs(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load live traffic logs", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-[0.98] duration-500">
      <div className="material-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between mt-2">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-medium tracking-tight text-[#202124]">Traffic Inspector</h1>
          <p className="text-[#5f6368] mt-1 text-sm">Review incoming HTTP payloads and ML anomalies</p>
        </div>
        
        <div className="flex bg-[#f1f3f4] border border-transparent hover:bg-[#e8eaed] rounded-lg px-4 py-2.5 w-full md:w-[400px] items-center transition-colors focus-within:bg-white focus-within:border-[#1a73e8] focus-within:shadow-[0_0_0_1px_rgba(26,115,232,0.3)]">
          <Search className="w-5 h-5 text-[#5f6368] mr-3" />
          <input 
            type="text" 
            placeholder="Search fingerprints, ips, URIs..." 
            className="bg-transparent border-none outline-none text-sm w-full text-[#202124] placeholder-[#80868b] font-mono"
          />
        </div>
      </div>

      <div className="material-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9fa] text-[#5f6368] border-b border-[#dadce0] text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Protocol</th>
                <th className="px-6 py-4">Resource Node</th>
                <th className="px-6 py-4">Origin Vector</th>
                <th className="px-6 py-4">AI Risk Analysis</th>
                <th className="px-6 py-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dadce0]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#f1f3f4] transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-mono text-[#5f6368] text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                      log.method === 'GET' ? 'bg-[#e8f0fe] text-[#1a73e8]' : 
                      log.method === 'POST' ? 'bg-[#fef7e0] text-[#f29900]' : 
                      'bg-[#f1f3f4] text-[#5f6368]'
                    }`}>
                      {log.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[#202124] max-w-[200px] truncate" title={log.path}>
                    {log.path}
                  </td>
                  <td className="px-6 py-4 font-mono text-[#5f6368]">{log.source_ip}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-[#f1f3f4] rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${log.ai_risk_score > 0.7 ? 'bg-[#ea4335]' : log.ai_risk_score > 0.3 ? 'bg-[#fbbc04]' : 'bg-[#34a853]'}`}
                          style={{ width: `${(log.ai_risk_score * 100).toFixed(0)}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-bold font-mono w-8 ${log.ai_risk_score > 0.7 ? 'text-[#ea4335]' : 'text-[#34a853]'}`}>
                        {(log.ai_risk_score * 100).toFixed(0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.blocked ? (
                      <span className="flex items-center text-[#ea4335] font-bold text-xs">
                        <ShieldAlert className="w-4 h-4 mr-1.5" /> REJECTED
                      </span>
                    ) : (
                      <span className="flex items-center text-[#34a853] font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 mr-1.5 opacity-80" /> OK [{log.status_code}]
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr><td colSpan="6" className="text-center py-10 text-[#5f6368]">No traffic captured yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
