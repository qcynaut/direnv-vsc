import * as vscode from 'vscode';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const DIR_ENV_COLLECTION = vscode.window.createTerminalEnvironmentVariableCollection('direnv-vsc');

async function getDirenvEnvironment(cwd: string): Promise<Record<string, string>> {
  const { stdout } = await execFileAsync('direnv', ['export', 'json'], { cwd });
  return JSON.parse(stdout) as Record<string, string>;
}

function applyEnvironment(environment: Record<string, string>): void {
  DIR_ENV_COLLECTION.clear();

  for (const [key, value] of Object.entries(environment)) {
    if (typeof value === 'string') {
      DIR_ENV_COLLECTION.replace(key, value);
    }
  }

  DIR_ENV_COLLECTION.description = 'Managed by direnv-vsc';
  DIR_ENV_COLLECTION.persistent = true;
  DIR_ENV_COLLECTION.applyAtProcessCreation = true;
}

async function reloadDirenv(output: vscode.OutputChannel): Promise<void> {
  const enabled = vscode.workspace.getConfiguration().get<boolean>('direnvVsc.enable', true);
  if (!enabled) {
    DIR_ENV_COLLECTION.clear();
    return;
  }

  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    return;
  }

  try {
    const env = await getDirenvEnvironment(folder.uri.fsPath);
    applyEnvironment(env);
    void vscode.window.setStatusBarMessage('direnv-vsc: environment updated', 3000);
  } catch (error) {
    output.appendLine(`Failed to refresh direnv: ${String(error)}`);
    output.show(true);
    void vscode.window.setStatusBarMessage('direnv-vsc: failed to update environment', 5000);
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('direnv-vsc');

  context.subscriptions.push(
    output,
    DIR_ENV_COLLECTION,
    vscode.commands.registerCommand('direnvVsc.reload', async () => {
      await reloadDirenv(output);
    })
  );

  void reloadDirenv(output);

  const watchEnvrc = vscode.workspace.getConfiguration().get<boolean>('direnvVsc.watchEnvrc', true);
  if (watchEnvrc) {
    const watcher = vscode.workspace.createFileSystemWatcher('**/{.envrc,.env,.env.local}');
    watcher.onDidChange(() => {
      void reloadDirenv(output);
    });
    watcher.onDidCreate(() => {
      void reloadDirenv(output);
    });
    watcher.onDidDelete(() => {
      void reloadDirenv(output);
    });
    context.subscriptions.push(watcher);
  }
}

export function deactivate(): void {
  DIR_ENV_COLLECTION.clear();
}
