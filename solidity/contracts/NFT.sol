// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTMarketplace is ERC721URIStorage {
    uint256 private tokenId;

    event EmitMint(address _to, uint256 _tokenId, string _tokenURI);
    event EmitBurn(address _owner, uint256 _tokenId);

    constructor() ERC721("NFTMarketplace", "NFT") {}

    function mintNFT(address _to, string memory _tokenURI) external {
      _safeMint(_to, tokenId);
      _setTokenURI(tokenId, _tokenURI);

      emit EmitMint(_to, tokenId, _tokenURI);

      tokenId++;
    }

    function burnNFT(uint256 _tokenId) external {
      address owner = _requireOwned(_tokenId);
      _checkAuthorized(owner, _msgSender(), _tokenId);
      _burn(_tokenId);

      emit EmitBurn(owner, _tokenId);
    }
}
