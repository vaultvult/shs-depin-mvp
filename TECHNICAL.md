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
