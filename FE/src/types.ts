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
