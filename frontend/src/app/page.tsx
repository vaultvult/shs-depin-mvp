'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract, useWriteContract, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { toast } from 'sonner';
import { Zap, Shield, Activity, Users, ArrowUpRight, Copy, LogOut, Sun } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EnergyMarketABI from '../abis/EnergyMarket.json';
import MockUSDCABI from '../abis/MockUSDC.json';
import SolarAssetABI from '../abis/SolarAsset.json';
import SolarVaultABI from '../abis/SolarVault.json';

const MARKET_ADDRESS = '0xdE2c2d46F22f5a11a127D8EfC5b13c2164dd78e7';
const USDC_ADDRESS = '0x19016bE9467eaF2A394000999c46F4cD032b87a9';
const ASSET_ADDRESS = '0x25b8130ee2e521C71e578371442135C3C22b832b';
const VAULT_ADDRESS = '0xf7C7FD03e596EC6C6420938133eFe7647D29a03a';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'operator' | 'consumer' | 'admin' | 'investor'>('operator');
  const [deviceId, setDeviceId] = useState('SHS-LAGOS-001');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [assetTokenId, setAssetTokenId] = useState('0');
  const [payAmount, setPayAmount] = useState('');
  const [genAmount, setGenAmount] = useState('');
  const [investAmount, setInvestAmount] = useState('');

  const mockYieldData = [
    { day: 'Mon', yield: 0.5 }, { day: 'Tue', yield: 0.8 }, { day: 'Wed', yield: 1.2 },
    { day: 'Thu', yield: 1.1 }, { day: 'Fri', yield: 1.8 }, { day: 'Sat', yield: 2.1 }, { day: 'Sun', yield: 2.5 },
  ];

  useEffect(() => setMounted(true), []);

  const { login, logout, authenticated, user, ready } = usePrivy();
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const { data: operatorBalance, refetch: refetchBalance } = useReadContract({
    address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'operatorBalances', args: user?.wallet?.address ? [user.wallet.address] : undefined,
  });

  const { data: contractOwner } = useReadContract({ address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'owner' });
  const { data: investorShares, refetch: refetchShares } = useReadContract({
    address: VAULT_ADDRESS, abi: SolarVaultABI.abi, functionName: 'shares', args: user?.wallet?.address ? [user.wallet.address] : undefined,
  });

  const isOwner = !!user?.wallet?.address && !!contractOwner && user.wallet.address.toLowerCase() === (contractOwner as string).toLowerCase();

  useEffect(() => { if (!isOwner && activeTab === 'admin') setActiveTab('operator'); }, [isOwner, activeTab]);

  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => { if (isSuccess) { refetchBalance(); refetchShares(); } }, [isSuccess, refetchBalance, refetchShares]);

  const handleTx = async (contractCall: any, successMsg: string) => {
    try {
      const promise = writeContractAsync(contractCall);
      toast.promise(promise, {
        loading: 'Processing transaction...',
        success: () => successMsg,
        error: (err) => `Error: ${err.shortMessage || err.message}`,
      });
    } catch (err) { console.error(err); }
  };

  const handleMintAsset = () => handleTx({ address: ASSET_ADDRESS, abi: SolarAssetABI.abi, functionName: 'mintAsset', args: [user?.wallet?.address, "ipfs://QmMockDocumentHash"] }, "Asset NFT Minted!");
  const handleAllowlist = () => handleTx({ address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'setAllowlist', args: [user?.wallet?.address, true] }, "Operator Allowlisted!");
  const handleRegister = () => handleTx({ address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'registerDevice', args: [deviceId, location, BigInt(assetTokenId)] }, "Asset Registered!");
  const handleApprove = () => handleTx({ address: USDC_ADDRESS, abi: MockUSDCABI.abi, functionName: 'approve', args: [MARKET_ADDRESS, parseUnits('100', 6)] }, "USDC Approved!");
  const handlePay = () => handleTx({ address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'purchaseEnergy', args: [deviceId, parseUnits(payAmount, 6)] }, "Energy Purchased!");
  const handleWithdraw = () => handleTx({ address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'withdrawRewards' }, "Rewards Withdrawn!");
  const handleSimulateOracle = () => handleTx({ address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'submitProofOfGeneration', args: [deviceId, BigInt(genAmount)] }, "Oracle Data Pushed!");
  const handleDeposit = () => handleTx({ address: VAULT_ADDRESS, abi: SolarVaultABI.abi, functionName: 'deposit', args: [parseUnits(investAmount, 6)] }, "Invested in Solar Vault!");
  const handleClaimYield = () => handleTx({ address: VAULT_ADDRESS, abi: SolarVaultABI.abi, functionName: 'claimYield' }, "Yield Claimed Successfully!");

  if (!mounted || !ready) return null;

  return (
    <main className="min-h-screen font-sans selection:bg-emerald-500/30 text-zinc-200">
      
      {/* Network Guard */}
      {authenticated && chain?.id !== baseSepolia.id && (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-bold flex justify-center items-center gap-4 z-50 relative">
          ⚠️ Wrong Network.
          <button onClick={() => switchChain({ chainId: baseSepolia.id })} className="bg-white text-red-600 px-3 py-1 rounded shadow hover:bg-gray-100">Switch to Base Sepolia</button>
        </div>
      )}

      {/* Premium Navbar */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sun className="text-black w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">SHS DePIN</h1>
          </div>
          
          {authenticated ? (
            <div className="flex items-center gap-3">
              <button onClick={() => { navigator.clipboard.writeText(user?.wallet?.address || ""); toast.info("Address copied!"); }} className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-emerald-400 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all">
                {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)} <Copy size={14} />
              </button>
              <button onClick={logout} className="text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/10 transition-all">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={login} className="bg-white text-black font-semibold px-6 py-2.5 rounded-full hover:bg-emerald-400 transition-all shadow-lg">
              Connect
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Hero Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live on Base Sepolia
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Tokenize Solar. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Earn Real Yield.</span>
          </h2>
          <p className="text-lg text-zinc-400">
            SHS DePIN turns physical solar panels into ERC-721 Real-World Assets. Operators register hardware, consumers pay in USDC, and revenue is distributed transparently on-chain.
          </p>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-3 text-zinc-400 mb-3">
              <Activity size={18} className="text-emerald-400" /> Network Status
            </div>
            <p className="text-3xl font-bold text-white">Active</p>
          </div>
          <div className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-3 text-zinc-400 mb-3">
              <Zap size={18} className="text-emerald-400" /> Pending Rewards
            </div>
            <p className="text-3xl font-bold text-white">{operatorBalance ? formatUnits(operatorBalance as bigint, 6) : '0.00'} <span className="text-lg text-emerald-400">USDC</span></p>
          </div>
          <div className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-3 text-zinc-400 mb-3">
              <Shield size={18} className="text-emerald-400" /> Account Role
            </div>
            <p className="text-3xl font-bold text-white">{isOwner ? 'Admin' : 'User'}</p>
          </div>
        </div>

        {/* Action Area (Pill Tabs) */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-4 border-b border-white/5">
            <div className="flex flex-wrap gap-2">
              {isOwner && (
                <button onClick={() => setActiveTab('admin')} className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === 'admin' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>Admin Setup</button>
              )}
              <button onClick={() => setActiveTab('operator')} className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === 'operator' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>Operator (Supply)</button>
              <button onClick={() => setActiveTab('consumer')} className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === 'consumer' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>Consumer (Demand)</button>
              <button onClick={() => setActiveTab('investor')} className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === 'investor' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>Investor (Yield)</button>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {/* Tab Content Here... */}
            {activeTab === 'admin' && isOwner && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Admin Controls</h2>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={handleMintAsset} disabled={isPending || isConfirming} className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 px-6 py-3 rounded-xl font-medium disabled:opacity-50 transition-all">1. Mint Asset NFT</button>
                    <button onClick={handleAllowlist} disabled={isPending || isConfirming} className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 px-6 py-3 rounded-xl font-medium disabled:opacity-50 transition-all">2. Allowlist Operator</button>
                  </div>
                </div>
                <div className="pt-8 border-t border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4">Simulate IoT Oracle</h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 flex-1 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="Device ID" />
                    <input type="number" placeholder="kWh" value={genAmount} onChange={(e) => setGenAmount(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 w-full md:w-32 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" />
                    <button onClick={handleSimulateOracle} disabled={isPending || isConfirming} className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-all">Push Data</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'operator' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row gap-4">
                  <input type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 flex-1 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="Device ID" />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 flex-1 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="Location" />
                  <input type="number" value={assetTokenId} onChange={(e) => setAssetTokenId(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 w-full md:w-24 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="NFT ID" />
                  <button onClick={handleRegister} disabled={isPending || isConfirming} className="bg-emerald-500 text-black font-semibold px-8 py-3 rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20">Register</button>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/5 mt-8 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Pending Rewards</h3>
                    <p className="text-sm text-zinc-400">Withdraw your USDC earnings.</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-3xl font-mono font-bold text-emerald-400">{operatorBalance ? formatUnits(operatorBalance as bigint, 6) : '0.00'} <span className="text-lg">USDC</span></span>
                    <button onClick={handleWithdraw} disabled={isPending || isConfirming || !operatorBalance || operatorBalance === BigInt(0)} className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-all">Withdraw</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'consumer' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row gap-4">
                  <input type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 flex-1 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="Device ID" />
                  <input type="number" placeholder="Amount (USDC)" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 w-full md:w-40 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" />
                  <button onClick={handleApprove} disabled={isPending || isConfirming} className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20">Approve</button>
                  <button onClick={handlePay} disabled={isPending || isConfirming} className="bg-emerald-500 text-black font-semibold px-8 py-3 rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20">Pay</button>
                </div>
              </div>
            )}

            {activeTab === 'investor' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Investor Portal</h2>
                  <p className="text-zinc-400 mb-6">Deposit USDC to buy shares of the solar farm. Earn 10% of all energy revenue.</p>
                  <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
                    <input type="number" placeholder="USDC to invest" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 w-full md:w-64 text-white focus:outline-none focus:border-blue-500/50 transition-colors" />
                    <button onClick={handleDeposit} disabled={isPending || isConfirming} className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 w-full md:w-auto">Deposit USDC</button>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/5 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Your Vault Shares</h3>
                    <p className="text-sm text-zinc-400">Your specific portion of the solar farm.</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-3xl font-mono font-bold text-blue-400">{investorShares ? formatUnits(investorShares as bigint, 6) : '0.00'} <span className="text-lg">Shares</span></span>
                    <button onClick={handleClaimYield} disabled={isPending || isConfirming || !investorShares || investorShares === BigInt(0)} className="bg-emerald-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20">Claim Yield</button>
                  </div>
                </div>

                <div className="mt-8 bg-black/40 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><ArrowUpRight size={18} className="text-blue-400" /> Projected Yield (7 Days)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockYieldData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="day" stroke="#a1a1aa" tick={{fill: '#a1a1aa'}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#a1a1aa" tick={{fill: '#a1a1aa'}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#3B82F6' }} />
                        <Line type="monotone" dataKey="yield" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 8, fill: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
