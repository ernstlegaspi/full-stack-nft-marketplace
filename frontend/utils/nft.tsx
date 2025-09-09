import { ethers } from 'ethers'
import { contractABI, contractAddress } from '../constants'

const { ethereum: eth } = window

export const createContract = async () => {
	const provider = new ethers.BrowserProvider(eth)
	const signer = await provider.getSigner()
	const contract = new ethers.Contract(contractAddress, contractABI, signer)

	return contract
}