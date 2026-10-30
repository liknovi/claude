const $=id=>document.getElementById(id),N=STORY.nodes;
let cur=null,typing=null,skip=false,full='',cm=null,cmName='';
const SPR={'Вита':'vita','Константин':'konstantin','Марта':'marta','Лев':'lev','Елена':'elena'};
const SC=['menu','chapters','gallery','chars','settings','game','ending'];
function show(n){SC.forEach(s=>$(s).hidden=s!==n);if(n==='menu')$('continue').disabled=!restore0();if(n==='chapters')drawCh();if(n==='gallery')drawG();if(n==='chars')drawC();if(n==='settings'){$('vm').value=P.vm;$('vs').value=P.vs;$('vt').value=P.vt}}
function restore0(){try{return !!localStorage.getItem(KEY)}catch(e){return false}}
/* audio */
function music(f){if(!f||f===cmName)return;cmName=f;const old=cm,a=new Audio('assets/audio/'+f);a.loop=true;a.volume=0;cm=a;a.play().catch(()=>{});fade(a,P.vm/100*.6);if(old)fade(old,0,()=>old.pause())}
function fade(a,t,done){const i=setInterval(()=>{const d=t-a.volume;if(Math.abs(d)<.02){a.volume=Math.max(0,Math.min(1,t));clearInterval(i);done&&done()}else a.volume=Math.max(0,Math.min(1,a.volume+Math.sign(d)*.02))},60)}
let ac=null;function sfx(f=520){if(!P.vs)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=P.vs/100*.08;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.07)}catch(e){}}
/* game */
function begin(id,fresh){if(fresh)resetRun(id);else S.node=id;show('game');render()}
function render(){const n=N[S.node];if(!n){console.error('node?',S.node);return show('menu')}
 cur=n;P.maxCh=Math.max(P.maxCh,n.ch);P.seen[n.bg]=1;
 $('bg').src='assets/backgrounds/'+n.bg;music(n.music);
 const k=SPR[n.who]||n.sp;$('sprite').innerHTML=k?'<img src="assets/characters/'+k+'_placeholder.svg" alt="">':'';
 $('speaker').textContent=n.who||'';const st=S.stats;$('hud').textContent='Близость '+st.closeness+' · Доверие '+st.trust+' · Решимость '+st.resolve+' · Припасы '+st.resources;
 $('choices').innerHTML='';type(n.text);persist()}
function type(t){clearInterval(typing);full=t;const L=$('line');const read=P.read[S.node];
 if(skip&&read||P.vt==3){L.textContent=t;return done()}
 let i=0;const sp=[60,30,15,6][P.vt];L.textContent='';typing=setInterval(()=>{i+=1;L.textContent=t.slice(0,i);if(i>=t.length){clearInterval(typing);done()}},sp)}
function done(){clearInterval(typing);$('line').textContent=full;const n=cur,c=$('choices');P.read[S.node]=1;c.innerHTML='';
 if(n.choices){const opts=n.choices.filter(o=>!o.if||o.if(S));opts.forEach(o=>{const b=document.createElement('button');b.textContent=o.t;b.onclick=e=>{e.stopPropagation();pick(o)};c.appendChild(b)});if(skip)stopSkip()}
 else if(skip&&P.read[n.next||'']){setTimeout(()=>skip&&go(n),40)}}
function pick(o){sfx(660);Object.entries(o.fx||{}).forEach(([k,v])=>S.stats[k]=Math.max(0,(S.stats[k]||0)+v));(o.flag?[].concat(o.flag):[]).forEach(f=>S.flags[f]=1);
 S.hist.push((cur.who||'')+': '+cur.text+'\n  → '+o.t);if(o.end)return finish(o.end);S.node=o.next;render()}
function go(n){if(n.next){S.node=n.next;render()}else if(n.end)finish(n.end)}
$('dlg').onclick=()=>{if(typing&&$('line').textContent.length<full.length)return done();if(cur&&!cur.choices){sfx(440);go(cur)}};
document.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){if(!$('game').hidden&&!$('modal').hidden===false)$('dlg').click()}});
function stopSkip(){skip=false;$('skip').textContent='Пропуск: выкл.'}
$('skip').onclick=()=>{skip=!skip;$('skip').textContent='Пропуск: '+(skip?'вкл.':'выкл.');if(skip&&P.read[S.node]&&!cur.choices)go(cur)};
function modal(t){$('mtext').textContent=t;$('modal').hidden=false}$('mclose').onclick=()=>$('modal').hidden=true;
$('hist').onclick=()=>modal(S.hist.slice(-40).join('\n\n')||'История пуста');
$('save').onclick=()=>{persist();modal('Сохранено. (Автосохранение работает на каждой реплике.)')};
$('home').onclick=()=>{stopSkip();persist();show('menu')};
function finish(k){stopSkip();const e=STORY.endings[k];P.endings[k]=1;persist();music(e.music);$('etitle').textContent=e.title;$('etext').textContent=e.text(S)+'\n\nИтог: близость '+S.stats.closeness+', доверие '+S.stats.trust+', решимость '+S.stats.resolve+', припасы '+S.stats.resources+'.\nОткрыто финалов: '+Object.keys(P.endings).length+' из 3.';show('ending')}
$('again').onclick=()=>show('menu');
/* menu */
$('start').onclick=()=>begin(STORY.chapters[0].start,true);
$('continue').onclick=()=>{if(restore())begin(S.node,false);else show('menu')};
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
function drawCh(){const l=$('chlist');l.innerHTML='';STORY.chapters.forEach((c,i)=>{const b=document.createElement('button');b.textContent='Глава '+(i+1)+'. '+c.title+(i+1>P.maxCh?' 🔒':'');b.disabled=i+1>P.maxCh;b.onclick=()=>begin(c.start,true);l.appendChild(b)})}
function drawG(){const g=$('glist');g.innerHTML='';STORY.bgs.forEach(([f,t])=>{const d=document.createElement('div'),o=P.seen[f];d.className='card'+(o?'':' lock');d.innerHTML=(o?'<img src="assets/backgrounds/'+f+'" alt="">':'<div style="height:140px;display:grid;place-items:center">🔒</div>')+'<b>'+(o?t:'???')+'</b>';g.appendChild(d)})}
function drawC(){const g=$('clist');g.innerHTML='';STORY.profiles.forEach(p=>{const d=document.createElement('div');d.className='card pr';d.innerHTML='<img src="assets/characters/'+p[0]+'_placeholder.svg" alt=""><b>'+p[1]+'</b><br>'+p[2];g.appendChild(d)})}
$('vm').oninput=e=>{P.vm=+e.target.value;if(cm)cm.volume=P.vm/100*.6;persist()};$('vs').oninput=e=>{P.vs=+e.target.value;sfx();persist()};$('vt').oninput=e=>{P.vt=+e.target.value;persist()};
$('reset').onclick=()=>{if(confirm('Стереть весь прогресс?')){wipe();P.read={};P.seen={};P.endings={};P.maxCh=1;show('menu')}};
try{const x=JSON.parse(localStorage.getItem(KEY));if(x)Object.assign(P,x.P)}catch(e){}
show('menu');
