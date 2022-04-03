/** @internal */
export class ParametersSummary {
    placesCount: number
    ridesCount: number
    groupsCount: number

    constructor(placesCount: number, ridesCount: number, groupsCount: number) {
        this.groupsCount = groupsCount;
        this.placesCount = placesCount;
        this.ridesCount = ridesCount;
    }
}

/** @internal */
export class ParametersParser {
    static ParseParamsSummary(l: string): (ParametersSummary | null) {
        const parts = l.split(' ');
        if (parts.length !== 3) {
            return null;
        }
        const partsAsNumbers = parts.map(p => this.parseAsNumber(p));
        return partsAsNumbers.some(p => p === null) ? null
            : new ParametersSummary(partsAsNumbers[0]!, partsAsNumbers[1]!, partsAsNumbers[2]!);
    }

    static ParseGroup(l: string): (number | null) {
        return this.parseAsNumber(l);
    }

    private static parseAsNumber(s: string): (number | null) {
        if (s.length === 0) {
            return null;
        }
        const n = Number(s);
        if (Number.isNaN(n)) {
            return null;
        }
        return n;
    }
}