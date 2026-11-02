import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const name='com.astakhoff.mac-health.sdPlugin';
const plugin=path.join(root,name),dist=path.join(root,'dist');
await fs.access(path.join(plugin,'bin/mac-health'));
await fs.access(path.join(plugin,'node_modules/@elgato/streamdeck/package.json'));
await fs.mkdir(dist,{recursive:true});
const manifestPath=path.join(plugin,'manifest.json');const original=await fs.readFile(manifestPath);
try{
 const r=spawnSync(path.join(root,'node_modules/.bin/streamdeck'),['pack',name,'--output','dist','--force','--no-file-list'],{cwd:root,stdio:'inherit'});
 if(r.error)throw r.error;if(r.status)throw new Error('Elgato packaging failed');
}finally{await fs.writeFile(manifestPath,original);}
const bytes=await fs.readFile(path.join(dist,'com.astakhoff.mac-health.streamDeckPlugin'));
const {createHash}=await import('node:crypto');
await fs.writeFile(path.join(dist,'SHA256SUMS.txt'),createHash('sha256').update(bytes).digest('hex')+'  com.astakhoff.mac-health.streamDeckPlugin\n');
