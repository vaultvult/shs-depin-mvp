# Emmanuel Williams
**Web3 Developer & Smart Contract Security Researcher**

📍 Nigeria | 🐦 [@tradarsoy](https://twitter.com/tradarsoy) | 💻 [github.com/vaultvult](https://github.com/vaultvult) | ✍️ [dev.to/vaultvult](https://dev.to/vaultvult)

---

## PROFESSIONAL SUMMARY
Multi-chain Web3 Developer and Security Researcher specializing in Real-World Asset (RWA) tokenization, DePIN architectures, and smart contract security. Experienced in building end-to-end decentralized applications on EVM chains (Base, Ethereum) using Foundry, Next.js, and Wagmi. Proven track record of implementing secure financial vaults, integrating Account Abstraction (Privy), and securing smart contracts against reentrancy attacks. Finalist in the W3Node Global Hackathon (Top 4 out of 7 in the Real-World Assets track).

---

## FEATURED PROJECTS

### ⚡ SHS DePIN Network | *Founder & Lead Developer*
*Built for the W3Node Hackathon - Finalist (4th Place)*
*   **Project Overview:** Architected a decentralized physical infrastructure network (DePIN) that tokenizes physical solar panels in Africa into fractional Real-World Assets (RWAs).
*   **Smart Contract Architecture:** Developed a robust suite of Solidity contracts using Foundry and deployed them to Base Sepolia. Implemented ERC-721 Asset Tokenization, an Operator Allowlist, and a Device Freeze function.
*   **Fractional Yield Vault:** Engineered a custom `SolarVault` smart contract that automatically splits consumer energy payments (90% to the hardware operator, 10% to the investor yield vault), allowing fractional RWA investors to claim proportional yield.
*   **Web2 Onboarding (UX):** Integrated **Privy** for invisible wallet creation. Rural consumers can log in via email and pay for solar energy using USDC without ever needing MetaMask.
*   **Security Optimization:** Identified and resolved a critical reentrancy vulnerability in the payment loop by strictly applying the Checks-Effects-Interactions pattern.
*   **Role-Based Access Control:** Implemented strict frontend and on-chain RBAC, ensuring admin dashboards and oracle functions are restricted to the contract owner.
*   **Links:** [Live App](https://shs-depin-mvp.vercel.app) | [GitHub Repo](https://github.com/vaultvult/shs-depin-mvp)

### 🛡️ Multi-Chain Security Research & Auditing
*   **Solana Rust Exploits:** Developed PoC exploits for an integer underflow (DoS) in `buy_exact_sol_in` and missing access control vulnerabilities.
*   **TS EVM Recon Bot:** Built an automated TypeScript reconnaissance script to analyze live EVM contracts for dangerous configurations (e.g., paused states, ownership).
*   **Move Secure Vault:** Developed a capability-based asset vault on Aptos/Sui utilizing `OwnerCapability` resources and phantom types.
*   **Cairo Access Control:** Built a role-based access control system on StarkNet with strict admin gating.
*   **Vyper Secure Escrow:** Gas-optimized, reentrancy-safe escrow contract leveraging Vyper's built-in `@nonreentrant` guard.

### 🤖 AI & Infrastructure
*   **Sentinel AI:** Built an AI-agent-based automated trading system (Python) that performs real-time smart contract vulnerability scans before executing DeFi trades.
*   **Rencfs:** Developed a modular, encrypted file system in Rust utilizing FUSE and audited AEAD cryptography primitives. Featured as Crate of the Week in *This Week in Rust*.

---

## CORE TECHNICAL SKILLS
*   **Languages:** Solidity, Vyper, Rust, Move, Cairo, TypeScript, Python, Go
*   **Frameworks & Tools:** Foundry, Hardhat, Next.js, Wagmi, Viem, React
*   **Web3 Infrastructure:** Privy (Account Abstraction), Oracle Simulation, ERC-20, ERC-721, ERC-4626 (Vaults)
*   **Security:** Reentrancy Prevention (CEI), Access Control, Merkle Proofs, Static Analysis
