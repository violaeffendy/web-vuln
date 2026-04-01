import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Shield, Activity, List, Crosshair, Settings, Cloud, Command } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import TrafficLogs from "./pages/TrafficLogs";
import LoginSecurity from "./pages/LoginSecurity";
import AccessControl from "./pages/AccessControl";
import Scanner from "./pages/Scanner";
import { Lock, Search as SearchIcon, ShieldAlert } from "lucide-react";

function Sidebar() {
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center px-4 py-3 mx-4 my-1.5 rounded-full transition-all duration-200 gap-4 font-medium ${
          isActive 
            ? "bg-[#e8f0fe] text-[#1a73e8]" 
            : "text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]"
        }`}
      >
        <span className={`${isActive ? "text-[#1a73e8]" : "text-[#5f6368]"}`}>
          <Icon className="w-5 h-5" />
        </span>
        <span className="text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <div className="w-[260px] bg-white border-r border-[#dadce0] flex flex-col h-full z-10 shrink-0">
      <div className="p-6 flex items-center space-x-3 mb-2">
        <div className="p-2 bg-[#e8f0fe] rounded-full">
          <Shield className="text-[#1a73e8] w-6 h-6" />
        </div>
        <h1 className="font-medium text-xl text-[#202124] tracking-tight">AI Security</h1>
      </div>
      
      <div className="px-8 mt-2 mb-3">
        <p className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Console Ops</p>
      </div>

      <nav className="flex-1 space-y-0.5">
        <NavItem to="/" icon={Activity} label="Overview" />
        <NavItem to="/logs" icon={List} label="Traffic Inspector" />
        <NavItem to="/login-security" icon={ShieldAlert} label="Login Security" />
        <NavItem to="/access-control" icon={Lock} label="Access Control" />
        <NavItem to="/scanner" icon={SearchIcon} label="Vuln Scanner" />
        <NavItem to="/interceptor" icon={Crosshair} label="Interceptor" />
        
        <div className="px-8 mt-8 mb-3 pt-6 border-t border-[#dadce0]">
          <p className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Management</p>
        </div>
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </nav>
      
      <div className="p-5 m-4 mt-auto rounded-2xl bg-[#f8f9fa] border border-[#dadce0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="w-3 h-3 rounded-full bg-[#34a853] shadow-[0_0_8px_rgba(52,168,83,0.5)]"></div>
             <div className="absolute inset-0 bg-[#34a853] rounded-full animate-ping opacity-50"></div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#202124]">Cloud WAF</div>
            <div className="text-xs text-[#5f6368] font-mono mt-0.5">us-central1</div>
          </div>
        </div>
        <Cloud className="w-5 h-5 text-[#1a73e8] opacity-70" />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-[#f8f9fa] font-sans text-[#202124] overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8f9fa]">
          <header className="h-[72px] bg-white border-b border-[#dadce0] flex items-center px-8 justify-between shrink-0 shadow-sm z-20">
            <h2 className="text-lg font-normal text-[#202124]">Dashboard Workspace</h2>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-[#f1f3f4] px-4 py-2 rounded-full border border-transparent hover:bg-[#e8eaed] transition-colors cursor-text group">
                 <Command className="w-4 h-4 text-[#5f6368] group-hover:text-[#202124]" />
                 <span className="text-sm text-[#5f6368] group-hover:text-[#202124] font-medium">Search endpoints...</span>
                 <span className="text-xs bg-white text-[#5f6368] px-1.5 py-0.5 rounded shadow-sm opacity-60 ml-3">Ctrl+K</span>
              </div>
              
              <div className="w-9 h-9 rounded-full bg-[#1a73e8] flex items-center justify-center font-medium text-white cursor-pointer hover:bg-[#1557b0] transition-colors shadow-sm text-sm">
                AD
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-8 relative scroll-smooth">
            <div className="max-w-[1400px] mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/logs" element={<TrafficLogs />} />
                <Route path="/login-security" element={<LoginSecurity />} />
                <Route path="/access-control" element={<AccessControl />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/interceptor" element={
                  <div className="flex flex-col items-center justify-center h-[60vh] text-[#5f6368]">
                    <Crosshair className="w-20 h-20 mb-4 opacity-20 text-[#1a73e8]" />
                    <div className="text-lg font-medium">Interceptor Offline</div>
                    <p className="text-sm mt-2">Connect proxy agent to enable Burp-style capturing.</p>
                  </div>
                } />
                <Route path="/settings" element={
                  <div className="h-[60vh] flex items-center justify-center">
                     <div className="material-card rounded-3xl p-12 w-full max-w-2xl flex flex-col items-center justify-center text-center">
                        <Settings className="w-16 h-16 text-[#bdc1c6] mb-4 animate-spin-slow" />
                        <h2 className="text-2xl font-medium mb-2 text-[#202124]">System Preferences</h2>
                        <p className="text-[#5f6368] mb-8">AI Policy models and routing domains are managed here.</p>
                        <button className="px-6 py-2.5 bg-[#1a73e8] text-white rounded-md hover:bg-[#1557b0] transition-colors shadow-sm font-medium text-sm">
                          Configure Engine
                        </button>
                     </div>
                  </div>
                } />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
