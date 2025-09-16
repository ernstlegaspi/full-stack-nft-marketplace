import { model, Schema } from 'mongoose'

const AttributesSchema = new Schema({
  trait_type: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
})

const NFTSchema = new Schema({
  backgroundColor: {
    type: String,
    trim: true
  },
  contractAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  metadataUrl: {
    type: String,
    trim: true
  },
  tokenId: {
    type: Number,
    required: true
  },
  attributes: [AttributesSchema],
  imageUrl: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  collection: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  ownerAddress: {
    type: String,
    required: true,
    trim: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

NFTSchema.index({ contractAddress: 1, tokenId: 1 }, { unique: true }) // same contract address and token id is not allowed on the database
NFTSchema.index({ contractAddress: 1, name: 1 }, { unique: true }) // same contract address and name is not allowed on the database

export default model('NFT', NFTSchema)
