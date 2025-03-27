'use client';

export default function ScalpingToolManagePage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-12">Scalping Tool: Choose Your Account</h1>
      <div className="w-40 h-40 bg-zinc-800/50 border border-zinc-700/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/70 transition-colors">
        <div className="text-5xl text-zinc-400 mb-2">+</div>
        <div className="text-sm text-zinc-400">Select Account</div>
      </div>
    </div>
  );
} 