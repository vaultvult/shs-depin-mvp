'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract, useWriteContract, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { toast } from 'sonner';
import EnergyMarketABI from '../abis/EnergyMarket.json';
import MockUSDCABI from '../abis/MockUSDC.json';
import SolarAssetABI from '../abis/SolarAsset.json';

const MARKET_ADDRESS = '0x686bb8E39920E19d5e028363e872b1C979426e73';
const USDC_ADDRESS = '0x890e52B20C0845bde17cb0E30Ea715d3c2610C0f';
const ASSET_ADDRESS = '0xDc568e95b763e226A56872E0887d4dc04608Dd89';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'operator' | 'consumer' | 'admin'>('operator');
  const [deviceId, setDeviceId] = useState('SHS-LAGOS-001');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [assetTokenId, setAssetTokenId] = useState('0');
  const [payAmount, setPayAmount] = useState('');
  const [genAmount, setGenAmount] = useState('');

  useEffect(() => setMounted(true), []);

  // Added 'ready' from Privy to prevent crashes during initialization
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  // Contract Reads
  const { data: operatorBalance, refetch: refetchBalance } = useReadContract({
    address: MARKET_ADDRESS,
    abi: EnergyMarketABI.abi,
    functionName: 'operatorBalances',
    args: user?.wallet?.address ? [user.wallet.address] : undefined,
  });

  const { data: contractOwner } = useReadContract({
    address: MARKET_ADDRESS,
    abi: EnergyMarketABI.abi,
    functionName: 'owner',
  });

  // Strict boolean check for isOwner
  const isOwner = !!user?.wallet?.address && !!contractOwner && user.wallet.address.toLowerCase() === (contractOwner as string).toLowerCase();
  console.log("DEBUG:", { privyAddress: user?.wallet?.address, wagmiAddress: address, contractOwner, isOwner });
  useEffect(() => {
    if (!isOwner && activeTab === "admin") {
      setActiveTab("operator");
    }
  }, [isOwner, activeTab]);

  // Contract Writes with Toasts
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      refetchBalance();
    }
  }, [isSuccess, refetchBalance]);

  const handleTx = async (contractCall: any, successMsg: string) => {
    try {
      const promise = writeContractAsync(contractCall);
      toast.promise(promise, {
        loading: 'Waiting for wallet approval...',
        success: () => successMsg,
        error: (err) => `Error: ${err.shortMessage || err.message}`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMintAsset = () => handleTx({
    address: ASSET_ADDRESS, abi: SolarAssetABI.abi, functionName: 'mintAsset', args: [user?.wallet?.address, "ipfs://QmMockDocumentHashForLegalDeed"],
  }, "Asset NFT Minted successfully!");

  const handleAllowlist = () => handleTx({
    address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'setAllowlist', args: [user?.wallet?.address, true],
  }, "Operator added to Allowlist!");

  const handleRegister = () => handleTx({
    address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'registerDevice', args: [deviceId, location, BigInt(assetTokenId)],
  }, "Solar Asset Registered!");

  const handleApprove = () => handleTx({
    address: USDC_ADDRESS, abi: MockUSDCABI.abi, functionName: 'approve', args: [MARKET_ADDRESS, parseUnits('100', 6)],
  }, "USDC Approved for spending!");

  const handlePay = () => handleTx({
    address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'purchaseEnergy', args: [deviceId, parseUnits(payAmount, 6)],
  }, "Energy Purchased Successfully!");

  const handleWithdraw = () => handleTx({
    address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'withdrawRewards',
  }, "Rewards Withdrawn to Wallet!");

  const handleSimulateOracle = () => handleTx({
    address: MARKET_ADDRESS, abi: EnergyMarketABI.abi, functionName: 'submitProofOfGeneration', args: [deviceId, BigInt(genAmount)],
  }, "IoT Oracle Data Pushed On-Chain!");

  // Wait for both Next.js to mount AND Privy to be ready
  if (!mounted || !ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-emerald-500/30">
      
      {/* 🚨 Network Guard Banner */}
      {authenticated && chain?.id !== baseSepolia.id && (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-bold flex justify-center items-center gap-4">
          ⚠️ You are on the wrong network. Please switch to Base Sepolia to interact.
          <button onClick={() => switchChain({ chainId: baseSepolia.id })} className="bg-white text-red-600 px-3 py-1 rounded shadow hover:bg-gray-100">
            Switch Network
          </button>
        </div>
      )}

      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight text-emerald-400">⚡ SHS DePIN Network</h1>
          
          {authenticated ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user?.wallet?.address || "");
                  toast.info("Address copied to clipboard!");
                }} 
                className="text-sm font-mono text-emerald-400 hover:text-emerald-300 underline decoration-dotted cursor-pointer"
                title="Click to copy full address"
              >
                {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)} (Copy)
              </button>
              <button onClick={logout} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                Log Out
              </button>
            </div>
          ) : (
            <button onClick={login} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
              Login
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* 📊 Dynamic Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Network Status</p>
            <p className="text-3xl font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span> Live on Base
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Your Pending Rewards</p>
            <p className="text-3xl font-bold text-emerald-400">
              {operatorBalance ? formatUnits(operatorBalance as bigint, 6) : '0.00'} USDC
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Wallet Role</p>
            <p className="text-3xl font-bold text-white">
              {isOwner ? 'Admin 👑' : 'Operator ⚡'}
            </p>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-gray-800">
            {isOwner && (
              <button onClick={() => setActiveTab('admin')} className={`flex-1 py-4 font-medium transition-colors ${activeTab === 'admin' ? 'bg-gray-800/50 text-red-400 border-b-2 border-red-400' : 'text-gray-400 hover:text-gray-200'}`}>
                1. Admin Setup
              </button>
            )}
            <button onClick={() => setActiveTab('operator')} className={`flex-1 py-4 font-medium transition-colors ${activeTab === 'operator' ? 'bg-gray-800/50 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'}`}>
              {isOwner ? '2.' : '1.'} Operator (Supply)
            </button>
            <button onClick={() => setActiveTab('consumer')} className={`flex-1 py-4 font-medium transition-colors ${activeTab === 'consumer' ? 'bg-gray-800/50 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'}`}>
              {isOwner ? '3.' : '2.'} Consumer (Demand)
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'admin' && isOwner && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-red-400">Admin Setup (RWA Compliance)</h2>
                  <p className="text-gray-400 mb-4">Mint the Asset NFT and Allowlist the operator before they can register.</p>
                  <div className="flex gap-4">
                    <button onClick={handleMintAsset} disabled={isPending || isConfirming} className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-500 disabled:opacity-50">1. Mint Asset NFT</button>
                    <button onClick={handleAllowlist} disabled={isPending || isConfirming} className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-500 disabled:opacity-50">2. Allowlist Operator</button>
                  </div>
                </div>
                <hr className="border-gray-800" />
                <div>
                  <h3 className="text-lg font-bold mb-4">Simulate IoT Oracle Data</h3>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Device ID" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1" />
                    <input type="number" placeholder="kWh" value={genAmount} onChange={(e) => setGenAmount(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 w-32" />
                    <button onClick={handleSimulateOracle} disabled={isPending || isConfirming} className="bg-white text-black font-semibold px-6 py-2 rounded-lg disabled:opacity-50">Push Data</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'operator' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Register Solar Asset</h2>
                  <p className="text-gray-400 mb-4">Enter your Device ID and the NFT Token ID you own.</p>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Device ID" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1" />
                    <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1" />
                    <input type="number" placeholder="NFT ID" value={assetTokenId} onChange={(e) => setAssetTokenId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 w-24" />
                    <button onClick={handleRegister} disabled={isPending || isConfirming} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg disabled:opacity-50">Register</button>
                  </div>
                </div>
                <hr className="border-gray-800" />
                <div className="flex justify-between items-center bg-gray-950 p-4 rounded-lg border border-gray-800">
                  <div>
                    <h3 className="text-lg font-bold text-white">Pending Rewards</h3>
                    <p className="text-sm text-gray-400">Withdraw your USDC earnings.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-mono font-bold text-emerald-400">
                      {operatorBalance ? formatUnits(operatorBalance as bigint, 6) : '0.00'} USDC
                    </span>
                    <button onClick={handleWithdraw} disabled={isPending || isConfirming || !operatorBalance || operatorBalance === BigInt(0)} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg disabled:opacity-50">Withdraw</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'consumer' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Purchase Energy</h2>
                  <p className="text-gray-400 mb-4">Pay for energy using USDC.</p>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Device ID" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1" />
                    <input type="number" placeholder="Amount (USDC)" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 w-32" />
                    <button onClick={handleApprove} disabled={isPending || isConfirming} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-500 disabled:opacity-50">Approve</button>
                    <button onClick={handlePay} disabled={isPending || isConfirming} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-emerald-400 disabled:opacity-50">Pay</button>
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
