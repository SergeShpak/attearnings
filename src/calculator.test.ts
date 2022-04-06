import { expect } from "chai";

import { Calculator } from "./calculator";
import { Parameters } from "./params";

describe("CalculateEarnings()", () => {
  async function* getGroup(
    groups: number[]
  ): AsyncIterator<number, Error | null, void> {
    for (let i = 0; i < groups.length; i++) {
      yield groups[i];
    }
    return null;
  }

  interface TestCase {
    name?: string;
    inParams: Parameters;
    expectedResult: bigint;
  }
  const tests: TestCase[] = [
    {
      name: "simple case",
      inParams: {
        group: getGroup([3, 1, 1, 2]),
        numberOfPlaces: 3,
        numberOfRides: 3,
      },
      expectedResult: BigInt(7),
    },
    {
      name: "the same group go on the ride several times a day",
      inParams: {
        group: getGroup([2, 3, 5, 3]),
        numberOfPlaces: 5,
        numberOfRides: 3,
      },
      expectedResult: BigInt(15),
    },
    {
      name: "all the people on the same ride",
      inParams: {
        group: getGroup([100, 200, 300, 400, 500]),
        numberOfPlaces: 10000,
        numberOfRides: 10,
      },
      expectedResult: BigInt(15000),
    },
    {
      name: "complex queue cycle",
      inParams: {
        group: getGroup([1, 1, 4, 2]),
        numberOfPlaces: 4,
        numberOfRides: 10,
      },
      expectedResult: BigInt(38),
    },
    {
      name: "blocking group",
      inParams: {
        group: getGroup([1, 2, 3, 4, 5, 6, 7]),
        numberOfPlaces: 4,
        numberOfRides: 10,
      },
      expectedResult: BigInt(10),
    },
  ];
  tests.forEach((t, i) => {
    const name =
      t.name == null ? `test case #${i}` : `test case #${i}: ${t.name}`;
    it(name, async () => {
      const actual = await Calculator.CalculateEarnings(t.inParams);
      expect(actual).to.equal(t.expectedResult);
    });
  });
});
