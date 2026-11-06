'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useSwitchChain } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import EnergyMarketABI from '../abis/EnergyMarket.json';
import MockUSDCABI from '../abis/MockUSDC.json';
import SolarAssetABI from '../abis/SolarAsset.json';

const MARKET_ADDRESS = '0x686bb8E39920E19d5e028363e872b1C979426e73';
const USDC_ADDRESS = '0x890e52B20C0845bde17cb0E30Ea715d3c2610C0f';
const ASSET_ADDRESS = '0xDc568e95b763e226A56872E0887d4dc04608Dd89';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'operator' | 'consumer' | 'admin'>('admin');
  const [deviceId, setDeviceId] = useState('SHS-LAGOS-001');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [assetTokenId, setAssetTokenId] = useState('0');
  const [payAmount, setPayAmount] = useState('');
  const [genAmount, setGenAmount] = useState('');

  useEffect(() => setMounted(true), []);

  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract } = useWriteContract();
  const { switchChain } = useSwitchChain();

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

  const handleMintAsset = () => {
    if (!ensureCorrectNetwork()) return;
    writeContract({
      address: ASSET_ADDRESS,
      abi: SolarAssetABI.abi,
      functionName: 'mintAsset',
      args: [address, "ipfs://QmMockDocumentHashForLegalDeed"],
    });
  };

  const handleAllowlist = () => {
    if (!ensureCorrectNetwork()) return;
    writeContract({
      address: MARKET_ADDRESS,
      abi: EnergyMarketABI.abi,
      functionName: 'setAllowlist',
      args: [address, true],
    });
  };

  const handleRegister = () => {
    if (!ensureCorrectNetwork()) return;
    writeContract({
      address: MARKET_ADDRESS,
      abi: EnergyMarketABI.abi,
      functionName: 'registerDevice',
      args: [deviceId, location, BigInt(assetTokenId)],
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
    writeContract({
      address: MARKET_ADDRESS,
      abi: EnergyMarketABI.abi,
      functionName: 'purchaseEnergy',
      args: [deviceId, parseUnits(payAmount, 6)],
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
    writeContract({
      address: MARKET_ADDRESS,
      abi: EnergyMarketABI.abi,
      functionName: 'submitProofOfGeneration',
      args: [deviceId, BigInt(genAmount)],
    });
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-emerald-500/30">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight text-emerald-400">⚡ SHS DePIN Network</h1>
          {isConnected ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono text-emerald-400">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              <button onClick={() => disconnect()} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg">Disconnect</button>
            </div>
          ) : (
            <button onClick={() => connect({ connector: connectors[0] })} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg">Connect Wallet</button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-gray-800">
            <button onClick={() => setActiveTab('admin')} className={`flex-1 py-4 font-medium ${activeTab === 'admin' ? 'bg-gray-800/50 text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}>1. Admin Setup (Oracle)</button>
            <button onClick={() => setActiveTab('operator')} className={`flex-1 py-4 font-medium ${activeTab === 'operator' ? 'bg-gray-800/50 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400'}`}>2. Operator (Supply)</button>
            <button onClick={() => setActiveTab('consumer')} className={`flex-1 py-4 font-medium ${activeTab === 'consumer' ? 'bg-gray-800/50 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400'}`}>3. Consumer (Demand)</button>
          </div>

          <div className="p-8">
            {activeTab === 'admin' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-red-400">Admin Setup (RWA Compliance)</h2>
                  <p className="text-gray-400 mb-4">Mint the Asset NFT and Allowlist the operator before they can register.</p>
                  <div className="flex gap-4">
                    <button onClick={handleMintAsset} className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-500">1. Mint Asset NFT</button>
                    <button onClick={handleAllowlist} className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-500">2. Allowlist Operator</button>
                  </div>
                </div>
                <hr className="border-gray-800" />
                <div>
                  <h3 className="text-lg font-bold mb-4">Simulate IoT Oracle Data</h3>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Device ID" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1" />
                    <input type="number" placeholder="kWh" value={genAmount} onChange={(e) => setGenAmount(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 w-32" />
                    <button onClick={handleSimulateOracle} className="bg-white text-black font-semibold px-6 py-2 rounded-lg">Push Data</button>
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
                    <button onClick={handleRegister} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg">Register</button>
                  </div>
                </div>
                <hr className="border-gray-800" />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">Pending Rewards</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-mono font-bold text-emerald-400">{operatorBalance ? formatUnits(operatorBalance as bigint, 6) : '0.00'} USDC</span>
                    <button onClick={handleWithdraw} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg">Withdraw</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'consumer' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Purchase Energy</h2>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Device ID" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1" />
                    <input type="number" placeholder="Amount (USDC)" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 w-32" />
                    <button onClick={handleApprove} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg">Approve</button>
                    <button onClick={handlePay} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg">Pay</button>
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
