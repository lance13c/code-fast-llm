# code-fast-llm

Code Fast LLM: A VSCode extension to quickly apply structured code blocks from your clipboard to your editor. Reads clipboard JSON, identifies markers, and inserts, replaces, or deletes code seamlessly.

## Why create this?

I often copy and paste code from LLMs and wanted to speed up this process. This extension allows you to instruct the LLM to output only the necessary changes, then apply them all in one command. Works for any text. It's especially useful for larger files. The key question is, how accurate can we make an LLM be at this?

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
When outputting code, instead of putting the whole file, generate YAML text with the following structure:

Identifier:
Include the identifier `cfllm` at the top.

File Name:
Specify the file name where the changes should be applied.

Code Blocks:
Each code block should specify an operation: "add", "replace", or "delete".
Use a start marker to indicate where the operation should begin.
For "replace" and "delete" operations, specify an end marker.
Include only the code snippets necessary for the change, not the entire file.

YAML Schema:

cfllm:
  file: <file_name>
  codeBlocks:
    - type: <add|replace|delete>
      start: "<start_marker_code>"
      end: "<end_marker_code> (optional for 'add')"
      newCode: |
        <new_code_text>

By following these instructions, the LLM will generate YAML text that correctly specifies the code updates to be made in the file.
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

## Future Vision

Imagine controlling this with voice commands. With hot-reloading, save and undo features, file system understanding, and voice controls, you could practically talk to your code.
