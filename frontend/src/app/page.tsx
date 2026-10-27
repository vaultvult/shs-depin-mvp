'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useSwitchChain } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import EnergyMarketABI from '../abis/EnergyMarket.json';
import MockUSDCABI from '../abis/MockUSDC.json';

const MARKET_ADDRESS = '0x6309C657B4fc06B39Ac9Bcb040156898A4F23629';
const USDC_ADDRESS = '0xb4FD99d390683DFA2eAE95EbcdDDAa6CF786edc7';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'operator' | 'consumer' | 'admin'>('operator');
  const [deviceId, setDeviceId] = useState('');
  const [location, setLocation] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [genAmount, setGenAmount] = useState('');

  // 1. Fix the hydration error
  useEffect(() => {
    setMounted(true);
  }, []);

  // Wallet connection
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract } = useWriteContract();
  const { switchChain } = useSwitchChain();

  // Read Operator Balance
  const { data: operatorBalance } = useReadContract({
    address: MARKET_ADDRESS,
    abi: EnergyMarketABI.abi,
    functionName: 'operatorBalances',
    args: address ? [address] : undefined,
  });

  const ensureCorrectNetwork = () => {
    if (chain?.id !== baseSepolia.id) {
      alert("⚠️ Wrong Network! Switching to Base Sepolia...");
      switchChain({ chainId: baseSepolia.id });
      return false;
    }
    return true;
  };

  const handleRegister = () => {
    if (!ensureCorrectNetwork()) return;
    if (!deviceId || !location) return alert('Please fill out all fields');
    writeContract({
      address: MARKET_ADDRESS,
      abi: EnergyMarketABI.abi,
      functionName: 'registerDevice',
      args: [deviceId, location],
    });
  };

  const handleApprove = () => {
    if (!ensureCorrectNetwork()) return;
    writeContract({
      address: USDC_ADDRESS,
      abi: MockUSDCABI.abi,
      functionName: 'approve',
      args: [MARKET_ADDRESS, parseUnits('100', 6)],
    });
  };

  const handlePay = () => {
    if (!ensureCorrectNetwork()) return;
    if (!deviceId || !payAmount) return alert('Please fill out all fields');
    const amount = parseUnits(payAmount, 6);
    writeContract({
      address: MARKET_ADDRESS,
      abi: EnergyMarketABI.abi,
      functionName: 'purchaseEnergy',
      args: [deviceId, amount],
    });
  };

  const handleWithdraw = () => {
    if (!ensureCorrectNetwork()) return;
    writeContract({
      address: MARKET_ADDRESS,
      abi: EnergyMarketABI.abi,
      functionName: 'withdrawRewards',
    });
  };

  const handleSimulateOracle = () => {
    if (!ensureCorrectNetwork()) return;
    if (!deviceId || !genAmount) return alert('Please fill out all fields');
    writeContract({
      address: MARKET_ADDRESS,
      abi: EnergyMarketABI.abi,
      functionName: 'submitProofOfGeneration',
      args: [deviceId, BigInt(genAmount)],
    });
  };

  // Prevent rendering the wallet UI until the browser is ready
  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-black">
              ⚡
            </div>
            <h1 className="text-xl font-semibold tracking-tight">SHS DePIN Network</h1>
          </div>
          
          {isConnected ? (
            <div className="flex items-center gap-4">
              {chain?.id !== baseSepolia.id ? (
                <button 
                  onClick={() => switchChain({ chainId: baseSepolia.id })} 
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg animate-pulse"
                >
                  ⚠️ Switch to Base Sepolia
                </button>
              ) : (
                <span className="text-sm font-mono text-emerald-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              )}
              <button onClick={() => disconnect()} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={() => connect({ connector: connectors[0] })}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main Content (Rest of the UI remains exactly the same) */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Total Energy Generated</p>
            <p className="text-3xl font-bold text-white">1,420 <span className="text-lg text-emerald-500">kWh</span></p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Active Devices</p>
            <p className="text-3xl font-bold text-white">42 <span className="text-lg text-emerald-500">Nodes</span></p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Total Rewards Distributed</p>
            <p className="text-3xl font-bold text-white">$8,500 <span className="text-lg text-emerald-500">USDC</span></p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-gray-800">
            <button onClick={() => setActiveTab('operator')} className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'operator' ? 'bg-gray-800/50 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'}`}>
              Operator (Supply)
            </button>
            <button onClick={() => setActiveTab('consumer')} className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'consumer' ? 'bg-gray-800/50 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'}`}>
              Consumer (Demand)
            </button>
            <button onClick={() => setActiveTab('admin')} className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'admin' ? 'bg-gray-800/50 text-red-400 border-b-2 border-red-400' : 'text-gray-400 hover:text-gray-200'}`}>
              Oracle Simulator (Admin)
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'operator' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Register Your Solar System</h2>
                  <p className="text-gray-400 mb-4">Add your physical hardware to the network to start earning USDC.</p>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Device ID (e.g., SHS-LAGOS-001)" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-emerald-500" />
                    <input type="text" placeholder="Location (e.g., Lagos, Nigeria)" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-emerald-500" />
                    <button onClick={handleRegister} className="bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">Register</button>
                  </div>
                </div>
                <hr className="border-gray-800" />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">Pending Rewards</h3>
                    <p className="text-gray-400">Your unclaimed USDC balance.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-mono font-bold text-emerald-400">
                      {operatorBalance ? formatUnits(operatorBalance as bigint, 6) : '0.00'} USDC
                    </span>
                    <button onClick={handleWithdraw} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-emerald-400 transition-colors">Withdraw</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'consumer' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Purchase Energy</h2>
                  <p className="text-gray-400 mb-4">Pay for reliable solar energy using USDC.</p>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Device ID to pay (e.g., SHS-LAGOS-001)" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-emerald-500" />
                    <input type="number" placeholder="Amount (USDC)" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-emerald-500" />
                    <button onClick={handleApprove} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors">Approve</button>
                    <button onClick={handlePay} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-emerald-400 transition-colors">Pay Now</button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* You must click Approve once before you can Pay.</p>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-red-400">Simulate IoT Oracle</h2>
                  <p className="text-gray-400 mb-4">Inject simulated solar generation data on-chain. (Only the contract owner can do this).</p>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Device ID (e.g., SHS-LAGOS-001)" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-red-500" />
                    <input type="number" placeholder="kWh Generated" value={genAmount} onChange={(e) => setGenAmount(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-red-500" />
                    <button onClick={handleSimulateOracle} className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-500 transition-colors">Push Data</button>
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
