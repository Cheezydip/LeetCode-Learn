import React, { useState } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { ShieldAlert, KeyRound, CheckCircle2, Copy, ExternalLink, ArrowRight, Sparkles, Terminal } from 'lucide-react';

export const VerificationGateway = () => {
  const {
    handle,
    setHandle,
    region,
    setRegion,
    verificationToken,
    verificationInstructions,
    verificationMessage,
    isGeneratingToken,
    isVerifyingToken,
    generateTokenAction,
    verifyTokenAction,
    syncLeetCode,
  } = useProfileStore();

  const [inputHandle, setInputHandle] = useState(handle || '');
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!inputHandle.trim()) return;
    setHandle(inputHandle.trim());
    generateTokenAction(inputHandle.trim());
  };

  const handleCopyToken = () => {
    if (!verificationToken) return;
    navigator.clipboard.writeText(verificationToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    verifyTokenAction();
  };

  const handleDemoSandbox = async () => {
    // Quick Evaluation Helper: Demo with Neal Wu's public verified profile
    setInputHandle('neal_wu');
    setHandle('neal_wu');
    await syncLeetCode('neal_wu', 'global');
  };

  const leetcodeProfileUrl = region === 'cn'
    ? 'https://leetcode.cn/profile/'
    : 'https://leetcode.com/profile/';

  return (
    <div className="max-w-4xl mx-auto my-6 sm:my-10 px-4 animate-in fade-in zoom-in-95 duration-200 font-mono">
      
      {/* Top Restricted Access Alert Banner */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#FF7A00]/40 shadow-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00]">
            <ShieldAlert className="size-5 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#FF7A00]">
              <span>ACCESS RESTRICTED</span>
              <span>//</span>
              <span>IDENTITY HANDSHAKE REQUIRED</span>
            </div>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Your stats and learning data are hidden until you verify ownership of your LeetCode account.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemoSandbox}
          className="px-3 py-1.5 rounded-lg bg-[#090C10] hover:bg-[#21262D] border border-[#30363D] hover:border-[#FF7A00]/50 text-xs text-[#8B949E] hover:text-[#FF7A00] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Sparkles className="size-3.5 text-[#FF7A00]" />
          <span>Quick Demo Sandbox</span>
        </button>
      </div>

      {/* Main Verification Terminal Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1117] border border-[#21262D] shadow-2xl space-y-6">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#21262D]">
          <div className="flex items-center gap-2.5">
            <Terminal className="size-5 text-[#FF7A00]" />
            <h2 className="text-base sm:text-lg font-bold text-[#F0F6FC]">
              LeetCode Account Verification
            </h2>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-[#161B22] border border-[#21262D] text-[#8B949E]">
            ANTI-IMPERSONATION PROTOCOL
          </span>
        </div>

        {/* 3-Step Guided Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className={`p-3.5 rounded-xl border ${!verificationToken ? 'bg-[#161B22] border-[#FF7A00]/50 text-[#F0F6FC]' : 'bg-[#090C10] border-[#21262D] text-[#8B949E]'}`}>
            <span className="text-[10px] font-bold text-[#FF7A00] block mb-1">STEP 01</span>
            <strong>Enter LeetCode Handle</strong>
            <p className="text-[11px] text-[#8B949E] mt-1">Specify your handle & target region.</p>
          </div>
          <div className={`p-3.5 rounded-xl border ${verificationToken ? 'bg-[#161B22] border-[#FF7A00]/50 text-[#F0F6FC]' : 'bg-[#090C10] border-[#21262D] text-[#8B949E]'}`}>
            <span className="text-[10px] font-bold text-[#FF7A00] block mb-1">STEP 02</span>
            <strong>Add Token to Profile Bio</strong>
            <p className="text-[11px] text-[#8B949E] mt-1">Copy token into your LeetCode "About Me".</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#21262D] text-[#8B949E]">
            <span className="text-[10px] font-bold text-[#FF7A00] block mb-1">STEP 03</span>
            <strong>Verify & Ingest Stats</strong>
            <p className="text-[11px] text-[#8B949E] mt-1">Server scans bio and unlocks your dashboard.</p>
          </div>
        </div>

        {/* Step 1: Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-8 space-y-1.5">
              <label className="text-xs text-[#8B949E] block font-semibold">
                Your Public LeetCode Username:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#8B949E]">@</span>
                <input
                  type="text"
                  value={inputHandle}
                  onChange={(e) => setInputHandle(e.target.value)}
                  placeholder="e.g. your_leetcode_username"
                  className="w-full pl-8 pr-3 py-2 bg-[#090C10] border border-[#21262D] focus:border-[#FF7A00] rounded-xl text-sm text-[#F0F6FC] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs text-[#8B949E] block font-semibold">
                Cluster Region:
              </label>
              <div className="flex rounded-xl border border-[#21262D] p-0.5 bg-[#090C10]">
                <button
                  type="button"
                  onClick={() => setRegion('global')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    region === 'global' ? 'bg-[#FF7A00] text-black' : 'text-[#8B949E] hover:text-white'
                  }`}
                >
                  Global (.com)
                </button>
                <button
                  type="button"
                  onClick={() => setRegion('cn')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    region === 'cn' ? 'bg-[#FF7A00] text-black' : 'text-[#8B949E] hover:text-white'
                  }`}
                >
                  China (.cn)
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGeneratingToken || !inputHandle.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FFA040] disabled:opacity-50 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#FF7A00]/20"
          >
            <KeyRound className="size-4" />
            <span>{isGeneratingToken ? 'Generating Token...' : 'Generate Anti-Impersonation Token'}</span>
          </button>
        </form>

        {/* Step 2: Generated Token Box (if active) */}
        {verificationToken && (
          <div className="p-5 rounded-xl bg-[#090C10] border border-[#FF7A00]/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#FF7A00] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                <span>Verification Token Issued (15 Min TTL)</span>
              </span>
              <span className="text-[10px] text-[#8B949E]">Handle: @{handle}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#161B22] border border-[#21262D] gap-3">
              <code className="text-base sm:text-lg font-bold text-[#F0F6FC] tracking-widest selection:bg-[#FF7A00] selection:text-black">
                {verificationToken}
              </code>
              <button
                type="button"
                onClick={handleCopyToken}
                className="px-3 py-1.5 rounded-md bg-[#0D1117] hover:bg-[#21262D] border border-[#30363D] text-xs font-bold text-[#F0F6FC] hover:text-[#FF7A00] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Copy className="size-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Token'}</span>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#161B22] border border-[#21262D] text-xs text-[#8B949E] space-y-2">
              <p>
                {verificationInstructions || 'Paste this token into your LeetCode profile bio ("About Me"), then click Verify Profile below.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={leetcodeProfileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#FF7A00] hover:text-[#FFA040] font-bold flex items-center gap-1 underline underline-offset-4 cursor-pointer"
                >
                  <span>Open LeetCode Profile Settings</span>
                  <ExternalLink className="size-3" />
                </a>
                <span className="text-[11px] text-[#8B949E]">(You can delete it immediately after)</span>
              </div>
            </div>

            {/* Step 3: Verify Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifyingToken}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#3FB950] hover:bg-[#2EA043] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#3FB950]/20"
              >
                <span>{isVerifyingToken ? 'Querying LeetCode Bio...' : 'Verify Profile & Ingest Stats'}</span>
                <ArrowRight className="size-4" />
              </button>

              {verificationMessage && (
                <div className="text-xs text-[#F85149] font-bold">
                  {verificationMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informational Security Notes */}
        <div className="pt-4 border-t border-[#21262D] text-[11px] text-[#8B949E] space-y-1">
          <div className="font-semibold text-[#F0F6FC] flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#FF7A00]" />
            <span>Why is this required?</span>
          </div>
          <p>
            LeetCode statistics are public, but personalized training plans, weak spot analysis, and learning paths require verified account ownership.
          </p>
        </div>

      </div>

    </div>
  );
};
