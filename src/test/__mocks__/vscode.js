"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.Range = exports.Position = exports.WorkspaceEdit = exports.Uri = exports.workspace = exports.commands = exports.window = void 0;
exports.window = {
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
exports.commands = {
    registerCommand: jest.fn(),
    executeCommand: jest.fn(),
};
exports.workspace = {
    applyEdit: jest.fn(),
};
exports.Uri = {
    file: jest.fn(),
};
const WorkspaceEdit = class {
    insert = jest.fn();
    replace = jest.fn();
    delete = jest.fn();
};
exports.WorkspaceEdit = WorkspaceEdit;
const Position = class {
    line;
    character;
    constructor(line, character) {
        this.line = line;
        this.character = character;
    }
};
exports.Position = Position;
const Range = class {
    start;
    end;
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
};
exports.Range = Range;
exports.env = {
    clipboard: {
        readText: jest.fn(),
        writeText: jest.fn(),
    },
};
//# sourceMappingURL=vscode.js.map