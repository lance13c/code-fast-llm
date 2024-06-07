import { activate } from '@/extension';
import { createMockExtensionContext } from '@test/mockExtensionContext';
import { createMockVscode } from '@test/mockVscode';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

const sandbox = sinon.createSandbox();

const vscodeMocks = createMockVscode(sandbox);
const mockClipboard = vscodeMocks.env.clipboard;

describe('Extension Test Suite', () => {
  vscodeMocks.window.showInformationMessage('Start all tests.');

  let context: vscode.ExtensionContext;

  beforeEach(() => {
    context = createMockExtensionContext();
  });

  afterEach(() => {
    sandbox.restore();
  });

  test('should activate extension', async () => {
    activate(context, mockClipboard);
    expect(vscodeMocks.commands.registerCommand.calledOnce).toBe(true);
  });

  test('should parse valid clipboard JSON and apply edits', async () => {
    const editorStub = {
      document: {
        getText: () => `
          function greet(name: string): string {
            return \`Hello, \${name}!\`;
          }
          function add(a: number, b: number): number {
            return a + b;
          }
        `,
        positionAt: (offset: number) => new vscodeMocks.Position(offset, 0),
        uri: vscodeMocks.Uri.file('/fake/path/to/file'),
      },
      edit: sandbox.stub().callsFake((callback) => {
        const editBuilder = {
          insert: sandbox.spy(),
          replace: sandbox.spy(),
          delete: sandbox.spy(),
        };
        callback(editBuilder);
        return Promise.resolve(true);
      }),
    };

    vscodeMocks.window.activeTextEditor = editorStub as any;
    mockClipboard.readText.resolves(
      JSON.stringify({
        id: 'cfllm',
        codeBlocks: [
          {
            type: 'add',
            start:
              'function\\s+greet\\s*\\(name:\\s*string\\):\\s*string\\s*\\{',
            code: '\nfunction square(a: number): number {\n  return a * a;\n}\n',
          },
          {
            type: 'replace',
            start: 'console\\.log\\(add\\(2,\\s*3\\)\\);',
            end: 'console\\.log\\(add\\(2,\\s*3\\)\\);',
            code: 'console.log(square(5));',
          },
        ],
      }),
    );

    activate(context, mockClipboard);

    await vscodeMocks.commands.executeCommand('code-fast-llm.applyCodeBlocks');

    expect(editorStub.edit.calledOnce).toBe(true);
    expect(mockClipboard.readText.calledOnce).toBe(true);
  });

  test('should handle invalid JSON format in clipboard', async () => {
    vscodeMocks.window.activeTextEditor = {
      document: {
        getText: () => `
          function greet(name: string): string {
            return \`Hello, \${name}!\`;
          }
          function add(a: number, b: number): number {
            return a + b;
          }
        `,
      },
    } as any;

    mockClipboard.readText.resolves('{ invalid json }');

    activate(context, mockClipboard);

    await vscodeMocks.commands.executeCommand('code-fast-llm.applyCodeBlocks');

    expect(vscodeMocks.window.showErrorMessage.calledOnce).toBe(true);
    expect(
      vscodeMocks.window.showErrorMessage.calledWith('Invalid JSON format'),
    ).toBe(true);
  });

  test('should handle marker not found error', async () => {
    vscodeMocks.window.activeTextEditor = {
      document: {
        getText: () => `
          function greet(name: string): string {
            return \`Hello, \${name}!\`;
          }
          function add(a: number, b: number): number {
            return a + b;
          }
        `,
      },
    } as any;

    mockClipboard.readText.resolves(
      JSON.stringify({
        id: 'cfllm',
        codeBlocks: [
          {
            type: 'add',
            start: 'nonexistent\\s+marker',
            code: '\nfunction square(a: number): number {\n  return a * a;\n}\n',
          },
        ],
      }),
    );

    activate(context, mockClipboard);

    await vscodeMocks.commands.executeCommand('code-fast-llm.applyCodeBlocks');

    expect(vscodeMocks.window.showErrorMessage.calledOnce).toBe(true);
    expect(
      vscodeMocks.window.showErrorMessage.calledWith(
        'Marker "nonexistent\\s+marker" not found in the document.',
      ),
    ).toBe(true);
  });
});
