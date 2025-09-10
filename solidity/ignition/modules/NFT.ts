import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

export default buildModule("NFTMarketplaceModule", (m) => {
  const nft = m.contract("NFTMarketplace")

  return { nft }
});
