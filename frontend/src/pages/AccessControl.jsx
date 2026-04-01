import React, { useState, useEffect } from 'react';
import { Lock, Plus, Shield, Link2, Trash2 } from 'lucide-react';

export default function AccessControl() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRoute, setNewRoute] = useState("");

  const fetchRoutes = () => {
    fetch('http://localhost:8000/api/protected_routes')
      .then(res => res.json())
      .then(data => {
        setRoutes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newRoute) return;
    
    fetch(`http://localhost:8000/api/protected_routes?path=${encodeURIComponent(newRoute)}`, {
      method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
      setNewRoute("");
      fetchRoutes();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-medium text-[#202124] tracking-tight">Access Control (Anti-Bypass)</h1>
          <p className="text-[#5f6368] mt-1 text-sm">Define endpoints that require strict JWT authentication.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#e6f4ea] text-[#137333] px-4 py-2 rounded-full font-medium text-sm border border-[#ceead6]">
          <Shield className="w-4 h-4" />
          Enforcing 2FA Policies
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-2xl border border-[#dadce0] p-6 shadow-sm h-fit">
          <h2 className="text-lg font-medium text-[#202124] mb-4">Add Protected Route</h2>
          <form className="flex flex-col gap-4" onSubmit={handleAdd}>
            <div>
              <label className="block text-sm font-medium text-[#5f6368] mb-1">Endpoint Path</label>
              <input 
                type="text" 
                value={newRoute}
                onChange={(e) => setNewRoute(e.target.value)}
                placeholder="e.g. /api/admin" 
                className="w-full px-3 py-2 border border-[#dadce0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-sm"
              />
            </div>
            <button 
              type="submit" 
              className="bg-[#1a73e8] text-white px-4 py-2 rounded-md hover:bg-[#1557b0] transition flex items-center justify-center gap-2 font-medium text-sm mt-2"
            >
              <Plus className="w-4 h-4" /> Add Route
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-[#dadce0] p-6 shadow-sm">
          <h2 className="text-lg font-medium text-[#202124] mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#f9ab00]" />
            Currently Secured Routes
          </h2>
          {loading ? (
             <p className="text-[#5f6368] py-4 text-center animate-pulse">Loading routes...</p>
          ) : (
            <div className="flex flex-col gap-3">
              {routes.length === 0 ? (
                <p className="text-[#5f6368] text-center py-6 text-sm">No protected routes defined yet.</p>
              ) : (
                routes.map((rt) => (
                  <div key={rt.id} className="flex items-center justify-between p-4 border border-[#dadce0] rounded-xl hover:border-[#1a73e8] hover:bg-[#f8f9fa] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#fce8e6] p-2 rounded-full text-[#d93025]">
                         <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium text-[#202124]">{rt.path}</div>
                        <div className="text-xs text-[#5f6368] mt-0.5 flex items-center gap-1">
                          <Link2 className="w-3 h-3" /> API Gateway
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] px-2 py-1 rounded font-medium border border-[#d2e3fc]">JWT Required</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
