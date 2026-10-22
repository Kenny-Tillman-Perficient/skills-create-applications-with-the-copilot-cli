'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');
const { calculate } = require('../calculator');

const calculatorPath = path.join(__dirname, '..', 'calculator.js');

test('calculates the examples from the basic operations image', () => {
  assert.equal(calculate('2 + 3'), 5);
  assert.equal(calculate('10 - 4'), 6);
  assert.equal(calculate('45 * 2'), 90);
  assert.equal(calculate('20 / 5'), 4);
});

test('supports multiplication and division symbols from the calculator image', () => {
  assert.equal(calculate('6 × 7'), 42);
  assert.equal(calculate('21 ÷ 3'), 7);
});

test('supports decimals, negative values, and scientific notation', () => {
  assert.equal(calculate('1.5 + 2.25'), 3.75);
  assert.equal(calculate('-8 - 2'), -10);
  assert.equal(calculate('-3 * -4'), 12);
  assert.equal(calculate('1e2 / 4'), 25);
});

test('handles whitespace around numbers and operators', () => {
  assert.equal(calculate('  10   +   5  '), 15);
});

test('rejects division by zero for both division symbols', () => {
  assert.throws(() => calculate('10 / 0'), /Cannot divide by zero/);
  assert.throws(() => calculate('10 ÷ 0'), /Cannot divide by zero/);
});

test('rejects malformed expressions and unsupported operations', () => {
  for (const expression of ['2 ^ 3', '1 + 2 + 3', 'hello', '']) {
    assert.throws(() => calculate(expression), /Enter a calculation/);
  }
});

test('prints a result when invoked with a calculation', () => {
  const result = spawnSync(process.execPath, [calculatorPath, '2 + 3'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '5\n');
});

test('reports division by zero from the CLI', () => {
  const result = spawnSync(process.execPath, [calculatorPath, '1 / 0'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Cannot divide by zero/);
});

test('shows usage information with --help', () => {
  const result = spawnSync(process.execPath, [calculatorPath, '--help'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Supported operations: \+, -, \*, \//);
});

test('supports calculations in interactive mode and exits on q', () => {
  const result = spawnSync(process.execPath, [calculatorPath], {
    encoding: 'utf8',
    input: '8 - 3\nq\n',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /5/);
});
