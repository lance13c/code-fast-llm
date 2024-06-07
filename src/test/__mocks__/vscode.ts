export const window = {
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  activeTextEditor: {
    document: {
      getText: jest.fn(),
      positionAt: jest.fn(),
      uri: { path: 'fake-path' },
    },
    edit: jest.fn(),
  },
};

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn(),
};

export const workspace = {
  applyEdit: jest.fn(),
};

export const Uri = {
  file: jest.fn(),
};

export const WorkspaceEdit = class {
  insert = jest.fn();
  replace = jest.fn();
  delete = jest.fn();
};

export const Position = class {
  constructor(
    public line: number,
    public character: number,
  ) {}
};

export const Range = class {
  constructor(
    public start: any,
    public end: any,
  ) {}
};

export const env = {
  clipboard: {
    readText: jest.fn(),
    writeText: jest.fn(),
  },
};
