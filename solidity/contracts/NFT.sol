// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTMarketplace is ERC721URIStorage {
  uint256 private maxSupply;
  uint256 private totalMintedTokens;
  mapping(uint256 => bool) private usedTokenId;

  error ETokenIDIsUsed();
  error EMaxSupplyReached();

  event EmitMint(address _to, uint256 _tokenId, string _tokenURI);
  event EmitBurn(address _owner, uint256 _tokenId);
  event EmitTransfer(address _owner, address _to, uint256 _tokenId);
  event EmitMaxSupplyUpdated(uint256 _prev, uint256 _current);

  constructor() ERC721("NFTMarketplace", "NFT") {
    maxSupply = 100;
  }

  function mintNFT(uint256 _tokenId, string memory _tokenURI) external {
    if(usedTokenId[_tokenId]) revert ETokenIDIsUsed();
    if(totalMintedTokens == maxSupply) revert EMaxSupplyReached();

    _safeMint(msg.sender, _tokenId);
    _setTokenURI(_tokenId, _tokenURI);

    usedTokenId[_tokenId] = true;

    totalMintedTokens++;

    emit EmitMint(msg.sender, _tokenId, _tokenURI);
  }

  function burnNFT(uint256 _tokenId) external {
    address owner = _requireOwned(_tokenId);
    _checkAuthorized(owner, _msgSender(), _tokenId);
    _burn(_tokenId);

    emit EmitBurn(owner, _tokenId);
  }

  function transferNFT(address _to, uint256 _tokenId) external {
    safeTransferFrom(msg.sender, _to, _tokenId);

    emit EmitTransfer(msg.sender, _to, _tokenId);
  }

  function getTotalMintedTokens() external view returns (uint256) {
    return totalMintedTokens;
  }

  function getMaxSupply() external view returns (uint256) {
    return maxSupply;
  }

  // per season
  function updateMaxSupply() external {
    uint256 prev = maxSupply;
    maxSupply += 100;

    emit EmitMaxSupplyUpdated(prev, maxSupply);
  }
}
