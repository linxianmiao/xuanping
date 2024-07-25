#!/usr/bin/env zx
import { spawnSync } from 'child_process'

const isExistBuild = await fs.pathExistsSync('build')
const isExistDist = await fs.pathExistsSync('dist')
if (isExistBuild) await $`rm -rf build`
if (isExistDist) await $`rm -rf dist`

await spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build:widget'], {
  stdio: [0, 1, 2]
})
await $`mv build dist`
await spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build:web'], {
  stdio: [0, 1, 2]
})
await $`rm dist/*.html`
await $`cp -r -f dist/* build`
await $`rm -rf dist`
