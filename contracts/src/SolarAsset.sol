// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SolarAsset is ERC721, Ownable {
    uint256 public nextTokenId;

    // Maps Token ID to the IPFS hash of the physical asset's documents (deed, photos)
    mapping(uint256 => string) public assetDocuments;

    event AssetMinted(address to, uint256 tokenId, string documentHash);

    constructor() ERC721("Solar Asset Claim", "SHS") Ownable(msg.sender) {}

    // Only the admin can mint a claim for a physical solar panel
    function mintAsset(address _to, string memory _documentHash) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(_to, tokenId);
        assetDocuments[tokenId] = _documentHash;
        emit AssetMinted(_to, tokenId, _documentHash);
    }
}
