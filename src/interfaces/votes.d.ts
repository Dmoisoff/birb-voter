export interface VoteResult {
    id: number;
    createdAt:DateTime;
    voteFor: number;
    voteAgainst: number;
    birdId: number;
    updatedAt: DateTime;
}

export interface BirdVoteResult {
    birdId: number;
    voteFor: number;
    voteAgainst: number;
    updatedAt: Date?;
    commonName: string?;
    scientificName: string?;
    photoUrls: Array<string>;
    percentFor: number?;
}