import React, { useState, useEffect } from 'react';
import { ShieldAlert, User, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function LoginSecurity() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/login_attempts')
      .then(res => res.json())
      .then(data => {
        setAttempts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-medium text-[#202124] tracking-tight">Login Security</h1>
          <p className="text-[#5f6368] mt-1 text-sm">Monitor brute force attacks and failed login attempts.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#fce8e6] text-[#d93025] px-4 py-2 rounded-full font-medium text-sm">
          <ShieldAlert className="w-4 h-4" />
          Live Defense Active
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-sm overflow-hidden">
        <h2 className="text-lg font-medium text-[#202124] mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#1a73e8]" />
          Recent Authorization Events
        </h2>
        
        {loading ? (
           <p className="text-[#5f6368] py-8 text-center animate-pulse">Loading login events...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#dadce0] text-[#5f6368] font-medium">
                  <th className="pb-3 font-medium px-4">Timestamp</th>
                  <th className="pb-3 font-medium px-4">Source IP</th>
                  <th className="pb-3 font-medium px-4">Attempted User</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dadce0]">
                {attempts.length === 0 ? (
                  <tr><td colSpan="4" className="py-6 text-center text-[#5f6368]">No recorded login attempts.</td></tr>
                ) : (
                  attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2 text-[#5f6368]">
                         <Clock className="w-3.5 h-3.5" />
                         {new Date(attempt.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{attempt.ip_address}</td>
                      <td className="py-3 px-4 text-[#202124] font-medium">{attempt.username_attempted || 'unknown'}</td>
                      <td className="py-3 px-4">
                        {attempt.success ? (
                          <span className="inline-flex items-center gap-1 text-[#137333] bg-[#e6f4ea] px-2 py-1 rounded text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#d93025] bg-[#fce8e6] px-2 py-1 rounded text-xs font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
