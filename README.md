
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
    
    subgraph Base Sepolia Testnet
    B
    end
