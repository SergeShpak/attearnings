import yargs from "yargs";

import { ParamsSource, InitializeParamsGetter } from "./parameters_getter/params_getter_factory"
import { Calculator } from "./calculator";
import { Parameters } from "./params";

async function main() {
    const argv = await yargs(process.argv.slice(2)).option({
        f: {
            type: 'string',
            alias: 'file',
            describe: 'File with input',
            nargs: 1,
            demandOption: false,
        }
    })
        .usage('Usage: $0 [-f] [file name]')
        .help('h')
        .alias('h', 'help')
        .argv;
    let params: Parameters;
    if (argv.f == null) {
        params = await InitializeParamsGetter(ParamsSource.Stdin).GetParams();
    } else {
        params = await InitializeParamsGetter(ParamsSource.File).GetParams(argv.f);
    }
    const result = await Calculator.CalculateEarnings(params);
    console.log(result);
}

(async () => {
    try {
        await main();
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
})()