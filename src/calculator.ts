import { resolve } from "path";
import { Parameters } from "./params";

export class Calculator {
  static async CalculateEarnings(param: Parameters): Promise<BigInt> {
    const queue = new Queue();
    await queue.construct(
      param.group,
      param.numberOfPlaces,
      param.numberOfRides
    );
    return new Promise<BigInt>((resolve, _) => {
      if (queue.Head === null) {
        return resolve(queue.StartTotal);
      }
      const fullCycles = Math.floor(
        (param.numberOfRides - queue.StartLength) / queue.Length
      );
      const partialCycleLen =
        param.numberOfRides - queue.StartLength - fullCycles * queue.Length;
      return resolve(
        queue.StartTotal +
          queue.Total * BigInt(fullCycles) +
          queue.countPartialSum(partialCycleLen)
      );
    });
  }
}

class Queue {
  StartLength: number;
  StartTotal: bigint;

  Head: QueueNode | null;
  Total: bigint;
  Length: number;

  constructor() {
    this.StartLength = 0;
    this.StartTotal = BigInt(0);
    this.Head = null;
    this.Total = BigInt(0);
    this.Length = 0;
  }

  async construct(
    groups: AsyncIterator<number, null | Error, void>,
    placesCount: number,
    ridesCount: number
  ) {
    const getGroups = async (): Promise<number[]> => {
      return new Promise<number[]>(async (resolve, _) => {
        let groupStep = await groups.next();
        let g: number[] = [];
        while (!groupStep.done) {
          g.push(groupStep.value);
          groupStep = await groups.next();
        }
        return resolve(g);
      });
    };

    this.Head = new QueueNode(-1, BigInt(0));
    this.Length = 0;
    this.Total = BigInt(0);
    this.StartLength = 0;
    this.StartTotal = BigInt(0);

    let currNode: QueueNode | null = this.Head;

    const g = await getGroups();
    let currGroupPos = 0;
    let cycleStart = -1;
    let map: Map<number, number> = new Map();
    let isRideFilled = false;
    while (map.get(currGroupPos) === undefined) {
      map.set(currGroupPos, currGroupPos);
      let currPos = currGroupPos;
      let currSum = BigInt(0);
      let currEl = BigInt(g[currPos]);
      while (currSum + currEl <= placesCount) {
        currSum += currEl;
        // check if the whole queue fits into one ride
        if (currPos + 1 === g.length && !isRideFilled) {
          this.StartTotal = BigInt(ridesCount) * currSum;
          this.Head = null;
          return;
        }
        currPos = (currPos + 1) % g.length;
        currEl = BigInt(g[currPos]);
      }

      const newNode = new QueueNode(currGroupPos, currSum);
      currGroupPos = currPos;
      isRideFilled = true;
      currNode.append(newNode);
      currNode = newNode;
      this.Length++;
      this.Total += currSum;
      if (this.Length === ridesCount) {
        break;
      }
      if (currEl > placesCount) {
        break;
      }
    }

    cycleStart = currGroupPos;
    currNode = this.Head.next;

    while (currNode !== null && currNode.pos !== cycleStart) {
      this.StartTotal += currNode.sum;
      this.StartLength++;
      currNode = currNode.next;
    }
    this.Length -= this.StartLength;
    this.Total -= this.StartTotal;

    this.Head = currNode;
  }

  countPartialSum(length: number): bigint {
    let currNode: QueueNode | null = this.Head;
    let sum = BigInt(0);
    while (currNode !== null && length > 0) {
      sum += currNode.sum;
      currNode = currNode.next;
      length--;
    }
    return sum;
  }
}

class QueueNode {
  sum: bigint;
  pos: number;
  next: QueueNode | null;

  constructor(pos: number, sum: bigint) {
    this.pos = pos;
    this.sum = sum;
    this.next = null;
  }

  append(node: QueueNode) {
    this.next = node;
  }
}
