import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = () => {
  const location = useLocation();

  // Page title mapping
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Executive Governance Dashboard';
      case '/brand-dna':
        return 'Brand DNA Engine & Knowledge Base';
      case '/guidelines':
        return 'Brand Guidelines Intelligence';
      case '/inspector':
        return 'AI Content Inspector & Verifier';
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
        if (pathname.includes('/findings')) return 'Explainable AI Verification Findings';
        return 'Brand Governance Platform';
    }
  };

  return (
    <div className="flex h-screen bg-canvasBg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title={getPageTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-canvasBg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
