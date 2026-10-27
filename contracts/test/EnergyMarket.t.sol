// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";
import "../src/EnergyMarket.sol";

contract EnergyMarketTest is Test {
    MockUSDC public usdc;
    EnergyMarket public market;

    address public admin;
    address public operator;
    address public consumer;

    function setUp() public {
        // Create labeled addresses for clean traces
        admin    = makeAddr("admin");
        operator = makeAddr("operator");
        consumer = makeAddr("consumer");

        // 1. Deploy Mock USDC (deployer is this test contract, so it gets 1M mUSDC)
        usdc = new MockUSDC();

        // 2. Deploy Energy Market
        market = new EnergyMarket(address(usdc));

        // 3. Give consumer some USDC to spend
        usdc.transfer(consumer, 100 * 10**6);

        // 4. Consumer approves the market to spend their USDC
        vm.prank(consumer);
        usdc.approve(address(market), type(uint256).max);
    }

    function test_FullEnergyFlow() public {
        // --- 1. Operator Registers Device ---
        vm.prank(operator);
        market.registerDevice("SHS-LAGOS-001", "Lagos, Nigeria");

        // --- 2. Consumer Pays for Energy (PAYG Model) ---
        vm.prank(consumer);
        market.purchaseEnergy("SHS-LAGOS-001", 10 * 10**6);

        // Contract holds the USDC
        assertEq(usdc.balanceOf(address(market)), 10 * 10**6);

        // Operator's pending balance reflects the payment
        assertEq(market.operatorBalances(operator), 10 * 10**6);

        // --- 3. Admin Simulates IoT Oracle (Proof of Generation) ---
        market.submitProofOfGeneration("SHS-LAGOS-001", 50);

        // --- 4. Operator Withdraws "Big Bag" ---
        uint256 operatorBalanceBefore = usdc.balanceOf(operator);
        
        vm.prank(operator);
        market.withdrawRewards();

        uint256 operatorBalanceAfter = usdc.balanceOf(operator);
        assertEq(operatorBalanceAfter - operatorBalanceBefore, 10 * 10**6);
    }
}
