import * as vscode from 'vscode';
import { CodeResponse } from './types.js';

let commandDisposable: vscode.Disposable | undefined;

console.log('init');

export function activate(
  context: vscode.ExtensionContext,
  clipboard: { readText: () => Thenable<string | undefined> } = vscode.env
    .clipboard,
) {
  console.log('active');

  if (!commandDisposable) {
    const applyCodeBlocksCommand = vscode.commands.registerCommand(
      'code-fast-llm.applyCodeBlocks',
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          console.error('No active editor found');
          return vscode.window.showErrorMessage('No active editor found');
        }

        const document = editor.document;
        const text = document.getText();
        console.log('Current document text:', text);

        const clipboardText = await clipboard.readText();
        console.log('Original Clipboard text:', clipboardText);

        if (!clipboardText) {
          console.error('Clipboard text is undefined');
          return vscode.window.showErrorMessage('Clipboard text is undefined');
        }

        // Regular expression to check for the presence of "id":"cfllm" within the first 40 characters
        const idPattern = /"id"\s*:\s*"cfllm"/;
        const first40Chars = clipboardText.substring(0, 40);
        if (!idPattern.test(first40Chars)) {
          console.log(
            'Clipboard text does not contain "id":"cfllm" within the first 40 characters. Performing normal paste.',
          );
          // Execute the default paste command
          await vscode.commands.executeCommand(
            'editor.action.clipboardPasteAction',
          );
          return;
        }

        let codeResponse: CodeResponse;
        try {
          codeResponse = JSON.parse(clipboardText);
          console.log('Parsed JSON:', codeResponse);
        } catch (e) {
          console.error('Invalid JSON format:', e);
          vscode.window.showErrorMessage('Invalid JSON format');
          return;
        }

        const edit = new vscode.WorkspaceEdit();

        const findMarkerPosition = (
          marker: string,
          after: boolean = true,
        ): number => {
          const regex = new RegExp(marker);
          const match = regex.exec(text);
          if (!match) {
            throw new Error(`Marker "${marker}" not found in the document.`);
          }
          const index = match.index;
          return after ? index + match[0].length : index;
        };

        codeResponse.codeBlocks.forEach((block) => {
          let startPosition: number;
          let endPosition: number;

          try {
            if (typeof block.start === 'string') {
              startPosition = findMarkerPosition(block.start, true);
            } else {
              startPosition = block.start;
            }

            if (typeof block.end === 'string') {
              endPosition = findMarkerPosition(block.end, false);
            } else if (block.end !== undefined) {
              endPosition = block.end;
            } else {
              endPosition = startPosition;
            }
          } catch (error: any) {
            console.error(error?.message);
            vscode.window.showErrorMessage(error?.message);
            return;
          }

          const start = document.positionAt(startPosition);
          const end = document.positionAt(endPosition);

          if (block.type === 'add') {
            console.log(`Inserting code at position ${startPosition}`);
            edit.insert(document.uri, start, block.code || '');
          } else if (block.type === 'replace') {
            console.log(
              `Replacing code from position ${startPosition} to ${endPosition}`,
            );
            edit.replace(
              document.uri,
              new vscode.Range(start, end),
              block.code || '',
            );
          } else if (block.type === 'delete') {
            console.log(
              `Deleting code from position ${startPosition} to ${endPosition}`,
            );
            edit.delete(document.uri, new vscode.Range(start, end));
          }
        });

        vscode.workspace.applyEdit(edit).then((success) => {
          console.log('apply edits');
          if (success) {
            vscode.window.showInformationMessage(
              'Code blocks applied successfully',
            );
          } else {
            vscode.window.showErrorMessage('Failed to apply code blocks');
          }
        });
      },
    );

    commandDisposable = applyCodeBlocksCommand;
    context.subscriptions.push(commandDisposable);
  }
}

export function deactivate() {
  if (commandDisposable) {
    commandDisposable.dispose();
  }
}
