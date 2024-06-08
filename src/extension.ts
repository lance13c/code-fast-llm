import * as vscode from 'vscode';
import * as YAML from 'yaml';
import { z } from 'zod';

let commandDisposable: vscode.Disposable | undefined;
let bypassPasteDisposable: vscode.Disposable | undefined;

const CodeBlockSchema = z.object({
  type: z.enum(['add', 'replace', 'delete']),
  start: z.string(),
  end: z.string().optional(),
  newCode: z.string().optional(),
});

const CodeResponseSchema = z.object({
  cfllm: z.boolean(),
  file: z.string(),
  codeBlocks: z.array(CodeBlockSchema),
});

type CodeBlock = z.infer<typeof CodeBlockSchema>;
type CodeResponse = z.infer<typeof CodeResponseSchema>;

export function activate(
  context: vscode.ExtensionContext,
  clipboard: { readText: () => Thenable<string | undefined> } = vscode.env
    .clipboard,
) {
  console.log('Extension activated');

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
      console.log('Current document text length:', text.length);

      const clipboardText = await clipboard.readText();
      console.log('Clipboard text:', clipboardText);

      if (!clipboardText) {
        console.error('Clipboard text is undefined');
        return vscode.window.showErrorMessage('Clipboard text is undefined');
      }

      let yamlData: CodeResponse;
      try {
        yamlData = YAML.parse(clipboardText);
        console.log('Parsed YAML:', yamlData);
      } catch (e) {
        console.error('Invalid YAML format:', e);
        vscode.window.showErrorMessage('Invalid YAML format');
        return;
      }

      if (!yamlData.cfllm) {
        console.log(
          'Clipboard text does not contain "cfllm: true". Performing normal paste.',
        );
        await vscode.commands.executeCommand(
          'editor.action.clipboardPasteAction',
        );
        return;
      }

      const codeBlocks = yamlData.codeBlocks;
      console.log('Extracted Code Blocks:', codeBlocks);

      const edit = new vscode.WorkspaceEdit();

      const findMarkerPosition = (
        marker: string,
        after: boolean = true,
      ): number => {
        const index = text.indexOf(marker);
        if (index === -1) {
          console.error(`Marker "${marker}" not found in the document.`);
          console.log(`Document text length: ${text.length}`);
          console.log(`Document text: ${text}`);
          console.log(
            `Potential mismatches around the marker: "${marker}"\n`,
            `Context before marker: "${text.slice(
              Math.max(0, text.indexOf(marker) - 30),
              text.indexOf(marker),
            )}"\n`,
            `Context after marker: "${text.slice(
              text.indexOf(marker) + marker.length,
              text.indexOf(marker) + marker.length + 30,
            )}"`,
          );
          throw new Error(`Marker "${marker}" not found in the document.`);
        }
        console.log(`Marker "${marker}" found at position: ${index}`);
        return after ? index + marker.length : index;
      };

      codeBlocks.forEach((block) => {
        let startPosition: number;
        let endPosition: number;

        try {
          startPosition = findMarkerPosition(block.start, true);
          endPosition = block.end
            ? findMarkerPosition(block.end, false)
            : startPosition;
        } catch (error: any) {
          console.error(error.message);
          vscode.window.showErrorMessage(error.message);
          return;
        }

        const start = document.positionAt(startPosition);
        const end = document.positionAt(endPosition);
        const surroundingText = text.substring(
          Math.max(0, startPosition - 10),
          Math.min(text.length, endPosition + 10),
        );

        console.log(`Block type: ${block.type}`);
        console.log(
          `Start position: ${startPosition} (line ${start.line}, character ${start.character})`,
        );
        console.log(
          `End position: ${endPosition} (line ${end.line}, character ${end.character})`,
        );
        console.log(
          `Text to replace: "${text.substring(startPosition, endPosition)}"`,
        );
        console.log(`Surrounding text: "${surroundingText}"`);

        if (block.type === 'add') {
          console.log(`Inserting code at position ${startPosition}`);
          edit.insert(document.uri, start, block.newCode || '');
        } else if (block.type === 'replace') {
          console.log(
            `Replacing code from position ${startPosition} to ${endPosition}`,
          );
          edit.replace(
            document.uri,
            new vscode.Range(start, end),
            block.newCode || '',
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

  const bypassPasteCommand = vscode.commands.registerCommand(
    'code-fast-llm.bypassPaste',
    async () => {
      await vscode.commands.executeCommand(
        'editor.action.clipboardPasteAction',
      );
    },
  );

  bypassPasteDisposable = bypassPasteCommand;
  context.subscriptions.push(bypassPasteDisposable);
}

export function deactivate() {
  if (commandDisposable) {
    commandDisposable.dispose();
  }
  if (bypassPasteDisposable) {
    bypassPasteDisposable.dispose();
  }
}
