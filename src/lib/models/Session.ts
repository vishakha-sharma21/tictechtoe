import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'agent'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

const WorkflowSchema = new mongoose.Schema({
  nodes: { type: Array, default: [] },
  edges: { type: Array, default: [] },
})

const SessionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },   // session.user.email
  title: { type: String, default: 'New workflow' },
  messages: { type: [MessageSchema], default: [] },
  workflow: { type: WorkflowSchema, default: { nodes: [], edges: [] } },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

export const Session =
  mongoose.models.Session || mongoose.model('Session', SessionSchema)
