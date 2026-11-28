// Local-only validated recovery. The storage adapter is AsyncStorage in the app.
export function parseValidated(raw,validate){if(typeof raw!=='string'||!raw)return null;try{const value=JSON.parse(raw);return validate(value)?value:null;}catch{return null;}}
export async function readLifeSlot(storage,key,validate){
 const primary=await storage.getItem(key),g=parseValidated(primary,validate);
 if(g)return {game:g,source:'primary',invalid:false};
 const staged=await storage.getItem(key+'.pending'),candidate=parseValidated(staged,validate);
 if(candidate)return {game:candidate,source:'pending',invalid:false};
 const backup=await storage.getItem(key+'.backup'),previous=parseValidated(backup,validate);
 if(previous)return {game:previous,source:'backup',invalid:false,primaryMissing:primary===null||primary===undefined};
 return {game:null,source:null,invalid:[primary,staged,backup].some(v=>v!==null&&v!==undefined)};
}
export async function writeLifeSlot(storage,key,game,validate,{replace=false}={}){
 const raw=JSON.stringify(game);
 if(!parseValidated(raw,validate))throw Error('Cannot write an invalid life.');
 const old=await storage.getItem(key);
 // Stage the validated candidate before replacing anything. A failed write never destroys a valid previous backup.
 await storage.setItem(key+'.pending',raw);
 if(!replace&&parseValidated(old,validate))await storage.setItem(key+'.backup',old);
 await storage.setItem(key,raw);
 if(await storage.getItem(key)!==raw)throw Error('Save verification failed.');
 // An intentional replacement must not retain the previous life as the ordinary backup.
 if(replace)await storage.removeItem(key+'.backup');
 await storage.removeItem(key+'.pending');
}
export function recoveryMessage(result){
 if(result.source==='pending')return 'Recovered an interrupted local save. Use Save now to repair the slot.';
 if(result.source==='backup')return result.primaryMissing?'Primary save missing. Recovered the previous local backup. Use Save now to repair.':'Primary save damaged. Recovered the previous local backup. Use Save now to repair.';
 if(result.invalid)return 'Save could not be validated. It remains until you explicitly replace this slot.';
 return '';
}
