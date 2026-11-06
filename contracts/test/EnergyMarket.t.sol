// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";
import "../src/SolarAsset.sol";
import "../src/EnergyMarket.sol";

contract EnergyMarketTest is Test {
    MockUSDC public usdc;
    SolarAsset public asset;
    EnergyMarket public market;

    address public admin;
    address public operator;
    address public consumer;

    function setUp() public {
        admin    = makeAddr("admin");
        operator = makeAddr("operator");
        consumer = makeAddr("consumer");

        // Deploy outside the prank so the test contract holds the initial USDC
        usdc = new MockUSDC(); 
        
        vm.startPrank(admin);
        asset = new SolarAsset();
        market = new EnergyMarket(address(usdc), address(asset));

        // Admin mints an Asset NFT to the Operator
        asset.mintAsset(operator, "ipfs://QmFakeDocumentHash");

        // Admin allowlists the Operator
        market.setAllowlist(operator, true);
        vm.stopPrank();

        // The test contract transfers USDC to the consumer
        usdc.transfer(consumer, 100 * 10**6);
        
        vm.prank(consumer);
        usdc.approve(address(market), type(uint256).max);
    }

    function test_FullEnergyFlow() public {
        vm.prank(operator);
        market.registerDevice("SHS-LAGOS-001", "Lagos, Nigeria", 0);

        vm.prank(consumer);
        market.purchaseEnergy("SHS-LAGOS-001", 10 * 10**6);
        assertEq(market.operatorBalances(operator), 10 * 10**6);

        vm.prank(admin);
        market.submitProofOfGeneration("SHS-LAGOS-001", 50);

        uint256 operatorBalanceBefore = usdc.balanceOf(operator);
        vm.prank(operator);
        market.withdrawRewards();
        assertEq(usdc.balanceOf(operator) - operatorBalanceBefore, 10 * 10**6);
    }

    function test_DeviceFreeze() public {
        vm.prank(operator);
        market.registerDevice("SHS-LAGOS-001", "Lagos, Nigeria", 0);

        vm.prank(admin);
        market.freezeDevice("SHS-LAGOS-001", true);

        vm.prank(consumer);
        vm.expectRevert("Device is frozen");
        market.purchaseEnergy("SHS-LAGOS-001", 10 * 10**6);
    }
}
