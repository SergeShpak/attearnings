import { Parameters } from "./params";

export class Calculator {
  static async CalculateEarnings(param: Parameters): Promise<BigInt> {
    const groups = await Calculator.getGroups(param.group);
    return EarningsCalculator.Calculate(
      groups,
      param.numberOfPlaces,
      param.numberOfRides
    );
  }

  private static async getGroups(
    groupsIterator: AsyncIterator<number, null | Error, void>
  ): Promise<number[]> {
    return new Promise<number[]>(async (resolve, _) => {
      let groupStep = await groupsIterator.next();
      let g: number[] = [];
      while (!groupStep.done) {
        g.push(groupStep.value);
        groupStep = await groupsIterator.next();
      }
      return resolve(g);
    });
  }
}

class RideSum {
  idx: number;
  sum: bigint;

  constructor(idx: number, sum: bigint) {
    this.idx = idx;
    this.sum = sum;
  }
}

class EarningsCalculator {
  static Calculate(groups: number[], placesCount: number, ridesCount: number) {
    const rides: RideSum[] = [];
    const ridesLedger = new Set<number>();
    let currGroupIdx = 0;
    while (!ridesLedger.has(currGroupIdx)) {
      const { rideSum, newGroupIdx, isBlocking } =
        EarningsCalculator.launchRide(groups, currGroupIdx, placesCount);
      if (isBlocking) {
        return rides.map((r) => r.sum).reduce((prev, curr) => prev + curr);
      }
      currGroupIdx = newGroupIdx;
      rides.push(rideSum);
      ridesLedger.add(rideSum.idx);
    }
    return EarningsCalculator.calculateTotalSum(
      rides,
      currGroupIdx,
      ridesCount
    );
  }

  private static launchRide(
    groups: number[],
    startGroupIdx: number,
    placesCount: number
  ): { rideSum: RideSum; newGroupIdx: number; isBlocking: boolean } {
    let passangersCount = BigInt(groups[startGroupIdx]);
    if (passangersCount > placesCount) {
      return {
        rideSum: new RideSum(-1, BigInt(0)),
        newGroupIdx: -1,
        isBlocking: true,
      };
    }

    const getNewCurrIdx = (currIdx: number) => (currIdx + 1) % groups.length;
    let currIdx = getNewCurrIdx(startGroupIdx);
    while (currIdx != startGroupIdx) {
      const groupsPassengers = BigInt(groups[currIdx]);
      if (passangersCount + groupsPassengers > BigInt(placesCount)) {
        break;
      }
      passangersCount += groupsPassengers;
      currIdx = getNewCurrIdx(currIdx);
    }
    return {
      rideSum: new RideSum(startGroupIdx, passangersCount),
      newGroupIdx: currIdx,
      isBlocking: false,
    };
  }

  private static calculateTotalSum(
    rides: RideSum[],
    cycleStartGroupIdx: number,
    ridesCount: number
  ): bigint {
    let cycleStart = -1;
    let startTotal = BigInt(0);
    for (let i = 0; i < rides.length; i++) {
      if (rides[i].idx === cycleStartGroupIdx) {
        cycleStart = i;
        break;
      }
      ridesCount--;
      startTotal += rides[i].sum;
    }
    if (cycleStart === -1) {
      throw new Error(
        `group ${cycleStartGroupIdx} that starts the cycle has not been found`
      );
    }

    let cycleLength = rides.length - cycleStart;
    let residueLen = ridesCount % cycleLength;
    let residueStopIdx = cycleStart + residueLen;
    let cycleTotal = BigInt(0);
    let ridesResidueTotal = BigInt(0);
    for (let i = cycleStart; i < rides.length; i++) {
      cycleTotal += rides[i].sum;
      if (i < residueStopIdx) {
        ridesResidueTotal += rides[i].sum;
      }
    }

    return (
      startTotal +
      BigInt(Math.floor(ridesCount / cycleLength)) * cycleTotal +
      ridesResidueTotal
    );
  }
}
