export interface VoteResult {
    id: number;
    createdAt:DateTime;
    voteFor: number;
    voteAgainst: number;
    birdId: number;
    updatedAt: DateTime;
}