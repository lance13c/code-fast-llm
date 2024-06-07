import * as sinon from 'sinon';
import * as vscode from 'vscode';

export function createMockExtensionContext(): vscode.ExtensionContext {
  return {
    subscriptions: [],
    workspaceState: {
      get: sinon.stub(),
      update: sinon.stub(),
    } as unknown as vscode.Memento,
    globalState: {
      get: sinon.stub(),
      update: sinon.stub(),
      setKeysForSync: sinon.stub(),
    } as unknown as vscode.Memento,
    secrets: {
      store: sinon.stub(),
      get: sinon.stub(),
      delete: sinon.stub(),
      onDidChange: sinon.stub(),
    },
    extensionUri: vscode.Uri.file('/path/to/extension'),
    extensionMode: vscode.ExtensionMode.Test,
    extensionPath: '/path/to/extension',
    environmentVariableCollection: {
      replace: sinon.stub(),
      append: sinon.stub(),
      prepend: sinon.stub(),
      get: sinon.stub(),
      clear: sinon.stub(),
      persistent: false,
      description: '',
      getScoped: sinon.stub(),
      forEach: sinon.stub(),
      delete: sinon.stub(),
      [Symbol.iterator]: sinon.stub(),
    } as unknown as vscode.EnvironmentVariableCollection,
    storageUri: vscode.Uri.file('/path/to/storage'),
    globalStorageUri: vscode.Uri.file('/path/to/globalStorage'),
    logUri: vscode.Uri.file('/path/to/logs'),
    extension: {} as any,
    asAbsolutePath: sinon.stub().returns('/path/to/somewhere'),
    storagePath: '/path/to/storagePath',
    globalStoragePath: '/path/to/globalStoragePath',
    logPath: '/path/to/logPath',
    secretsPath: '/path/to/secretsPath',
    languageModelAccessInformation: {
      currentLanguageId: sinon.stub().returns('typescript'),
      getLanguageServerPath: sinon.stub(),
    },
  } as unknown as vscode.ExtensionContext;
}
