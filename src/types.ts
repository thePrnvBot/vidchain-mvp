export type VidchainObject = {
    sequenceTitle: string,
    clips: Clip[]
}

export type Clip = {
    videoId: string,
    thumbnail: string,
    start: number,
    end: number
}
