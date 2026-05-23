# direnv-vsc

`direnv-vsc` keeps your VS Code terminal environment aligned with `.envrc` by reading `direnv export json` and applying values through the terminal environment collection API.

## Features

- Loads direnv environment values on startup.
- Reload command: **direnv-vsc: Reload direnv**.
- Auto-reload when `.envrc`, `.env`, or `.env.local` changes.
- Uses modern VS Code APIs (`TerminalEnvironmentVariableCollection`) for compatibility with current VS Code versions.

## Requirements

- [`direnv`](https://direnv.net/) must be installed and available in `PATH`.
- `.envrc` must be allowed (`direnv allow`).

## Extension Settings

- `direnvVsc.enable`: Enable or disable extension behavior.
- `direnvVsc.watchEnvrc`: Watch env files and auto-reload.

## CI and Release

- CI runs lint, compile, package, and smoke tests on pull requests and pushes.
- Tag releases with semantic versions (for example `v0.1.0`) to trigger automated VSIX packaging and GitHub Releases.
- Set repository secret `VSCE_PAT` to enable Visual Studio Marketplace publishing in the release workflow.

## Notes

This project is inspired by the older unmaintained extension at <https://codeberg.org/mkhl/vscode-direnv> and updated for current VS Code APIs and tooling.
