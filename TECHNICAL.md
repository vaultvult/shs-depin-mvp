# SHS DePIN Network - Technical Foundation Evidence

**Project Repository:** [https://github.com/vaultvult/shs-depin-mvp](https://github.com/vaultvult/shs-depin-mvp)
**Demo Video:** [https://youtu.be/xfYc27v8Qho](https://youtu.be/xfYc27v8Qho)

### Live Smart Contracts (Base Sepolia)
*   **EnergyMarket:** `0x6309C657B4fc06B39Ac9Bcb040156898A4F23629`
*   **MockUSDC:** `0xb4FD99d390683DFA2eAE95EbcdDDAa6CF786edc7`

## 1. Smart Contract Architecture (Solidity & Foundry)
The protocol is built using two core contracts:
*   `MockUSDC.sol`: A standard ERC-20 token acting as the stablecoin for energy payments.
*   `EnergyMarket.sol`: The core engine handling device registration (`registerDevice`), consumer payments (`purchaseEnergy`), and operator withdrawals (`withdrawRewards`).

## 2. Security & The Reentrancy Fix
During the audit phase using Foundry, a critical reentrancy vulnerability was identified in the `purchaseEnergy` function. The original code made an external `transferFrom` call before updating the state variables, which could allow a malicious contract to drain funds.

**The Fix:** The contract was refactored to strictly follow the **Checks-Effects-Interactions (CEI)** pattern. State variables (`totalRewardsEarned` and `operatorBalances`) are now updated *before* the external USDC transfer is executed, completely eliminating the attack vector.

```solidity
// 1. EFFECTS: Update state first
device.totalRewardsEarned += _amount;
operatorBalances[device.operator] += _amount;

// 2. INTERACTIONS: External call last
require(paymentToken.transferFrom(msg.sender, address(this), _amount), "Payment failed");

## 5. Real-World Asset (RWA) Implementation (VC Criteria)
To meet the strict RWA requirements for the hackathon, the protocol was upgraded with:
*   **Asset Tokenization:** An `ERC-721` smart contract (`SolarAsset.sol`) was created to represent ownership of the physical solar panel, linked to a legal document hash.
*   **On-Chain Rules:** The `EnergyMarket` now enforces an `Allowlist` (only verified operators can register devices) and a `Freeze` function (admin can halt payments if hardware breaks).
*   **New Deployments (Base Sepolia):**
    *   MockUSDC: `0x19016bE9467eaF2A394000999c46F4cD032b87a9`
    *   SolarAsset: `0x25b8130ee2e521C71e578371442135C3C22b832b`
    *   EnergyMarket: `0xdE2c2d46F22f5a11a127D8EfC5b13c2164dd78e7`
