// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EnergyMarket is Ownable {
    IERC20 public paymentToken; // e.g., USDC
    
    struct Device {
        address operator;
        string location; // e.g., "Lagos, Nigeria"
        uint256 totalEnergyGenerated; // in kWh (simulated)
        uint256 totalRewardsEarned; // in USDC
        bool isActive;
    }

    mapping(string => Device) public devices;
    mapping(address => uint256) public operatorBalances;

    event DeviceRegistered(string deviceId, address operator);
    event EnergyGenerated(string deviceId, uint256 kwh, uint256 reward);
    event PaymentReceived(address payer, string deviceId, uint256 amount);

    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
    }

    // 1. Operators register their Solar Home Systems
    function registerDevice(string memory _deviceId, string memory _location) external {
        require(devices[_deviceId].operator == address(0), "Device already registered");
        
        devices[_deviceId] = Device({
            operator: msg.sender,
            location: _location,
            totalEnergyGenerated: 0,
            totalRewardsEarned: 0,
            isActive: true
        });

        emit DeviceRegistered(_deviceId, msg.sender);
    }

    // 2. Consumers pay for energy (Simulating the PAYG model)
    function purchaseEnergy(string memory _deviceId, uint256 _amount) external {
        require(devices[_deviceId].isActive, "Device not active");
        
        // Transfer USDC from consumer to this contract
        
        // Credit the operator's balance
        devices[_deviceId].totalRewardsEarned += _amount;
        operatorBalances[devices[_deviceId].operator] += _amount;
        require(paymentToken.transferFrom(msg.sender, address(this), _amount), "Payment failed");

        emit PaymentReceived(msg.sender, _deviceId, _amount);
    }

    // 3. THE ORACLE HOOK: Simulating IoT data coming on-chain
    // In a real app, this would require a Chainlink oracle or signed data from the device.
    // For the hackathon MVP, we allow the owner (you) to simulate the proof-of-generation.
    function submitProofOfGeneration(string memory _deviceId, uint256 _kwh) external onlyOwner {
        require(devices[_deviceId].isActive, "Device not active");
        
        devices[_deviceId].totalEnergyGenerated += _kwh;
        
        // In a real system, this might trigger a token reward (e.g., $SHS token)
        // For the MVP, we just update the state to prove the machine-to-machine economy
        emit EnergyGenerated(_deviceId, _kwh, 0); 
    }

    // Operator withdraws their earned USDC
    function withdrawRewards() external {
        uint256 amount = operatorBalances[msg.sender];
        require(amount > 0, "No rewards to withdraw");
        
        operatorBalances[msg.sender] = 0;
        require(paymentToken.transfer(msg.sender, amount), "Withdrawal failed");
    }
}
