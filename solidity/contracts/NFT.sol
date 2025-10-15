// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTMarketplace is ERC721URIStorage, ERC2981, Ownable, ReentrancyGuard {
  struct TokenData {
    bool isExisting;
    uint256 price;
  }

  uint256 private maxSupply;
  uint256 private totalMintedTokens;
  mapping(uint256 => TokenData) private usedTokenId;

  bool private isOwnerWithdrawing;

  uint256 private mintFee = 0.001 ether;

  error ETokenIDIsUsed();
  error EMaxSupplyReached();
  error EBuyFailed();
  error EIncorrectPrice();
  error EWithdrawFailed();
  error EInsufficientContractBalance();
  error ENoRoyalty();
  error ENoRoyaltyReceiver();
  error ERoyaltyTransferFailed();
  error EIncorrectMintFee();

  event EmitMint(address _to, uint256 _tokenId, string _tokenURI);
  event EmitBurn(address _owner, uint256 _tokenId);
  event EmitTransfer(address _owner, address _to, uint256 _tokenId);
  event EmitBuy(address _from, address _to, uint256 _tokenId);
  event EmitMaxSupplyUpdated(uint256 _prev, uint256 _current);
  event EmitWithdraw(address indexed _owner, uint256 _amount);

  constructor() ERC721("NFTMarketplace", "NFT") Ownable(msg.sender) {
    maxSupply = 100;
    _setDefaultRoyalty(owner(), 500);
  }

  function withdraw() external onlyOwner() {
    uint256 contractBalance = address(this).balance;

    if(isOwnerWithdrawing) revert EWithdrawFailed();
    if(contractBalance == 0) revert EInsufficientContractBalance();

    isOwnerWithdrawing = true;

    (bool ok, ) = payable(owner()).call{value: contractBalance}("");
    if(!ok) revert EWithdrawFailed();

    isOwnerWithdrawing = false;

    emit EmitWithdraw(owner(), contractBalance);
  }

  function mintNFT(uint256 _tokenId, string memory _tokenURI, uint256 _price) external payable {
    if(usedTokenId[_tokenId].isExisting) revert ETokenIDIsUsed();
    if(totalMintedTokens == maxSupply) revert EMaxSupplyReached();
    if(msg.value != mintFee) revert EIncorrectMintFee();

    _safeMint(msg.sender, _tokenId);
    _setTokenURI(_tokenId, _tokenURI);

    usedTokenId[_tokenId].isExisting = true;
    usedTokenId[_tokenId].price = _price;

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

  function buyNFT(uint256 _tokenId) external payable {
    address seller = ownerOf(_tokenId);

    if(usedTokenId[_tokenId].price != msg.value) revert EIncorrectPrice();

    uint256 tokenPrice = msg.value;

    (address royaltyReceiver, uint256 royaltyAmount) = royaltyInfo(_tokenId, tokenPrice);
    uint256 sellerAmount = tokenPrice - royaltyAmount;

    if(royaltyAmount == 0) revert ENoRoyalty();
    if(royaltyReceiver == address(0)) revert ENoRoyaltyReceiver();

    (bool rOk, ) = royaltyReceiver.call{value: royaltyAmount}("");

    if(!rOk) revert ERoyaltyTransferFailed();

    (bool ok, ) = seller.call{value: sellerAmount}("");
    if(!ok) revert EBuyFailed();

    _transfer(seller, msg.sender, _tokenId);

    emit EmitBuy(seller, msg.sender, _tokenId);
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

  function supportsInterface(bytes4 iid) public view override(ERC721URIStorage, ERC2981) returns (bool) {
    return super.supportsInterface(iid);
  }
}
