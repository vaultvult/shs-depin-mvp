# SHS DePIN Network

**🔗 Live Deployment:** [https://shs-depin-mvp.vercel.app](https://shs-depin-mvp.vercel.app)

A decentralized physical infrastructure network (DePIN) MVP built for the W3Node Hackathon. This protocol enables peer-to-peer energy trading and incentivization for Solar Home Systems (SHS) in Africa.

> **⚠️ Note for Judges:** The YouTube demo video shows the V1 flow. This repository contains the fully upgraded **V2 RWA-Compliant** architecture, which includes ERC-721 Asset Tokenization, an Operator Allowlist, a Device Freeze function, and **Privy integration for invisible wallets**.

## 💡 How It Works (The Physical Implementation)
To understand SHS DePIN, picture a rural home in Nigeria with a **Solar Home System (SHS)** on the roof—a solar panel, a battery, and a smart meter inside the house. 

The **Operator** is the company that paid for the solar panel. The **Consumer** is the family living in the house. Because the family cannot afford the $500 upfront cost, they use a Pay-As-You-Go model facilitated by our protocol:

1. The family logs into our app (using email via Privy) and pays **5 USDC** for 10 kWh of electricity.
2. The smart contract instantly routes that USDC to the Operator's wallet.
3. The IoT smart meter (simulated by our Oracle button in the MVP) detects the payment on-chain and unlocks the electricity flow to the house.
4. **The RWA Angle:** Investors can fund the Operator's solar panels. As the family pays for their daily energy, the USDC micro-payments generate a transparent, real-world yield for the investors.

## 🔐 Seamless Onboarding (Privy Integration)
To meet the "Product Design" criteria and ensure mass adoption in Africa, we integrated Privy for Web2-friendly onboarding.
* **Crypto-Native Users:** Can seamlessly connect MetaMask or Coinbase Wallet.
* **Web2 Users:** Can sign up with just an email address. Privy automatically creates a secure, invisible embedded wallet in the background.

**Login Modal:**
![Privy Login](screenshot4.png)

**Logged In (Invisible Wallet Created):**
![Privy Logged In](screenshot5.png)

## 📸 Application UI (V2 RWA Flow)
**1. Admin Setup (Asset Tokenization & Allowlist)**
![Admin Setup](screenshot1.png)

**2. Operator Registration (NFT Verification)**
![Operator Setup](screenshot2.png)

**3. Consumer Payment (Stablecoin Demand)**
![Consumer Setup](screenshot3.png)

## 📚 Documentation
* [Project Concept & Business Model](CONCEPT.md)
* [Technical Architecture & Security Evidence](TECHNICAL.md)

## 🏗️ Architecture Diagram

```mermaid
graph TD
    A[Consumer] -->|Pays USDC| B(EnergyMarket Smart Contract)
    C[Solar Panel Hardware] -->|Generates Data| D{IoT Oracle Simulator}
    D -->|Submit Proof of Generation| B
    B -->|Splits Rewards| E[Operator Wallet]
    E -->|Withdraw| F[External Cash/Mobile Money]
    
    subgraph BaseSepolia [Base Sepolia Testnet]
    B
    end
