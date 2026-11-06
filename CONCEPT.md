# SHS DePIN Network - Project Concept

**Track:** Real-World Assets (RWA)

## 1. The Problem (African Market Context)
Africa is facing a massive energy crisis. According to the World Bank, the continent needs over **46,000 new mini-grids by 2030** to connect underserved populations. While the hardware (solar panels) is readily available, the financial rails to manage, verify, and monetize this distributed infrastructure do not exist. Traditional banks cannot handle the high-frequency, micro-payments required for off-grid energy distribution, leaving operators without liquidity and consumers without reliable power.

## 2. The Solution (SHS DePIN Network)
SHS DePIN is a decentralized physical infrastructure network built on Base. It provides a transparent, machine-to-machine (M2M) economy for solar energy.
*   **Operators** can register their physical solar hardware on-chain.
*   **Consumers** pay for energy using stablecoins (USDC).
*   **IoT Oracles** inject proof-of-generation data on-chain to verify delivery.

## 3. Commercial Viability & Business Model
*   **Target Market:** Mini-grid operators in Sub-Saharan Africa (starting with Nigeria).
*   **Revenue Model:** The protocol will take a **1.5% transaction fee** on every USDC energy payment processed through the smart contract.
*   **Go-to-Market Strategy:** Partner with local solar hardware distributors who already have the physical infrastructure but lack the software rails to accept crypto-native payments or tokenize their assets.

## 4. Product Design & User Experience
The frontend is designed with a Web2-like UX to reduce friction for non-crypto-native operators. It features auto-network switching, clear dashboard metrics (Total Energy Generated, Active Devices), and a seamless MetaMask integration for instant withdrawals.

## 5. Addressing the Real-World Asset Challenge
*   **Asset Tokenization:** We represent each solar infrastructure unit as a unique digital claim on the `EnergyMarket` contract.
*   **On-Chain Rules:** The contract enforces an `onlyOwner` allowlist for device registration, preventing unauthorized hardware from joining the network.
*   **Evidence of Backing:** The IoT Oracle (`submitProofOfGeneration`) provides cryptographic attestation that the asset is producing the energy it claims.
*   **Path Back to Cash:** Operators receive USDC, which can be seamlessly swapped to local fiat or mobile money (e.g., M-Pesa, Paystack) via our planned liquidity partners.
*   **Regulatory Compliance:** Our target market (Nigeria) is regulated by the **NERC** (Nigerian Electricity Regulatory Commission). By using USDC and KYC'd operators, we align with local financial and energy regulations.
