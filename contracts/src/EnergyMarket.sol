// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EnergyMarket is Ownable {
    IERC20 public paymentToken;
    IERC721 public solarAssetToken;
    address public yieldVault;
    
    struct Device {
        address operator;
        uint256 assetTokenId;
        string location;
        uint256 totalEnergyGenerated;
        uint256 totalRewardsEarned;
        bool isActive;
        bool isFrozen;
    }

    mapping(string => Device) public devices;
    mapping(address => uint256) public operatorBalances;
    mapping(address => bool) public allowlist;

    event DeviceRegistered(string deviceId, address operator, uint256 assetTokenId);
    event DeviceFrozen(string deviceId, bool status);
    event EnergyGenerated(string deviceId, uint256 kwh);
    event PaymentReceived(address payer, string deviceId, uint256 amount);

    constructor(address _paymentToken, address _solarAssetToken, address _yieldVault) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        solarAssetToken = IERC721(_solarAssetToken);
        yieldVault = _yieldVault;
    }

    function setAllowlist(address _operator, bool _status) external onlyOwner {
        allowlist[_operator] = _status;
    }

    function freezeDevice(string memory _deviceId, bool _status) external onlyOwner {
        require(devices[_deviceId].operator != address(0), "Device not found");
        devices[_deviceId].isFrozen = _status;
        emit DeviceFrozen(_deviceId, _status);
    }

    function registerDevice(string memory _deviceId, string memory _location, uint256 _assetTokenId) external {
        require(allowlist[msg.sender], "Operator not on allowlist");
        require(devices[_deviceId].operator == address(0), "Device already registered");
        require(solarAssetToken.ownerOf(_assetTokenId) == msg.sender, "Must own the Asset Token");
        
        devices[_deviceId] = Device({
            operator: msg.sender,
            assetTokenId: _assetTokenId,
            location: _location,
            totalEnergyGenerated: 0,
            totalRewardsEarned: 0,
            isActive: true,
            isFrozen: false
        });

        emit DeviceRegistered(_deviceId, msg.sender, _assetTokenId);
    }

    function purchaseEnergy(string memory _deviceId, uint256 _amount) external {
        Device storage device = devices[_deviceId];
        require(device.isActive, "Device not active");
        require(!device.isFrozen, "Device is frozen");
        
        // Split: 90% to Operator, 10% to Investor Vault
        uint256 investorSplit = (_amount * 10) / 100;
        uint256 operatorSplit = _amount - investorSplit;

        device.totalRewardsEarned += operatorSplit;
        operatorBalances[device.operator] += operatorSplit;
        
        require(paymentToken.transferFrom(msg.sender, address(this), _amount), "Payment failed");
        
        if (investorSplit > 0) {
            require(paymentToken.transfer(yieldVault, investorSplit), "Vault transfer failed");
        }

        emit PaymentReceived(msg.sender, _deviceId, _amount);
    }

    function submitProofOfGeneration(string memory _deviceId, uint256 _kwh) external onlyOwner {
        Device storage device = devices[_deviceId];
        require(device.isActive, "Device not active");
        require(!device.isFrozen, "Device is frozen");
        
        device.totalEnergyGenerated += _kwh;
        emit EnergyGenerated(_deviceId, _kwh);
    }

    function withdrawRewards() external {
        uint256 amount = operatorBalances[msg.sender];
        require(amount > 0, "No rewards to withdraw");
        operatorBalances[msg.sender] = 0;
        require(paymentToken.transfer(msg.sender, amount), "Withdrawal failed");
    }
}
