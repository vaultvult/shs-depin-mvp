// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/SolarAsset.sol";
import "../src/SolarVault.sol";
import "../src/EnergyMarket.sol";

contract DeploySHS is Script {
    function run() external {
        vm.startBroadcast();

        MockUSDC usdc = new MockUSDC();
        SolarAsset asset = new SolarAsset();
        SolarVault vault = new SolarVault(address(usdc));
        EnergyMarket market = new EnergyMarket(address(usdc), address(asset), address(vault));

        vm.stopBroadcast();

        console.log("MockUSDC deployed at:", address(usdc));
        console.log("SolarAsset deployed at:", address(asset));
        console.log("SolarVault deployed at:", address(vault));
        console.log("EnergyMarket deployed at:", address(market));
    }
}
