import { Schema, model } from 'mongoose'

export interface UserDoc {
  /** uuid — também é o tenant id */
  _id: string
  email: string
  passwordHash: string
  createdAt: Date
}

const userSchema = new Schema<UserDoc>({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
})

export const User = model<UserDoc>('User', userSchema)
