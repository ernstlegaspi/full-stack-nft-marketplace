import { model, Schema } from 'mongoose'

const refreshTokenSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  jti: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  revoked: {
    type: Boolean,
    default: false
  },
  revokedAt: Date,
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
})

export default model('Refresh Token', refreshTokenSchema)
