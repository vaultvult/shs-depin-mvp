// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/EnergyMarket.sol";

contract DeploySHS is Script {
    function run() external {
        // Read the private key from your environment variable
        
        vm.startBroadcast();

        // Deploy Mock USDC
        MockUSDC usdc = new MockUSDC();
        
        // Deploy the Energy Market using the USDC address
        EnergyMarket market = new EnergyMarket(address(usdc));

        vm.stopBroadcast();

        // Log the addresses so we can use them in the frontend
        console.log("MockUSDC deployed at:", address(usdc));
        console.log("EnergyMarket deployed at:", address(market));
    }
}
