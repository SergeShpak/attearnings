import fs from "fs";

import { ParamsGetter } from "./params_getter";
import { ParametersParser } from "./params_parser";
import { Parameters } from "../params";

/** @internal */
export class FileParamsGetter implements ParamsGetter<string> {
  constructor() {}

  public async GetParams(file: string): Promise<Parameters> {
    const maxHeaderSize = 55;
    const readResult = await readFilePart(file, maxHeaderSize, 0);
    return new Promise((resolve, reject) => {
      const buf = getParametersSlice(readResult);
      if (buf === null) {
        return reject("a malformed buffer received");
      }
      let header = ParametersParser.ParseParamsSummary(buf.toString());
      if (header === null) {
        return reject(`"${buf.toString()}" is not a valid header string`);
      }
      return resolve({
        numberOfPlaces: header.placesCount,
        numberOfRides: header.ridesCount,
        group: getGroup(file, buf.length),
      });
    });
  }
}

interface readFilePartResult {
  buf: Buffer;
  isLast: boolean;
}

function readFilePart(
  path: string,
  limit: number,
  offset: number
): Promise<readFilePartResult> {
  return new Promise<readFilePartResult>((resolve, reject) => {
    fs.open(path, "r", (err, fd) => {
      if (err != null) {
        return reject(err);
      }
      fs.fstat(fd, (err, stats) => {
        if (err != null) {
          return reject(err);
        }
        const fileSize = stats.size;
        if (offset >= fileSize) {
          return resolve({
            buf: Buffer.alloc(0),
            isLast: true,
          });
        }

        const restOfFileLen: number = stats.size - offset;
        const lenToRead = restOfFileLen <= limit ? restOfFileLen : limit;
        const buf = Buffer.alloc(lenToRead);
        const bytesRead = fs.readSync(fd, buf, {
          length: lenToRead,
          offset: 0,
          position: offset,
        });
        if (bytesRead !== lenToRead) {
          return reject(
            `expected to read ${lenToRead} bytes, actually read ${bytesRead}`
          );
        }
        return resolve({
          buf,
          isLast: restOfFileLen <= limit,
        });
      });
    });
  });
}

async function* getGroup(
  file: string,
  offset: number
): AsyncIterator<number, Error | null, void> {
  const chunkSize = 100; // file page size
  let isFinishedReading = false;
  do {
    const readResult = await readFilePart(file, chunkSize, offset);
    isFinishedReading = readResult.isLast;
    let buf = getBufferGroupSlice(readResult);
    if (buf === null) {
      return new Error("a malformed buffer received");
    }
    offset += buf.length;
    const g = getGroupsFromBuffer(buf);
    for (let i = 0; i < g.length; i++) {
      yield g[i];
    }
  } while (!isFinishedReading);
  return null;
}

const lfByte = 10;

function getParametersSlice(readResult: readFilePartResult): Buffer | null {
  let finishPos = -1;
  for (let i = 0; i < readResult.buf.length; i++) {
    if (readResult.buf[i] !== lfByte) {
      continue;
    }
    finishPos = i;
    break;
  }
  if (finishPos === -1) {
    return null;
  }
  return readResult.buf.slice(0, finishPos);
}

function getBufferGroupSlice(readResult: readFilePartResult): Buffer | null {
  if (readResult.isLast) {
    return readResult.buf;
  }
  let finishPos = -1;
  for (let i = readResult.buf.length - 1; i >= 0; i--) {
    if (readResult.buf[i] !== lfByte) {
      continue;
    }
    finishPos = i;
    break;
  }
  if (finishPos === -1) {
    return null;
  }
  return readResult.buf.slice(0, finishPos);
}

function getGroupsFromBuffer(buf: Buffer): number[] {
  const bufString = buf.toString();
  return bufString
    .split("\n")
    .map((g) => ParametersParser.ParseGroup(g))
    .filter((g): g is number => g !== null);
}
