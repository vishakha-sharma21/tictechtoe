import mongoose from 'mongoose'

const CredentialsSchema = new mongoose.Schema({
  access_token: { type: String, required: true },
  refresh_token: { type: String, default: null },
  expires_at: { type: Number, default: null },
  token_type: { type: String, default: 'bearer' },
  scope: [{ type: String }],
})

const MetaSchema = new mongoose.Schema({
  provider_account_id: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
})

const IntegrationSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true }, // u001, u002, etc.
  provider: { type: String, required: true },
  credentials: { type: CredentialsSchema, required: true },
  meta: { type: MetaSchema, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

// Static method to get next user_id
IntegrationSchema.statics.getNextUserId = async function() {
  const latestIntegration = await this.findOne({}, { user_id: 1 }).sort({ user_id: -1 })
  if (!latestIntegration) return 'u001'
  
  const currentNum = parseInt(latestIntegration.user_id.substring(1))
  const nextNum = currentNum + 1
  return `u${nextNum.toString().padStart(3, '0')}`
}

// Static method to find by provider account ID
IntegrationSchema.statics.findByProviderAccountId = function(providerAccountId) {
  return this.findOne({ 'meta.provider_account_id': providerAccountId })
}

export const Integration =
  mongoose.models.Integration || mongoose.model('Integration', IntegrationSchema)
