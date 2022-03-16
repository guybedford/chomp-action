const core = require('@actions/core');
const { execSync } = require('child_process');
const { readFile, writeFile } = require('fs/promises');
const { mkdirSync } = require('fs');
const { gunzipSync } = require('zlib');
const path = require('path');

(async () => {
  const { default: fetch } = await import('node-fetch');
  let version = (core.getInput('version') || '').trim();

  if (!version) {
    const res = await fetch(`https://api.github.com/repos/guybedford/chomp/releases/latest`);
    if (!res.ok)
      throw new Error(`Unable to lookup version - ${res.status}`);
    const { name } = await res.json();
    version = name;
  }

  const os = (process.env.RUNNER_OS || (process.platform === 'win32' ? 'windows' : 'linux')).toLowerCase();
  if (os !== 'macos' && os !== 'windows' && os !== 'linux')
    throw new Error(`Unknown OS or unable to determine architecture (${process.env.RUNNER_OS})`);

  const ext = os === 'windows' ? '.zip' : '.tar.gz';

  const url = `https://github.com/guybedford/chomp/releases/download/${version}/chomp-${os}-${version}${ext}`;
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Bad response downloading ${url} - ${res.status}`);

  let buffer = Buffer.from(await res.arrayBuffer());

  if (os !== 'windows') {
    buffer = gunzipSync(buffer);
  }

  await writeFile(`../chomp-${version}${os === 'windows' ? '.zip' : '.tar'}`, buffer);

  if (os === 'windows') {
    execSync(`powershell.exe "Expand-Archive ../chomp-${version}.zip ../chomp-${version}"`);
  } else {
    mkdirSync(`../chomp-${version}`);
    execSync(`tar -xf ../chomp-${version}.tar -C ../chomp-${version}`);
  }

  const githubPath = await readFile(process.env.GITHUB_PATH, 'utf8');
  await writeFile(process.env.GITHUB_PATH, path.resolve(`../chomp-${version}`) + (os === 'windows' ? ';' : ':') + githubPath);

})().catch(error => {
  console.error(error);
  core.setFailed(error.message);
});
