import { Schema, model } from 'mongoose'

export interface StateDocType {
  userId: string
  /** AppState inteiro do Lume (validado no cliente; opaco para o server) */
  data: unknown
  updatedAt: Date
}

const stateSchema = new Schema<StateDocType>({
  userId: { type: String, required: true, unique: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, required: true },
})

export const StateDoc = model<StateDocType>('State', stateSchema)
