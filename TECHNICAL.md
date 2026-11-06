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
    *   MockUSDC: `0x890e52B20C0845bde17cb0E30Ea715d3c2610C0f`
    *   SolarAsset: `0xDc568e95b763e226A56872E0887d4dc04608Dd89`
    *   EnergyMarket: `0x686bb8E39920E19d5e028363e872b1C979426e73`
