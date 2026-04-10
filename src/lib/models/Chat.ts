import mongoose from 'mongoose'

const ChatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['human', 'agent'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

const ReactFlowSchema = new mongoose.Schema({
  nodes: [{ type: mongoose.Schema.Types.Mixed }],
  edges: [{ type: mongoose.Schema.Types.Mixed }],
})

const ChatSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // from integrations.user_id
  session_id: { type: String, required: true }, // s001, s002, etc. per user
  title: { type: String, default: 'New workflow' },
  query: { type: String, default: '' },
  chat_history: [ChatMessageSchema],
  react_flow: { type: ReactFlowSchema, default: { nodes: [], edges: [] } },
  completed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

// Static method to get next session_id for a user
ChatSchema.statics.getNextSessionId = async function(userId) {
  const userChats = await this.find({ user_id: userId }).sort({ session_id: -1 })
  if (userChats.length === 0) return 's001'
  
  const currentNum = parseInt(userChats[0].session_id.substring(1))
  const nextNum = currentNum + 1
  return `s${nextNum.toString().padStart(3, '0')}`
}

// Index for efficient queries
ChatSchema.index({ user_id: 1, created_at: -1 })
ChatSchema.index({ user_id: 1, session_id: 1 }, { unique: true })

export const Chat =
  mongoose.models.Chat || mongoose.model('Chat', ChatSchema)
