import * as sinon from 'sinon';

export const createMockVscode = (sandbox: sinon.SinonSandbox) => {
  const clipboard = { readText: sandbox.stub(), writeText: sandbox.stub() };
  const editor = {
    document: {
      getText: sandbox.stub(),
      positionAt: sandbox.stub(),
      uri: { path: '/fake/path/to/file' },
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

  return {
    env: { clipboard },
    commands: {
      registerCommand: sandbox
        .stub()
        .callsFake(() => ({ dispose: sandbox.stub() })),
      executeCommand: sandbox.stub(),
    },
    window: {
      activeTextEditor: editor,
      showErrorMessage: sandbox.stub(),
      showInformationMessage: sandbox.stub(),
    },
    workspace: { applyEdit: sandbox.stub().resolves(true) },
    Range: class {
      constructor(
        public start: any,
        public end: any,
      ) {}
    },
    Position: class {
      constructor(
        public line: number,
        public character: number,
      ) {}
    },
    Uri: {
      file: (path: string) => ({ path }),
    },
    WorkspaceEdit: class {
      insert = sandbox.spy();
      replace = sandbox.spy();
      delete = sandbox.spy();
    },
  };
};
