// dummy.ts
function greet(name: string): string {
  return `Hello, ${name}!`;
}
function square(a: number): number {
  return a * a;
}


function add(a: number, b: number): number {
  return a + b;
}

function subtract(a: number, b: number): number {
  return a - b;
}

function multiply(a: number, b: number): number {
  return a * b;
}

function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

function isEven(num: number): boolean {
  return num % 2 === 0;
}

function isOdd(num: number): boolean {
  return num % 2 !== 0;
}

function max(a: number, b: number): number {
  return a > b ? a : b;
}

function min(a: number, b: number): number {
  return a < b ? a : b;
}

// Main function
function main() {
  console.log(greet('World'));
  console.log(add(2, 3));
  console.log(square(5));
  console.log(multiply(4, 3));
  console.log(divide(10, 2));
  console.log(isEven(4));
  console.log(isOdd(3));
  console.log(max(7, 2));
  console.log(min(5, 8));
}

main();
