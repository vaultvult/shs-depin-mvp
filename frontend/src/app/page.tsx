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
import SolarVaultABI from '../abis/SolarVault.json';

// 🚨 NEW ADDRESSES 🚨
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

  useEffect(() => setMounted(true), []);

  const { login, logout, authenticated, user, ready } = usePrivy();
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  // Reads
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

  const { data: investorShares, refetch: refetchShares } = useReadContract({
    address: VAULT_ADDRESS,
    abi: SolarVaultABI.abi,
    functionName: 'shares',
    args: user?.wallet?.address ? [user.wallet.address] : undefined,
  });

  const isOwner = !!user?.wallet?.address && !!contractOwner && user.wallet.address.toLowerCase() === (contractOwner as string).toLowerCase();

  useEffect(() => {
    if (!isOwner && activeTab === 'admin') {
      setActiveTab('operator');
    }
  }, [isOwner, activeTab]);

  // Writes
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      refetchBalance();
      refetchShares();
    }
  }, [isSuccess, refetchBalance, refetchShares]);

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

  // Actions
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
    <main className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-emerald-500/30">
      
      {/* Network Guard */}
      {authenticated && chain?.id !== baseSepolia.id && (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-bold flex justify-center items-center gap-4">
          ⚠️ Wrong Network.
          <button onClick={() => switchChain({ chainId: baseSepolia.id })} className="bg-white text-red-600 px-3 py-1 rounded shadow hover:bg-gray-100">Switch to Base Sepolia</button>
        </div>
      )}

      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight text-emerald-400">⚡ SHS DePIN Network</h1>
          {authenticated ? (
            <div className="flex items-center gap-4">
              <button onClick={() => { navigator.clipboard.writeText(user?.wallet?.address || ""); toast.info("Address copied!"); }} className="text-sm font-mono text-emerald-400 hover:text-emerald-300 underline decoration-dotted">
                {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)} (Copy)
              </button>
              <button onClick={logout} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg">Log Out</button>
            </div>
          ) : (
            <button onClick={login} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg">Login</button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Tokenize Solar Energy. Earn Real Yield.</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            SHS DePIN turns physical solar panels into ERC-721 Real-World Assets. Operators register hardware, consumers pay in USDC, and revenue is distributed transparently on-chain.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Network Status</p>
            <p className="text-3xl font-bold text-white flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span> Live on Base</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Your Pending Rewards</p>
            <p className="text-3xl font-bold text-emerald-400">{operatorBalance ? formatUnits(operatorBalance as bigint, 6) : '0.00'} USDC</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Wallet Role</p>
            <p className="text-3xl font-bold text-white">{isOwner ? 'Admin 👑' : 'User ⚡'}</p>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-gray-800">
            {isOwner && (
              <button onClick={() => setActiveTab('admin')} className={`flex-1 py-4 font-medium ${activeTab === 'admin' ? 'bg-gray-800/50 text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}>1. Admin Setup</button>
            )}
            <button onClick={() => setActiveTab('operator')} className={`flex-1 py-4 font-medium ${activeTab === 'operator' ? 'bg-gray-800/50 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400'}`}>{isOwner ? '2.' : '1.'} Operator (Supply)</button>
            <button onClick={() => setActiveTab('consumer')} className={`flex-1 py-4 font-medium ${activeTab === 'consumer' ? 'bg-gray-800/50 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400'}`}>{isOwner ? '3.' : '2.'} Consumer (Demand)</button>
            <button onClick={() => setActiveTab('investor')} className={`flex-1 py-4 font-medium ${activeTab === 'investor' ? 'bg-gray-800/50 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>{isOwner ? '4.' : '3.'} Investor (Yield)</button>
          </div>

          <div className="p-8">
            {activeTab === 'admin' && isOwner && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-2 text-red-400">Admin Setup</h2>
                <div className="flex gap-4">
                  <button onClick={handleMintAsset} disabled={isPending || isConfirming} className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-50">1. Mint Asset NFT</button>
                  <button onClick={handleAllowlist} disabled={isPending || isConfirming} className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-50">2. Allowlist Operator</button>
                </div>
                <hr className="border-gray-800" />
                <div className="flex gap-4">
                  <input type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1" />
                  <input type="number" placeholder="kWh" value={genAmount} onChange={(e) => setGenAmount(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 w-32" />
                  <button onClick={handleSimulateOracle} disabled={isPending || isConfirming} className="bg-white text-black font-semibold px-6 py-2 rounded-lg disabled:opacity-50">Push Data</button>
                </div>
              </div>
            )}

            {activeTab === 'operator' && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <input type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1" />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1" />
                  <input type="number" value={assetTokenId} onChange={(e) => setAssetTokenId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 w-24" />
                  <button onClick={handleRegister} disabled={isPending || isConfirming} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg disabled:opacity-50">Register</button>
                </div>
                <div className="flex justify-between items-center bg-gray-950 p-4 rounded-lg border border-gray-800">
                  <h3 className="text-lg font-bold text-white">Pending Rewards</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-mono font-bold text-emerald-400">{operatorBalance ? formatUnits(operatorBalance as bigint, 6) : '0.00'} USDC</span>
                    <button onClick={handleWithdraw} disabled={isPending || isConfirming || !operatorBalance || operatorBalance === BigInt(0)} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg disabled:opacity-50">Withdraw</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'consumer' && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <input type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 flex-1" />
                  <input type="number" placeholder="Amount (USDC)" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 w-32" />
                  <button onClick={handleApprove} disabled={isPending || isConfirming} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-50">Approve</button>
                  <button onClick={handlePay} disabled={isPending || isConfirming} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg disabled:opacity-50">Pay</button>
                </div>
              </div>
            )}

            {activeTab === 'investor' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-blue-400">Investor Portal (Yield)</h2>
                  <p className="text-gray-400 mb-4">Deposit USDC to buy shares of the solar farm. Earn 10% of all energy revenue.</p>
                  <div className="flex gap-4 items-center mb-6">
                    <input type="number" placeholder="USDC to invest" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 w-48" />
                    <button onClick={handleDeposit} disabled={isPending || isConfirming} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-50">Deposit USDC</button>
                  </div>
                </div>
                <hr className="border-gray-800" />
                <div className="flex justify-between items-center bg-gray-950 p-4 rounded-lg border border-gray-800">
                  <div>
                    <h3 className="text-lg font-bold text-white">Your Vault Shares</h3>
                    <p className="text-sm text-gray-400">Your "Specific Portion" of the solar farm.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-mono font-bold text-blue-400">{investorShares ? formatUnits(investorShares as bigint, 6) : '0.00'} Shares</span>
                    <button onClick={handleClaimYield} disabled={isPending || isConfirming || !investorShares || investorShares === BigInt(0)} className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg disabled:opacity-50">Claim Yield</button>
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
