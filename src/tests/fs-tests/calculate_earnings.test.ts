import path from 'path';
import fs from 'fs';

import { expect } from 'chai';

import { ParamsSource, InitializeParamsGetter } from "../../parameters_getter/params_getter_factory"
import { Calculator } from "../../calculator";

describe('CalculateEarnings()', () => {
    const getTestCases = (dir: string): Map<string, bigint> => {
        const files = fs.readdirSync(dir);
        const map: Map<string, bigint> = new Map();
        files.forEach(f => {
            const parts = f.split(".");
            if (parts.length < 3) {
                return;
            }
            const resultStr = parts[parts.length - 2];
            let result: bigint;
            try {
                result = BigInt(resultStr);
            } catch (_) {
                return;
            }
            map.set(f, result);
        })
        return map;
    }

    const testCasesDir = path.join(__dirname, "samples");
    const testCases = getTestCases(testCasesDir);
    testCases.forEach((expectedResult, fileName) => {
        it(fileName, () => {
            const filePath = path.join(testCasesDir, fileName);
            InitializeParamsGetter(ParamsSource.File).GetParams(filePath)
                .then(params => {
                    Calculator.CalculateEarnings(params)
                        .then(result => expect(result).to.equal(expectedResult))
                })
        })
    })
})