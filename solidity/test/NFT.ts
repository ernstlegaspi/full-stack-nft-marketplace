import { expect } from 'chai'
import { network } from 'hardhat'

const { ethers } = await network.connect()

describe('NFT', () => {
  const deployContract = async () => {
    const [deployer, user1, user2] = await ethers.getSigners()
    const _nft = await ethers.getContractFactory('NFTMarketplace', deployer)

    const nft = await _nft.deploy()
    await nft.waitForDeployment();

    return {
      deployer,
      nft,
      user1,
      user2
    }
  }

  it('Mint NFT, emit events, and set Token URIs', async () => {
    const { nft, user1 } = await deployContract()

    const uri1 = 'ipfs://QmExampleCID0'
    const mintTx0 = await nft.mintNFT(user1.address, uri1)

    await expect(mintTx0).to.emit(nft, 'EmitMint').withArgs(user1.address, 0, uri1)

    expect(await nft.ownerOf(0)).to.equal(user1.address)
    expect(await nft.tokenURI(0)).to.equal(uri1)
  })

  it('Prevents non-existent token to have Token URI', async () => {
    const { nft } = await deployContract()

    await expect(nft.tokenURI(999)).to.be.revert(ethers)
  })

  it('Burn NFT, and emit events', async () => {
    const { nft, user1 } = await deployContract()

    await nft.mintNFT(user1.address, 'ipfs://QmExampleCID0')

    const burnTx0 = await nft.connect(user1).burnNFT(0)
    await expect(burnTx0).to.emit(nft, 'EmitBurn').withArgs(user1.address, 0)

    await expect(nft.ownerOf(0)).to.be.revert(ethers)
    await expect(nft.tokenURI(0)).to.be.revert(ethers)
  })

  it('Non-owner cannot burn unless approve', async () => {
    const { nft, user1, user2 } = await deployContract()

    await nft.mintNFT(user1.address, 'ipfs://QmExampleCID0')

    await expect(nft.connect(user2).burnNFT(0)).to.be.revert(ethers)

    await nft.connect(user1).approve(user2.address, 0)
    await expect(nft.connect(user2).burnNFT(0)).to.emit(nft, 'EmitBurn')
  })
})
