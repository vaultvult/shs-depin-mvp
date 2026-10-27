// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {
        // Mint 1,000,000 mUSDC to the deployer for testing
        _mint(msg.sender, 1000000 * 10**6);
    }

    // Override decimals to match real USDC (6 instead of 18)
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
