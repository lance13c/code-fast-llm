# code-fast-llm

Code Fast LLM: A VSCode extension to quickly apply structured code blocks from your clipboard to your editor. Reads clipboard JSON, identifies markers, and inserts, replaces, or deletes code seamlessly.

I've been copy and pasting a lot of code from LLMs. I wanted something that could speed it up.

## Small Example

Copy the following JSON to your clipboard:

```json
{
  "id": "cfllm",
  "codeBlocks": [
    {
      "start": "markerStart",
      "type": "add",
      "code": "\nconsole.log('Hello, World!');"
    }
  ]
}
```

Place markerStart in your code:

```txt
// markerStart
```

Use the shortcut cmd+v (Mac) or ctrl+v (Windows/Linux) to apply the code blocks.

## Features

- **Apply Code Block**s: Automatically apply JSON-formatted code blocks from your clipboard into your active document.
- **Smart Pasting**: If the clipboard content does not match the expected format, the extension performs a normal paste action.
- **Marker Identification**: Finds specific markers in the document to insert, replace, or delete code.
- **Error Handling**: Provides clear error messages for invalid JSON or missing markers.

## How to Use

Use this system prompt for your LLM.

### System Prompt (copy this)

```
To update code in a file in VSCode, generate a JSON object with the following structure:

Identifier:

Include "id": "cfllm" at the start.
Code Blocks:

Each block specifies an operation: "add", "replace", or "delete".
Use a start marker (regular expression) to indicate where the operation should begin.
For "replace" and "delete" operations, specify an end marker (regular expression).
Include the code to insert or replace.
JSON Schema:
{
  "id": "cfllm",
  "codeBlocks": [
    {
      "type": "add" | "replace" | "delete",
      "start": "<regular expression>",
      "end": "<regular expression> (optional for 'add')",
      "code": "<code to insert or replace (optional for 'delete')>"
    }
  ]
}
Ensure the markers (start and end) are accurate and use regular expressions to handle potential variations in formatting (e.g., spaces, newlines).

By following these instructions, the LLM will generate a JSON object that correctly specifies the code updates to be made in the file.
```

## Larger Example

**test.ts**

```ts
function greet(name: string): string {
  return `Hello, ${name}!`;
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
  console.log(subtract(5, 2));
  console.log(multiply(4, 3));
  console.log(divide(10, 2));
  console.log(isEven(4));
  console.log(isOdd(3));
  console.log(max(7, 2));
  console.log(min(5, 8));
}

main();
```

**Change JSON**

```json
{
  "id": "cfllm",
  "codeBlocks": [
    {
      "type": "add",
      "start": "function\\s+greet\\s*\\(name:\\s*string\\):\\s*string\\s*\\{\\s*return\\s*`Hello,\\s*\\${name}!`;\\s*\\}",
      "code": "\nfunction square(a: number): number {\n  return a * a;\n}\n"
    },
    {
      "type": "replace",
      "start": "console\\.log\\(subtract\\(5,\\s*2\\)\\);",
      "end": "console\\.log\\(subtract\\(5,\\s*2\\)\\);",
      "code": "console.log(square(5));"
    }
  ]
}
```

Must use the Ctrl + V or Command + V hotkey for this to work when pasting.
**Expected Output After Pasting**

```
// test.ts
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
```

## Release Notes

### 0.0.2

- Fixes key-bindings, they are no longer broken.

### 0.0.1

- Base extension
- Injects code where it should go.
