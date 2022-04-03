# Attearnings - Calculate the roller coaster daily earnings

This repo contains the solution to the roller coaster programming exercise.

## First version

The first version has been implemented using `Go` and can be found in the [`legacy`](./legacy) directory. The first version, however, used a naive approach and had an `O(n^2)` complexity.

## Better version

The better version is implemented in TS. The source code files can be found in [`src`](./src).

### Running the code

Take the following steps to run the solution locally:

1. Install all the necessary dependencies:

```bash
npm install
```

2. Transpile the TS code into JS:

```bash
npm run build
```

3.  Run the `src/main.js` file with node.

You can either pass a file with the input data:

```bash
node src/main.js -f src/tests/fs-tests/samples/1_simple_case.7.txt
```

Or you can read the input data from stdin:

```bash
cat src/tests/fs-tests/samples/1_simple_case.7.txt | node src/main.js
```

### Running the tests

To run unit tests execute:

```bash
npm run test:unit
```

To run the tests that use the file system execute:

```bash
npm run test:fs
```

To run all the tests execute:

```bash
npm run test:all
```

### Short explanation

Groups that take a ride together can be regarded as a node. The nodes take rides always in the same order. In a general case, the nodes taking rides will sooner or later create a cycle - by finding its length and the number of people inside each node we can calculate the final result.