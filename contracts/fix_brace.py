with open('src/EnergyMarket.sol', 'r') as f:
    code = f.read()

# Replace the broken block with the correct block
broken = """        if (investorSplit > 0) {
            require(paymentToken.transfer(yieldVault, investorSplit), "Vault transfer failed");
        }
        
        }

        emit PaymentReceived"""
fixed = """        if (investorSplit > 0) {
            require(paymentToken.transfer(yieldVault, investorSplit), "Vault transfer failed");
        }

        emit PaymentReceived"""

code = code.replace(broken, fixed)

with open('src/EnergyMarket.sol', 'w') as f:
    f.write(code)
print("✅ Solidity file fixed successfully!")
