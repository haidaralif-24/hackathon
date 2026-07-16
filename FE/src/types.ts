export interface AnswerTurn {
  type: "answer"
  text: string
}

export interface QuestionTurn {
  type: "question"
  text: string
  options: string[]
}

export interface ResultTurn {
  type: "result"
  urgency: "emergency" | "monitor" | "24h"
  explanation: string
  specialist?: string
}

export type ChatTurn = AnswerTurn | QuestionTurn | ResultTurn

export interface Message {
  role: "user" | "assistant"
  content: string
  turn?: ChatTurn
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export type Mood = "great" | "good" | "okay" | "bad" | "terrible"

export interface JournalEntry {
  id: string
  mood: Mood
  content: string
  created_at: string
}
