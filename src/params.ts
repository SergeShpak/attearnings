export interface Parameters {
    readonly numberOfPlaces: number
    readonly numberOfRides: number
    readonly group: AsyncIterator<number, null | Error, void>
}