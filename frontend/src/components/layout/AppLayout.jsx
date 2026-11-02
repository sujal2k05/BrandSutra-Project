import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Page title mapping
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Executive Governance Dashboard';
      case '/brand-dna':
        return 'Brand DNA Knowledge Base';
      case '/guidelines':
        return 'Brand Guidelines Intelligence';
      case '/inspector':
        return 'AI Content Inspector & Verifier';
      case '/self-healing':
        return 'Agentic Self-Healing Studio';
      case '/adversarial-simulator':
        return 'Adversarial PR Simulator';
      case '/drift-sentinel':
        return 'Live Brand Drift Sentinel';
      case '/submissions':
        return 'My Content Submissions';
      case '/approvals':
        return 'Human Review & Approval Queue';
      case '/analytics':
        return 'Brand Risk & Governance Analytics';
      case '/team':
        return 'Team & Permissions Management';
      case '/settings':
        return 'Workspace Settings';
      default:
        return 'Brand Governance Platform';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          title={getPageTitle(location.pathname)} 
          setIsMobileOpen={setIsMobileOpen} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-[#0B1120]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
