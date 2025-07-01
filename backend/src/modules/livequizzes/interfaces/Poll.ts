export interface Poll {
  id: string;
  question: string;
  options: string[];
  roomCode: string;
  creatorId: string;
  createdAt: Date;
  timer: number;
}

export interface PollAnswer {
  pollId: string;
  userId: string;
  answerIndex: number;
}
