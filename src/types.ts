export type VidchainObject = {
    sequenceTitle: string,
    clips: Clip[]
}

export type Clip = {
    url: string,
    start: number,
    end: number
}
