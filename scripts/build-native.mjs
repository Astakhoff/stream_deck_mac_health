import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(process.platform!=='darwin') throw new Error('Build the universal macOS helper on macOS with Xcode Command Line Tools.');
function run(cmd,args){const r=spawnSync(cmd,args,{cwd:root,stdio:'inherit'});if(r.error)throw r.error;if(r.status)throw new Error(`${cmd} failed (${r.status})`);}
const binary='com.astakhoff.mac-health.sdPlugin/bin/mac-health';
run('/usr/bin/xcrun',['clang','-O2','-Wall','-Wextra','-Werror','-arch','arm64','-arch','x86_64','-mmacosx-version-min=13.0','native/mac-health.c','-o',binary]);
run('/usr/bin/codesign',['--force','--sign','-',binary]);
run('/usr/bin/lipo',['-info',binary]);
