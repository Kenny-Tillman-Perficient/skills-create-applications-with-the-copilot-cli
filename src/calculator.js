#!/usr/bin/env node
'use strict';

const readline = require('node:readline');

function modulo(a, b) {
  if (b === 0) {
    throw new Error('Cannot calculate modulo by zero.');
  }
  return a % b;
}

function power(base, exponent) {
  return base ** exponent;
}

function squareRoot(n) {
  if (n < 0) {
    throw new Error('Cannot calculate the square root of a negative number.');
  }
  return Math.sqrt(n);
}

// Supported operations: addition (+), subtraction (-), multiplication (*, ×),
// division (/, ÷), modulo (%), exponentiation (^), and square root (sqrt).
const operations = {
  '+': (left, right) => left + right,
  '-': (left, right) => left - right,
  '*': (left, right) => left * right,
  '×': (left, right) => left * right,
  '/': (left, right) => left / right,
  '÷': (left, right) => left / right,
  '%': modulo,
  '^': power,
};

const numberPattern = '-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?';
const squareRootPattern = new RegExp(`^\\s*sqrt\\s*\\(\\s*(${numberPattern})\\s*\\)\\s*$`, 'i');
const expressionPattern = new RegExp(
  `^\\s*(${numberPattern})\\s*([+*/×÷%^-])\\s*(${numberPattern})\\s*$`,
  'i',
);

function calculate(expression) {
  const squareRootMatch = expression.match(squareRootPattern);
  if (squareRootMatch) {
    const value = Number(squareRootMatch[1]);
    if (!Number.isFinite(value)) {
      throw new Error('Please enter a finite number.');
    }
    return squareRoot(value);
  }

  const match = expression.match(expressionPattern);
  if (!match) {
    throw new Error('Enter a calculation with two numbers and a supported operator, or sqrt(number).');
  }

  const [, leftText, operator, rightText] = match;
  const left = Number(leftText);
  const right = Number(rightText);

  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    throw new Error('Please enter finite numbers.');
  }
  if ((operator === '/' || operator === '÷') && right === 0) {
    throw new Error('Cannot divide by zero.');
  }

  return operations[operator](left, right);
}

function printUsage() {
  console.log('Usage: node src/calculator.js [calculation]');
  console.log('Example: node src/calculator.js "12 + 5"');
  console.log('Supported operations: +, -, *, /, %, ^, sqrt(number) (also × and ÷).');
  console.log('Run without a calculation to use interactive mode; enter q to quit.');
}

function runInteractive() {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'calc> ',
  });

  terminal.prompt();
  terminal.on('line', (line) => {
    const input = line.trim();
    if (['q', 'quit', 'exit'].includes(input.toLowerCase())) {
      terminal.close();
      return;
    }

    try {
      console.log(calculate(input));
    } catch (error) {
      console.error(error.message);
    }
    terminal.prompt();
  });
}

function main() {
  const argumentsList = process.argv.slice(2);
  if (argumentsList.includes('--help') || argumentsList.includes('-h')) {
    printUsage();
    return;
  }

  if (argumentsList.length === 0) {
    runInteractive();
    return;
  }

  try {
    console.log(calculate(argumentsList.join(' ')));
  } catch (error) {
    console.error(error.message);
    printUsage();
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { calculate, modulo, power, squareRoot };
