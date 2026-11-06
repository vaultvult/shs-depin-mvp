
## 5. Real-World Asset (RWA) Implementation (VC Criteria)
To meet the strict RWA requirements for the hackathon, the protocol was upgraded with:
*   **Asset Tokenization:** An `ERC-721` smart contract (`SolarAsset.sol`) was created to represent ownership of the physical solar panel, linked to a legal document hash.
*   **On-Chain Rules:** The `EnergyMarket` now enforces an `Allowlist` (only verified operators can register devices) and a `Freeze` function (admin can halt payments if hardware breaks).
*   **New Deployments (Base Sepolia):**
    *   MockUSDC: `0x890e52B20C0845bde17cb0E30Ea715d3c2610C0f`
    *   SolarAsset: `0xDc568e95b763e226A56872E0887d4dc04608Dd89`
    *   EnergyMarket: `0x686bb8E39920E19d5e028363e872b1C979426e73`
