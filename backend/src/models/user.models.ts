import { model, Schema } from 'mongoose'

const userSchema = new Schema({
  address: {
    type: String,
    required: true,
    unique: true
  },
  accountBalance: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  burnedNFTs: [{
    type: Schema.Types.ObjectId,
    ref: 'NFT'
  }],
  soldNFTs: [{
    type: Schema.Types.ObjectId,
    ref: 'NFT'
  }],
  mintedNFTs: [{
    type: Schema.Types.ObjectId,
    ref: 'NFT'
  }],
  ownedNFTs: [{
    type: Schema.Types.ObjectId,
    ref: 'NFT'
  }]
}, { timestamps: true })

export default model('User', userSchema)
