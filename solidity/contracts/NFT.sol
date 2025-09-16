// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTMarketplace is ERC721URIStorage {
  mapping(uint256 => bool) private usedTokenId;

  error ETokenIDIsUsed();

  event EmitMint(address _to, uint256 _tokenId, string _tokenURI);
  event EmitBurn(address _owner, uint256 _tokenId);

  constructor() ERC721("NFTMarketplace", "NFT") {}

  function mintNFT(uint256 _tokenId, string memory _tokenURI) external {
    if(usedTokenId[_tokenId]) revert ETokenIDIsUsed();

    _safeMint(msg.sender, _tokenId);
    _setTokenURI(_tokenId, _tokenURI);

    usedTokenId[_tokenId] = true;

    emit EmitMint(msg.sender, _tokenId, _tokenURI);
  }

  function burnNFT(uint256 _tokenId) external {
    address owner = _requireOwned(_tokenId);
    _checkAuthorized(owner, _msgSender(), _tokenId);
    _burn(_tokenId);

    emit EmitBurn(owner, _tokenId);
  }
}
