## Features

This extension provides ability to easily get sharable URLs for git files (as of 0.0.1 release the git provider is limited to [Azure Repos](https://azure.microsoft.com/en-us/services/devops/repos/) only)

- Copy (or open) url of active `Editor` document
- Copy a markdown version of active `Editor` document (for sharing with eg Teams)
- Copy url for selected text in active `Editor` document
- Copy (or open) url of selected file/directory in `File Explorer`
- Copy (or open) url of selected tab in `Editor`

## Requirements

You must not disable built-in `Git` extension (which is enabled by default) or you will get following prompt ![require-git-extension](images/require-git-extension.png)

## Extension Settings

This extension contributes the following settings:

- `shareGitFile.enableMarkdownSupport`: enable/disable `Copy markdown` support, default on

## Known Issues

- As of release 0.0.1
  - No testing has been performed on non-Windows platform although it should just work
  - Git provider is limited to [Azure Repos](https://azure.microsoft.com/en-us/services/devops/repos/) only)

## Release Notes

### 0.0.1

Initial release of share git url extension supporting Azure Repos only

---
