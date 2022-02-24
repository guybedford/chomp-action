const core = require('@actions/core');
const { execSync } = require('child_process');
const { readFile, writeFile } = require('fs/promises');
const path = require('path');

(async () => {
  const { default: fetch } = await import('node-fetch');
  const version = (core.getInput('version') || '').trim() || '0.1.8';

  const os = (process.env.RUNNER_OS || 'windows').toLowerCase();
  if (os !== 'macos' && os !== 'windows' && os !== 'linux')
    throw new Error(`Unknown OS or unable to determine architecture (${process.env.RUNNER_OS})`);

  const ext = os === 'windows' ? '.zip' : '.tar.gz';

  const url = `https://github.com/guybedford/chomp/releases/download/${version}/chomp-${os}-${version}${ext}`;
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Bad response downloading ${url} - ${res.status}`);

  const buffer = await res.arrayBuffer();
  await writeFile(`chomp-${version}${ext}`, Buffer.from(buffer));

  if (os === 'windows') {
    execSync(`powershell.exe "Expand-Archive chomp-${version}${ext}"`);
  } else {
    execSync('gunzip chomp-${version}${ext}');
    execSync('tar -xz chomp-${version}.tar');
  }

  const githubPath = await readFile(process.env.GITHUB_PATH, 'utf8');
  await writeFile(process.env.GITHUB_PATH, path.resolve(`chomp-${version}`) + (os === 'windows' ? ';' : ':') + githubPath);

})().catch(error => {
  console.error(error);
  core.setFailed(error.message);
});
