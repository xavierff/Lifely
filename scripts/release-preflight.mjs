import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {catalogAudit} from './audit-catalog.mjs';
export function releasePreflight(){
 const config=JSON.parse(readFileSync(new URL('../app.json',import.meta.url),'utf8')).expo;
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
 assert.equal(config.version,pkg.version,'App/package marketing version mismatch');
 assert.match(config.ios.buildNumber,/^[1-9]\d*$/);
 assert.equal(Number(config.ios.buildNumber),config.android.versionCode,'Native build numbers mismatch');
 assert.equal(config.ios.bundleIdentifier,'com.xavierff.lifely');
 assert.equal(config.android.package,'com.xavierff.lifely');
 for(const path of [config.icon,config.android.adaptiveIcon.foregroundImage])assert.ok(existsSync(new URL('../'+path.replace(/^\.\//,''),import.meta.url)),'Missing icon: '+path);
 const audit=catalogAudit();assert.ok(Object.values(audit.duplicateIds).every(x=>x.length===0));assert.equal(audit.invalidScenarios.length,0);
 assert.ok(audit.counts.scenarioCards>=1000&&audit.counts.regularCareers>=150&&audit.counts.achievements>=100&&audit.counts.challenges>=50);
 return {version:config.version,build:Number(config.ios.buildNumber),ios:config.ios.bundleIdentifier,android:config.android.package,catalog:audit.counts,scope:'Source and runtime catalog only; signing, native install, store review and human playtesting are separate gates.'};
}
if(process.argv[1]?.endsWith('release-preflight.mjs'))console.log(JSON.stringify(releasePreflight(),null,2));
