# chomp-action

GitHub Action to Install Chomp

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
      with:
        version: 0.1.8
    - name: Run Tests
      run: chomp test
```
