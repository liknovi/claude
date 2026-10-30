const KEY='lastSignal.v2';
const S={node:null,stats:{closeness:0,trust:0,resolve:0,resources:0},flags:{},hist:[]};
const P={read:{},seen:{},endings:{},maxCh:1,vm:40,vs:60,vt:2};
function resetRun(id){S.node=id;S.stats={closeness:0,trust:0,resolve:0,resources:0};S.flags={};S.hist=[]}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({S,P}))}catch(e){}}
function restore(){try{const x=JSON.parse(localStorage.getItem(KEY));if(!x)return false;Object.assign(S,x.S);Object.assign(P,x.P);return !!S.node}catch(e){return false}}
function wipe(){try{localStorage.removeItem(KEY)}catch(e){}}
