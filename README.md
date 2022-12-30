# chomp-action

GitHub Action to Install Chomp

The `GITHUB_TOKEN` env var is required for the GitHub API lookup for the Chomp release version.

## Input Variables

Optional:

* `version`: Chomp version to install.

## Usage

```yaml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-ubuntu:
    name: Test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Chomp
      uses: guybedford/chomp-action@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    - name: Run Tests
      run: chomp test
```
