import assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { activate, deactivate } from '../extension';
import { createMockExtensionContext } from './mockExtensionContext';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  let sandbox: sinon.SinonSandbox;
  let context: vscode.ExtensionContext;
  let mockClipboard: { readText: sinon.SinonStub };
  let registerCommandSpy: sinon.SinonSpy;

  setup(() => {
    sandbox = sinon.createSandbox();
    context = createMockExtensionContext();
    mockClipboard = { readText: sandbox.stub() };

    registerCommandSpy = sandbox.spy(vscode.commands, 'registerCommand');
  });

  teardown(() => {
    deactivate();
    sandbox.restore();
  });

  test('should activate extension', async () => {
    activate(context, mockClipboard);
    assert.strictEqual(registerCommandSpy.calledOnce, true);
  });

  test('should parse valid clipboard JSON and apply edits', async () => {
    const editorStub = sandbox.stub(vscode.window, 'activeTextEditor').get(() => ({
      document: {
        getText: () => `
          function greet(name: string): string {
            return \`Hello, \${name}!\`;
          }
          function add(a: number, b: number): number {
            return a + b;
          }
        `,
        positionAt: (offset: number) => new vscode.Position(0, 0),
        uri: vscode.Uri.file('/fake/path/to/file')
      },
      edit: (callback: any) => {
        const editBuilder = {
          insert: sandbox.spy(),
          replace: sandbox.spy(),
          delete: sandbox.spy()
        };
        callback(editBuilder);
        return Promise.resolve(true);
      }
    }));

    mockClipboard.readText.resolves(JSON.stringify({
      id: 'cfllm',
      codeBlocks: [
        {
          type: 'add',
          start: 'function\\s+greet\\s*\\(name:\\s*string\\):\\s*string\\s*\\{',
          code: '\nfunction square(a: number): number {\n  return a * a;\n}\n'
        },
        {
          type: 'replace',
          start: 'console\\.log\\(add\\(2,\\s*3\\)\\);',
          end: 'console\\.log\\(add\\(2,\\s*3\\)\\);',
          code: 'console.log(square(5));'
        }
      ]
    }));

    activate(context, mockClipboard);

    await vscode.commands.executeCommand('code-fast-llm.applyCodeBlocks');

    assert(editorStub.calledOnce);
    assert(mockClipboard.readText.calledOnce);
  });

  test('should handle invalid JSON format in clipboard', async () => {
    sandbox.stub(vscode.window, 'activeTextEditor').get(() => ({
      document: {
        getText: () => `
          function greet(name: string): string {
            return \`Hello, \${name}!\`;
          }
          function add(a: number, b: number): number {
            return a + b;
          }
        `
      }
    }));

    mockClipboard.readText.resolves('{ invalid json }');

    const showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');

    activate(context, mockClipboard);

    await vscode.commands.executeCommand('code-fast-llm.applyCodeBlocks');

    assert(showErrorMessageStub.calledOnce);
    assert(showErrorMessageStub.calledWith('Invalid JSON format'));
  });

  test('should handle marker not found error', async () => {
    sandbox.stub(vscode.window, 'activeTextEditor').get(() => ({
      document: {
        getText: () => `
          function greet(name: string): string {
            return \`Hello, \${name}!\`;
          }
          function add(a: number, b: number): number {
            return a + b;
          }
        `
      }
    }));

    mockClipboard.readText.resolves(JSON.stringify({
      id: 'cfllm',
      codeBlocks: [
        {
          type: 'add',
          start: 'nonexistent\\s+marker',
          code: '\nfunction square(a: number): number {\n  return a * a;\n}\n'
        }
      ]
    }));

    const showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');

    activate(context, mockClipboard);

    await vscode.commands.executeCommand('code-fast-llm.applyCodeBlocks');

    assert(showErrorMessageStub.calledOnce);
    assert(showErrorMessageStub.calledWith('Marker "nonexistent\\s+marker" not found in the document.'));
  });
});
