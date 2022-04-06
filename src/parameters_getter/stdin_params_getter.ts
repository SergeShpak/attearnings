import * as readline from "readline";

import { ParamsGetter } from "./params_getter";
import { ParametersParser, ParametersSummary } from "./params_parser";
import { Parameters } from "../params";

/** @internal */
export class StdinParamsGetter implements ParamsGetter<void> {
  constructor() {}

  public GetParams(): Promise<Parameters> {
    return new Promise<Parameters>((resolve, reject) => {
      const rl = readline.createInterface(process.stdin);
      let summary: ParametersSummary;
      let groups: number[] = [];

      rl.on("line", (line) => {
        if (summary === undefined) {
          let s = ParametersParser.ParseParamsSummary(line);
          if (s === null) {
            return reject(new Error("failed to parse the summary line"));
          }
          summary = s;
          return;
        }
        const g = ParametersParser.ParseGroup(line);
        if (g === null) {
          return;
        }
        groups.push(g);
      });

      rl.on("close", () => {
        if (summary == null) {
          return reject(new Error("summary object has not been initialized"));
        }
        if (groups.length !== summary.groupsCount) {
          return reject(
            new Error(
              `expected number of groups: ${summary.groupsCount}, got: ${groups.length}`
            )
          );
        }
        return resolve({
          numberOfPlaces: summary.placesCount,
          numberOfRides: summary.ridesCount,
          group: getGroup(groups),
        });
      });
    });
  }
}

async function* getGroup(
  groups: number[]
): AsyncIterator<number, Error | null, void> {
  for (let i = 0; i < groups.length; i++) {
    yield groups[i];
  }
  return null;
}
