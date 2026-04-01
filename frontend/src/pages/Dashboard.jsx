import { useEffect, useState } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { AlertCircle, ShieldAlert, Cpu, Orbit } from "lucide-react";

const API_BASE = "http://localhost:8000/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_requests: 0,
    total_blocked: 0,
    total_anomalies: 0,
    block_rate: "0.00%"
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`);
      setStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch live WAF stats", error);
    }
  };

  // Mock data for beautiful area chart
  const trafficData = [
    { time: '10:00', safe: 120, threats: 2 },
    { time: '10:05', safe: 180, threats: 5 },
    { time: '10:10', safe: 250, threats: 45 },
    { time: '10:15', safe: 490, threats: 80 },
    { time: '10:20', safe: 130, threats: 3 },
    { time: '10:25', safe: 320, threats: 15 },
    { time: '10:30', safe: 650, threats: 2 },
  ];

  const StatCard = ({ icon: Icon, label, value, colorClass, borderClass }) => (
    <div className={`material-card p-6 flex flex-col justify-between h-36 border-t-4 ${borderClass}`}>
      <div className="flex justify-between items-start">
        <div className="text-3xl font-medium tracking-tight text-[#202124]">
          {value}
        </div>
        <div className={`p-2 rounded-full ${colorClass} bg-opacity-10`}>
           <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div>
        <div className="text-[#5f6368] font-medium text-sm tracking-wide">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-[0.98] duration-500">
      <div className="flex justify-between items-end mb-8 mt-2">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-[#202124]">
            Overview
          </h1>
          <p className="text-[#5f6368] text-sm mt-1">Real-time threat intelligence and traffic.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#e6f4ea] text-[#137333] px-3 py-1.5 rounded-full border border-[#ceead6]">
          <Orbit className="w-4 h-4 animate-[spin_10s_linear_infinite]" />
          <span className="text-xs font-bold tracking-wider uppercase">Active Security</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Cpu} label="Total Throughput" value={stats.total_requests} colorClass="bg-[#1a73e8]" borderClass="border-t-[#1a73e8]" />
        <StatCard icon={ShieldAlert} label="Mitigated Attacks" value={stats.total_blocked} colorClass="bg-[#ea4335]" borderClass="border-t-[#ea4335]" />
        <StatCard icon={AlertCircle} label="AI Anomalies" value={stats.total_anomalies} colorClass="bg-[#fbbc04]" borderClass="border-t-[#fbbc04]" />
      </div>

      <div className="material-card p-6 mt-6">
        <div className="flex justify-between items-center mb-8">
           <div>
             <h3 className="text-xl font-medium text-[#202124]">Traffic Volume</h3>
             <p className="text-[#5f6368] text-xs">Monitored bandwidth over past hour</p>
           </div>
           
           <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-medium bg-[#f1f3f4] text-[#5f6368] px-3 py-1.5 rounded-full border border-[#dadce0]">
                 <div className="w-2 h-2 rounded-full bg-[#1a73e8]"></div> Checked Payloads
              </div>
              <div className="flex items-center gap-2 text-xs font-medium bg-[#fce8e6] text-[#c5221f] px-3 py-1.5 rounded-full border border-[#f4c7c3]">
                 <div className="w-2 h-2 rounded-full bg-[#ea4335]"></div> Intercepted Threats
              </div>
           </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#1a73e8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea4335" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ea4335" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" vertical={false} />
              <XAxis dataKey="time" stroke="#9aa0a6" tick={{fill: '#5f6368', fontSize: 12}} dy={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#9aa0a6" tick={{fill: '#5f6368', fontSize: 12}} dx={-10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', color: '#202124', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontWeight: "bold" }}
              />
              <Area type="monotone" dataKey="safe" stroke="#1a73e8" strokeWidth={2} fillOpacity={1} fill="url(#colorSafe)" />
              <Area type="monotone" dataKey="threats" stroke="#ea4335" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
