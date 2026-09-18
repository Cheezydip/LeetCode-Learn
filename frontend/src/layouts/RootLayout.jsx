import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader.jsx';
import { GridCanvas } from '../components/GridCanvas.jsx';
import { LeetCodeSyncModal } from '../components/LeetCodeSyncModal.jsx';
import { VerificationGateway } from '../components/VerificationGateway.jsx';
import { useProfileStore } from '../store/useProfileStore.js';

export const RootLayout = () => {
  const { isVerified } = useProfileStore();

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F0F6FC] font-mono selection:bg-[#FF7A00]/20 selection:text-[#FF7A00] relative">
      {/* Procedural Clustered Grid Canvas (Persistent across all routes) */}
      <GridCanvas />

      {/* Global Command Bar / Navigation Header */}
      <AppHeader />

      {/* Synchronized LeetCode Profile Modal */}
      <LeetCodeSyncModal />

      {/* Page Content Outlet or Zero-Trust Verification Gateway */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 relative z-10 pb-24">
        {isVerified ? <Outlet /> : <VerificationGateway />}
      </main>

      {/* Status Bar Footer */}
      <footer className="border-t border-[#21262D] bg-[#0D1117]/80 backdrop-blur-sm py-4 px-4 text-center text-xs text-[#8B949E] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${isVerified ? 'bg-[#3FB950]' : 'bg-[#FF7A00] animate-pulse'}`}></span>
            <span>
              {isVerified
                ? 'Verified — Dashboard Active'
                : 'SYSTEM RESTRICTED: IDENTITY VERIFICATION REQUIRED'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#8B949E]">
            <span>LeetCode-Learn v2.4.0</span>
            <span>•</span>
            <span>DATA: LeetCode GraphQL Proxy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
