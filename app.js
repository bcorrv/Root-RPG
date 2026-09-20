(() => {
  const KEY='rootRpg_v04';
  const LEGACY=['rootRpg_v03','rootRpg_v02','rootSandboxCompanion_v02','rootSandbox_v01'];

  const ICONS={
    move:'move',observe:'eye',talk:'chat',investigate:'search',trade:'coin',infiltrate:'key',
    combat:'sword',explore:'torch',help:'handshake',craft:'hammer',rest:'rest',free:'spark'
  };

  const ACTIONS=[
    {id:'move',label:'Mover',cost:1,tone:'special'},
    {id:'observe',label:'Observar',cost:1},
    {id:'talk',label:'Hablar',cost:1},
    {id:'investigate',label:'Investigar',cost:1},
    {id:'trade',label:'Comerciar',cost:1},
    {id:'infiltrate',label:'Infiltrar',cost:1},
    {id:'combat',label:'Combatir',cost:1,tone:'danger'},
    {id:'explore',label:'Explorar',cost:1},
    {id:'help',label:'Apoyar facción',cost:1},
    {id:'craft',label:'Fabricar / reparar',cost:1},
    {id:'rest',label:'Descansar',cost:2},
    {id:'free',label:'Acción libre',cost:1}
  ];

  const ITEM_DEF={
    sword:{name:'Espada',icon:'sword',info:'Ataque +1 · técnicas de combate'},
    boot:{name:'Bota',icon:'boot',info:'Huida · movilidad'},
    torch:{name:'Antorcha',icon:'torch',info:'Acceso a ruinas'},
    hammer:{name:'Martillo',icon:'hammer',info:'Fabricar y reparar'},
    crossbow:{name:'Ballesta',icon:'crossbow',info:'Ataques a distancia'},
    tea:{name:'Té',icon:'rest',info:'Recuperación rápida'},
    coin:{name:'Moneda',icon:'coin',info:'Comercio, sobornos, favores'},
    bag:{name:'Bolsa',icon:'bag',info:'Capacidad adicional'}
  };

  const FACTIONS={
    Marquesado:{icon:'faction-cat',className:'cat',color:'var(--cat)',outcomes:['Batalló','Reclutó','Construyó','Movió','Ganó territorio','Perdió territorio']},
    Eyrie:{icon:'faction-bird',className:'bird',color:'var(--bird)',outcomes:['Batalló','Reclutó','Construyó','Movió','Ganó territorio','Perdió territorio']},
    Alianza:{icon:'faction-alliance',className:'alliance',color:'var(--alliance)',outcomes:['Extendió simpatía','Revuelta','Reclutó','Movilizó','Ganó territorio','Perdió territorio']}
  };

  const SUITS={
    mouse:{name:'Ratón',icon:'suit-mouse'},
    rabbit:{name:'Conejo',icon:'suit-rabbit'},
    fox:{name:'Zorro',icon:'suit-fox'},
    bird:{name:'Ave',icon:'suit-bird'}
  };

  const STATES=[
    {name:'Alerta',icon:'alert'},
    {name:'Bloqueo',icon:'lock'},
    {name:'Tensión',icon:'sword'},
    {name:'Escasez',icon:'bread'},
    {name:'Fortificado',icon:'shield'},
    {name:'Revuelta',icon:'leaf'},
    {name:'Caos',icon:'flame'}
  ];

  const LANDMARK_DEF=[
    {id:'forge',name:'Forja Legendaria',icon:'forge',description:'Artesanía, reparación y mejoras de equipo.',services:['Reparar','Fabricar','Mejorar']},
    {id:'market',name:'Mercado Negro',icon:'market',description:'Información, objetos, favores y contactos discretos.',services:['Comerciar','Información','Contacto']},
    {id:'ruins',name:'Ciudad Perdida',icon:'ruins',description:'Reliquias, rutas olvidadas y secretos bajo el bosque.',services:['Explorar','Reliquia','Pasaje']},
    {id:'tree',name:'Árbol Ancestral',icon:'tree',description:'Refugio neutral, descanso y mediación.',services:['Descansar','Rumores','Mediar']}
  ];

  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
  const ico=(id,cls='')=>`<svg class="ico ${cls}"><use href="./icons.svg#${id}"></use></svg>`;

  function fresh(){
    return {
      version:'0.4',
      onboarded:false,
      playerName:'',
      campaign:'Crónicas del Bosque',
      day:1,time:0,phase:'player',
      actions:[],
      character:{archetype:'Pícaro',level:1,xp:0,hp:3,maxHp:3,clear:'',skills:{Sigilo:1,Engaño:1,Combate:0,Supervivencia:0},opportunistReady:true},
      inventory:{sword:1,boot:1,torch:0,hammer:0,crossbow:0,tea:0,coin:3,bag:0},
      reputations:{Marquesado:0,Eyrie:0,Alianza:0},
      bots:{Marquesado:true,Eyrie:true,Alianza:false},
      world:{day:1,resolved:{Marquesado:false,Eyrie:false,Alianza:false},records:{}},
      orderHistory:[],
      states:[],
      rumors:[],
      missions:[],
      landmarks:LANDMARK_DEF.map(x=>({...x,level:0,clear:''})),
      log:[]
    };
  }

  function migrate(old){
    const n=fresh();
    if(!old) return n;
    n.day=old.day||1;n.time=old.time||0;n.phase=old.phase||'player';
    n.onboarded=!!old.onboarded;n.playerName=old.playerName||'';n.campaign=old.campaign||n.campaign;
    const c=old.character||old.char||{};
    n.character.level=c.level||1;n.character.xp=c.xp||0;n.character.hp=Number.isFinite(c.hp)?c.hp:3;n.character.maxHp=c.maxHp||3;
    n.character.clear=c.clear||'';n.character.skills=c.skills||n.character.skills;n.character.opportunistReady=c.opportunistReady!==false;
    const oldInv=old.inventory||old.inv||{};
    const map={'⚔️ Espada':'sword','👢 Bota':'boot','🔥 Antorcha':'torch','🔨 Martillo':'hammer','🏹 Ballesta':'crossbow','🍵 Té':'tea','🪙 Moneda':'coin','🎒 Bolsa':'bag'};
    Object.entries(oldInv).forEach(([k,v])=>{if(n.inventory[k]!==undefined)n.inventory[k]=v;else if(map[k])n.inventory[map[k]]=v});
    n.reputations=old.reputations||old.rep||n.reputations;
    n.bots=old.bots||n.bots;
    n.states=Array.isArray(old.states)?old.states.map(s=>({clear:String(s.clear||''),name:s.name||'Alerta'})):[];
    n.rumors=Array.isArray(old.rumors)?old.rumors.map(r=>({id:r.id||uid(),day:r.day||1,suit:normalizeSuit(r.suit),origin:r.origin||'Mundo',text:r.text||'',seed:r.seed||null})):[];
    n.missions=Array.isArray(old.missions)?old.missions:[];
    n.orderHistory=Array.isArray(old.orderHistory)?old.orderHistory:[];
    n.log=Array.isArray(old.log)?old.log.map(x=>({day:x.day||1,text:x.text||String(x),icon:x.icon||x.iconId||'scroll'})):[];
    n.actions=Array.isArray(old.actions)?old.actions.map(a=>({day:a.day||1,label:a.label||a.text||'Acción',icon:a.iconId||normalizeActionIcon(a.icon)||'spark',cost:a.cost||0,clear:a.clear||'',meta:a.meta||a.note||''})):[];
    if(Array.isArray(old.landmarks)){
      n.landmarks=LANDMARK_DEF.map(base=>{
        const found=old.landmarks.find(x=>String(x.name||'').toLowerCase().includes(base.name.toLowerCase().split(' ')[0])) || old.landmarks.find(x=>x.id===base.id);
        return found?{...base,level:found.level||0,clear:found.clear||''}:{...base,level:0,clear:''};
      });
    }
    if(!n.playerName) n.onboarded=false;
    return n;
  }

  function normalizeSuit(s){
    if(SUITS[s]) return s;
    const m={'🐭':'mouse','🐰':'rabbit','🦊':'fox','🐦':'bird'};
    return m[s]||'bird';
  }
  function normalizeActionIcon(x){
    const m={'🥾':'move','👁️':'eye','💬':'chat','🔎':'search','🪙':'coin','🗝️':'key','⚔️':'sword','🔥':'torch','🤝':'handshake','🔨':'hammer','🍵':'rest','✨':'spark'};
    return m[x]||x;
  }

  let S;
  try{
    S=JSON.parse(localStorage.getItem(KEY));
    if(!S){
      for(const k of LEGACY){
        const old=JSON.parse(localStorage.getItem(k));
        if(old){S=migrate(old);break}
      }
    }
    if(!S)S=fresh();
  }catch(_){S=fresh()}

  const sheet={bg:$('#sheetBackdrop'),title:$('#sheetTitle'),sub:$('#sheetSub'),content:$('#sheetContent')};

  function save(){
    localStorage.setItem(KEY,JSON.stringify(S));
    const c=$('#saveChip');
    if(c){c.textContent='Guardado';clearTimeout(save.t);save.t=setTimeout(()=>c.textContent='Autoguardado',800)}
  }
  function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1400)}
  function addLog(text,icon='scroll'){S.log.unshift({day:S.day,text,icon});save();renderHistory()}
  function activeBots(){return Object.keys(S.bots).filter(k=>S.bots[k])}
  function repLabel(v){return v<=-3?'Enemigo':v===-2?'Hostil':v===-1?'Sospechoso':v===0?'Neutral':v===1?'Conocido':v===2?'Confiable':'Aliado'}
  function ensureWorld(){if(!S.world||S.world.day!==S.day)S.world={day:S.day,resolved:{Marquesado:false,Eyrie:false,Alianza:false},records:{}}}

  function openSheet(title,sub,html,bind){
    sheet.title.textContent=title;sheet.sub.textContent=sub||'';
    sheet.content.innerHTML=html+`<button class="btn secondary" data-close-sheet style="width:100%;margin-top:14px">Cerrar</button>`;
    sheet.bg.classList.add('open');
    if(bind)bind(sheet.content);
    const close=sheet.content.querySelector('[data-close-sheet]');if(close)close.onclick=closeSheet;
  }
  function closeSheet(){sheet.bg.classList.remove('open')}
  sheet.bg.onclick=e=>{if(e.target===sheet.bg)closeSheet()};

  function chooseClear(title,onPick){
    openSheet(title,'Toca el claro físico del tablero.',`
      <div class="sheet-section"><div class="sheet-label">Claros 1–12</div>
      <div class="clear-grid">${Array.from({length:12},(_,i)=>i+1).map(n=>`<button class="clear-btn ${String(n)===String(S.character.clear)?'selected':''}" data-clear="${n}">${n}</button>`).join('')}</div></div>
    `,root=>root.querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>onPick(b.dataset.clear)));
  }

  function choiceSheet(title,sub,choices,onPick){
    openSheet(title,sub,`
      <div class="sheet-section"><div class="choice-grid">
      ${choices.map((c,i)=>`<button class="choice-btn" data-choice="${i}">${c.icon?ico(c.icon):''}<span>${esc(c.label)}</span></button>`).join('')}
      </div></div>
    `,root=>root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>onPick(choices[Number(b.dataset.choice)])));
  }

  function recordAction({label,icon='spark',cost=1,clear='',meta='',effect=null}){
    if(S.phase==='world'){toast('Primero resuelve la Fase del Mundo');return false}
    if(S.time+cost>4){toast('No queda suficiente tiempo');return false}
    S.time+=cost;if(clear)S.character.clear=String(clear);if(effect)effect();
    S.actions.push({day:S.day,label,icon,cost,clear:S.character.clear||'',meta});
    addLog(label+(meta?' · '+meta:'')+(cost?' ['+cost+' tiempo]':''),icon);
    if(S.time>=4){S.phase='world';ensureWorld()}
    save();renderAll();return true;
  }

  function resultBand(total){
    if(total<=1)return{label:'Fallo + consecuencia',icon:'close'};
    if(total<=3)return{label:'Éxito parcial / coste',icon:'alert'};
    if(total<=5)return{label:'Éxito',icon:'check'};
    return{label:'Éxito excepcional',icon:'star'};
  }

  function diceResolver({title,label,icon,cost=1,meta='',after=null}){
    const d={a:null,b:null,mod:0};
    openSheet(title,'Usa los dados físicos de Root y toca los resultados.','');
    function draw(){
      const ready=d.a!==null&&d.b!==null;
      const total=ready?d.a+d.b+d.mod:null;
      const band=ready?resultBand(total):null;
      sheet.content.innerHTML=`
        <div class="sheet-section"><div class="sheet-label">Dado 1</div><div class="dice-row">${[0,1,2,3].map(n=>`<button class="dice-btn ${d.a===n?'selected':''}" data-a="${n}">${n}</button>`).join('')}</div></div>
        <div class="sheet-section"><div class="sheet-label">Dado 2</div><div class="dice-row">${[0,1,2,3].map(n=>`<button class="dice-btn ${d.b===n?'selected':''}" data-b="${n}">${n}</button>`).join('')}</div></div>
        <div class="sheet-section"><div class="sheet-label">Modificador</div><div class="mod-row">${[-2,-1,0,1,2].map(n=>`<button class="mod-btn ${d.mod===n?'selected':''}" data-mod="${n}">${n>0?'+':''}${n}</button>`).join('')}</div></div>
        ${ready?`<div class="result-card"><div class="result-score">${ico(band.icon,'dark')} ${total}</div><div class="result-text">${band.label}</div></div>`:''}
        <button class="btn" id="saveRoll" style="width:100%;margin-top:12px" ${ready?'':'disabled'}>Registrar resultado</button>
        <button class="btn secondary" data-close-sheet style="width:100%;margin-top:8px">Cerrar</button>
      `;
      sheet.content.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{d.a=Number(b.dataset.a);draw()});
      sheet.content.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{d.b=Number(b.dataset.b);draw()});
      sheet.content.querySelectorAll('[data-mod]').forEach(b=>b.onclick=()=>{d.mod=Number(b.dataset.mod);draw()});
      sheet.content.querySelector('[data-close-sheet]').onclick=closeSheet;
      const saveBtn=$('#saveRoll');
      if(saveBtn)saveBtn.onclick=()=>{
        const t=d.a+d.b+d.mod,b=resultBand(t);
        const m=(meta?meta+' · ':'')+`${d.a}+${d.b}${d.mod?((d.mod>0?'+':'')+d.mod):''} = ${t} · ${b.label}`;
        if(recordAction({label,icon,cost,meta:m,effect:()=>after&&after({total:t,band:b})}))closeSheet();
      };
    }
    draw();
  }

  function openAction(id){
    if(id==='move')return chooseClear('Mover',c=>{if(String(c)===String(S.character.clear))return toast('Ya estás en ese claro');if(recordAction({label:`Mover al claro ${c}`,icon:'move',cost:1,clear:c}))closeSheet()});
    if(id==='observe')return choiceSheet('Observar','¿Dónde pones la atención?',[
      {icon:'eye',label:'Entorno'},{icon:'world',label:'Movimiento de facción'},{icon:'move',label:'Ruta / salida'},{icon:'card',label:'Rumor activo'},{icon:'landmark',label:'Lugar especial'}
    ],c=>{if(recordAction({label:'Observar',icon:'eye',cost:1,meta:c.label}))closeSheet()});
    if(id==='talk')return choiceSheet('Hablar','¿Con quién?',[
      {icon:'chat',label:'Habitante local'},{icon:'market',label:'Comerciante'},{icon:'shield',label:'Patrulla'},{icon:'handshake',label:'Contacto'},{icon:'paw',label:'Desconocido'}
    ],c=>{if(recordAction({label:'Hablar',icon:'chat',cost:1,meta:c.label}))closeSheet()});
    if(id==='investigate')return choiceSheet('Investigar','¿Qué sigues?',[
      {icon:'card',label:'Rumor'},{icon:'world',label:'Facción'},{icon:'alert',label:'Estado del claro'},{icon:'ruins',label:'Ruina'},{icon:'search',label:'Rastro / pista'}
    ],c=>choiceSheet('¿Existe riesgo?','Solo tira si hay incertidumbre, riesgo y consecuencia.',[
      {icon:'check',label:'No · ocurre'},{icon:'star',label:'Sí · tirar dados'}
    ],r=>r.label.startsWith('No')?(recordAction({label:'Investigar',icon:'search',cost:1,meta:c.label})&&closeSheet()):diceResolver({title:'Resolver investigación',label:'Investigar',icon:'search',cost:1,meta:c.label})));
    if(id==='trade')return choiceSheet('Comerciar','¿Qué intercambio buscas?',[
      {icon:'coin',label:'Comprar'},{icon:'coin',label:'Vender'},{icon:'key',label:'Sobornar'},{icon:'handshake',label:'Contratar ayuda'}
    ],c=>{if(recordAction({label:'Comerciar',icon:'coin',cost:1,meta:c.label}))closeSheet()});
    if(id==='infiltrate')return choiceSheet('Infiltrar','Elige el enfoque.',[
      {icon:'key',label:'Escabullirse'},{icon:'coin',label:'Robar'},{icon:'hammer',label:'Sabotear'},{icon:'card',label:'Plantar evidencia'}
    ],c=>diceResolver({title:c.label,label:'Infiltrar',icon:'key',cost:1,meta:c.label}));
    if(id==='combat')return choiceSheet('Combatir','¿Contra quién?',[
      {icon:'faction-cat',label:'Marquesado'},{icon:'faction-bird',label:'Eyrie'},{icon:'faction-alliance',label:'Alianza'},{icon:'sword',label:'Otro enemigo'}
    ],f=>choiceSheet('Cantidad','¿Cuántos enemigos?',[1,2,3,4,5].map(n=>({label:n===5?'5+':String(n)})),n=>diceResolver({title:`Combate · ${f.label}`,label:'Combatir',icon:'sword',cost:1,meta:`${f.label} · ${n.label} enemigo(s)`})));
    if(id==='explore'){
      const choices=[{icon:'ruins',label:'Ruina',kind:'ruin'},...S.landmarks.filter(l=>l.clear).map(l=>({icon:l.icon,label:l.name,kind:'landmark'}))];
      return choiceSheet('Explorar','¿Dónde?',choices,c=>{
        if(c.kind==='ruin'&&S.inventory.torch<1)return openSheet('Acceso bloqueado','Necesitas una Antorcha para entrar a una ruina.',`<div class="result-card"><div class="result-score">${ico('torch','dark')} Antorcha requerida</div><div class="result-text">Consigue una antes de explorarla.</div></div>`);
        diceResolver({title:`Explorar · ${c.label}`,label:'Explorar',icon:'torch',cost:1,meta:c.label});
      });
    }
    if(id==='help')return choiceSheet('Apoyar facción','¿A quién ayudas?',Object.keys(FACTIONS).map(n=>({icon:FACTIONS[n].icon,label:n})),f=>choiceSheet('Tipo de apoyo',f.label,[
      {icon:'sword',label:'Conflicto'},{icon:'bag',label:'Suministros'},{icon:'eye',label:'Inteligencia'},{icon:'shield',label:'Protección'}
    ],a=>choiceSheet('Impacto político','¿Fue suficientemente importante?',[
      {icon:'check',label:'Sin cambio',rep:0},{icon:'star',label:'+1 reputación',rep:1}
    ],i=>{if(recordAction({label:`Apoyar a ${f.label}`,icon:'handshake',cost:1,meta:a.label,effect:()=>{if(i.rep)S.reputations[f.label]=clamp(S.reputations[f.label]+1,-3,3)}}))closeSheet()})));
    if(id==='craft'){
      if(S.inventory.hammer<1)return openSheet('Martillo requerido','Fabricar y reparar necesita un Martillo.',`<div class="result-card"><div class="result-score">${ico('hammer','dark')} Sin Martillo</div><div class="result-text">Puedes conseguir uno como recompensa de ciertas misiones.</div></div>`);
      return choiceSheet('Fabricar / reparar','¿Qué haces?',[
        {icon:'hammer',label:'Reparar objeto'},{icon:'bag',label:'Fabricar recurso'},{icon:'star',label:'Mejorar equipo'}
      ],c=>{if(recordAction({label:'Martillo',icon:'hammer',cost:1,meta:c.label}))closeSheet()});
    }
    if(id==='rest'){
      const opts=[{icon:'rest',label:'Descanso completo',cost:2,tea:false}];
      if(S.inventory.tea>0)opts.push({icon:'rest',label:'Usar Té',cost:0,tea:true});
      return choiceSheet('Descansar','Recupera 1 de vida.',opts,c=>{if(recordAction({label:'Descansar',icon:'rest',cost:c.cost,meta:c.label,effect:()=>{S.character.hp=clamp(S.character.hp+1,0,S.character.maxHp);if(c.tea)S.inventory.tea--}}))closeSheet()});
    }
    if(id==='free')return choiceSheet('Acción libre','Elige la categoría.',[
      {icon:'key',label:'Sigilo'},{icon:'chat',label:'Engaño'},{icon:'star',label:'Preparación'},{icon:'hammer',label:'Entorno'},{icon:'world',label:'Facción'},{icon:'bag',label:'Objeto'},{icon:'spark',label:'Otra'}
    ],c=>choiceSheet('Coste de tiempo','¿Cuánto consumió?',[{label:'0 tiempo',cost:0},{label:'1 tiempo',cost:1},{label:'2 tiempo',cost:2}],t=>{if(recordAction({label:'Acción libre',icon:'spark',cost:t.cost,meta:c.label}))closeSheet()}));
  }

  function renderHeader(){
    $('#heroName').textContent=S.campaign;
    $('#heroSubtitle').textContent=`Día ${S.day} · ${S.playerName||'Pícaro'} · ${S.character.archetype}`;
    $('#heroHp').textContent=`${S.character.hp}/${S.character.maxHp}`;$('#heroXp').textContent=`${S.character.xp}/5`;
    $('#heroClear').textContent=S.character.clear||'—';$('#heroLevel').textContent=S.character.level;$('#timeText').textContent=`${S.time} / 4`;
    $$('#timePips .time-pip').forEach((p,i)=>p.classList.toggle('on',i<S.time));
    $('#characterName').textContent=S.playerName||'Pícaro';$('#characterLevel').textContent=S.character.level;
    $('#charHp').textContent=`${S.character.hp}/${S.character.maxHp}`;$('#charXp').textContent=`${S.character.xp}/5`;$('#charClear').textContent=S.character.clear||'—';
    $('#levelUpBtn').disabled=S.character.xp<5;
  }

  function renderActions(){
    const g=$('#actionGrid');g.innerHTML='';
    ACTIONS.forEach(a=>{
      const locked=(a.id==='craft'&&S.inventory.hammer<1);
      const b=document.createElement('button');b.className=`action-btn ${a.tone||''} ${locked?'locked':''}`;
      b.innerHTML=`<div class="action-icon">${ico(ICONS[a.id])}</div><div><div class="action-label">${esc(a.label)}</div><div class="action-cost">${a.cost} tiempo</div></div>`;
      b.onclick=()=>openAction(a.id);g.appendChild(b);
    });
  }

  function renderToday(){
    const b=$('#todayTimeline'),arr=S.actions.filter(a=>a.day===S.day);$('#todayCount').textContent=`${arr.length} ${arr.length===1?'acción':'acciones'}`;b.innerHTML='';
    const endBtn=$('#endDayBtn');if(endBtn)endBtn.style.display=S.phase==='world'?'none':'block';
    if(!arr.length){b.innerHTML='<div class="empty">El día está abierto. Elige cualquier acción.</div>';return}
    arr.forEach(a=>{const r=document.createElement('div');r.className='timeline-item';r.innerHTML=`<div class="timeline-icon">${ico(a.icon||'spark')}</div><div><div class="timeline-title">${esc(a.label)}</div><div class="timeline-meta">${esc(a.meta||'')}${a.clear?' · Claro '+esc(a.clear):''}</div></div><span class="tag">${a.cost}t</span>`;b.appendChild(r)});
  }

  function renderWorldBanner(){
    const h=$('#worldBanner');if(S.phase!=='world'){h.innerHTML='';return}ensureWorld();
    const bots=activeBots(),done=bots.filter(n=>S.world.resolved[n]).length;
    h.innerHTML=`<div class="world-banner"><div><h3>Fase del Mundo</h3><p>${done}/${bots.length} órdenes resueltas. El bosque actúa sin ti.</p></div><button class="btn secondary" id="openOrdersBtn">${done===bots.length?'Procesar órdenes':'Resolver'}</button></div>`;
    $('#openOrdersBtn').onclick=()=>{switchView('mundo');if(done===bots.length)openHarvest()};
  }

  function renderSkills(){
    const b=$('#skillsCard');b.innerHTML=`<div class="skill-row"><div><div class="item-title">Oportunista</div><div class="item-meta">1 vez por día: +1 al explotar una ventaja preparada.</div></div><button class="chip ${S.character.opportunistReady?'active':''}" id="opBtn">${S.character.opportunistReady?'Disponible':'Usado'}</button></div>`;
    Object.entries(S.character.skills).forEach(([n,v])=>{const r=document.createElement('div');r.className='skill-row';r.innerHTML=`<div><div class="item-title">${esc(n)}</div><div class="item-meta">Bonificador situacional</div></div><strong>+${v}</strong>`;b.appendChild(r)});
    $('#opBtn').onclick=()=>{if(!S.character.opportunistReady)return toast('Se recupera al iniciar el próximo día');S.character.opportunistReady=false;addLog('Oportunista usado: +1 en la resolución actual','star');save();renderSkills()};
  }

  function renderInventory(){
    const b=$('#inventoryGrid');b.innerHTML='';
    Object.entries(ITEM_DEF).forEach(([id,d])=>{const card=document.createElement('div');card.className='inv';card.innerHTML=`<div class="inv-icon">${ico(d.icon)}</div><div class="inv-name">${d.name}</div><div class="inv-count">×${S.inventory[id]||0}</div><div class="item-meta">${d.info}</div>`;const st=document.createElement('div');st.className='stepper';const m=document.createElement('button'),p=document.createElement('button');m.textContent='−';p.textContent='+';m.onclick=()=>{S.inventory[id]=Math.max(0,(S.inventory[id]||0)-1);save();renderInventory();renderActions()};p.onclick=()=>{S.inventory[id]=(S.inventory[id]||0)+1;save();renderInventory();renderActions()};st.append(m,p);card.appendChild(st);b.appendChild(card)});
  }

  function renderReputation(){
    const b=$('#reputationList');b.innerHTML='';
    Object.entries(S.reputations).forEach(([n,v])=>{const f=FACTIONS[n],left=v<0?50+(v/3)*50:50,w=Math.abs(v)/3*50,color=v<0?'var(--red)':'var(--moss)';const c=document.createElement('div');c.className='rep-card';c.innerHTML=`<div class="rep-top"><div class="rep-title"><div class="faction-seal ${f.className}">${ico(f.icon)}</div><div><div class="rep-name">${n}</div><div class="rep-state">${repLabel(v)}</div></div></div><strong>${v>0?'+':''}${v}</strong></div><div class="rep-track"><div class="rep-fill" style="left:${left}%;width:${w}%;background:${color}"></div></div>`;const a=document.createElement('div');a.className='rep-actions';['−1','+1'].forEach((t,i)=>{const bt=document.createElement('button');bt.className='chip';bt.textContent=t;bt.onclick=()=>{const old=S.reputations[n];S.reputations[n]=clamp(old+(i?1:-1),-3,3);addLog(`${n}: ${old} → ${S.reputations[n]}`,f.icon);save();renderReputation()};a.appendChild(bt)});c.appendChild(a);b.appendChild(c)});
  }

  function orderFace(origin,suit){
    const f=FACTIONS[origin],s=SUITS[suit];
    if(!f||!s)return '';
    return `<div class="order-face">
      <svg class="ico order-face-art"><use href="./icons.svg#scene-${suit}"></use></svg>
      <div class="order-suit-medallion">${ico(s.icon)}</div>
      <span class="order-face-label">${esc(s.name)}</span>
    </div>`;
  }

  function openBot(name){
    ensureWorld();
    const f=FACTIONS[name],old=S.world.records[name]||{suit:null,outcomes:[]};
    const d={suit:old.suit,outcomes:[...old.outcomes]};
    openSheet(name,'Registra la Carta de Orden y solo los cambios que realmente ocurrieron en mesa.','');
    function draw(){
      sheet.content.innerHTML=`
        ${d.suit?`<div class="order-preview"><div class="order-ribbon" style="background:${f.color}"></div>${orderFace(name,d.suit)}<div class="order-preview-copy"><strong>${name} · ${SUITS[d.suit].name}</strong><span>${d.outcomes.length?d.outcomes.map(esc).join(' · '):'Selecciona abajo qué ocurrió físicamente.'}</span></div></div>`:''}
        <div class="sheet-section"><div class="sheet-label">Carta de Orden</div><div class="suit-row">
          ${Object.entries(SUITS).map(([id,s])=>`<button class="suit-btn ${d.suit===id?'selected':''}" data-suit="${id}" aria-label="${s.name}">${ico(s.icon)}</button>`).join('')}
        </div></div>
        <div class="sheet-section"><div class="sheet-label">Cambios reales en mesa</div><div class="choice-grid">
          ${f.outcomes.map((o,i)=>`<button class="choice-btn ${d.outcomes.includes(o)?'selected':''}" data-outcome="${i}"><span>${o}</span></button>`).join('')}
        </div></div>
        <button class="btn" id="saveOrder" style="width:100%;margin-top:14px" ${d.suit?'':'disabled'}>Sellar orden del día</button>
        <button class="btn secondary" data-close-sheet style="width:100%;margin-top:8px">Cerrar</button>`;
      sheet.content.querySelectorAll('[data-suit]').forEach(x=>x.onclick=()=>{d.suit=x.dataset.suit;draw()});
      sheet.content.querySelectorAll('[data-outcome]').forEach(x=>x.onclick=()=>{
        const o=f.outcomes[Number(x.dataset.outcome)];
        d.outcomes=d.outcomes.includes(o)?d.outcomes.filter(y=>y!==o):[...d.outcomes,o];
        draw();
      });
      sheet.content.querySelector('[data-close-sheet]').onclick=closeSheet;
      const s=$('#saveOrder');
      if(s)s.onclick=()=>{
        S.world.records[name]={suit:d.suit,outcomes:d.outcomes};
        S.world.resolved[name]=true;
        addLog(`Orden de ${name}: ${SUITS[d.suit].name}${d.outcomes.length?' · '+d.outcomes.join(', '):''}`,f.icon);
        save();closeSheet();renderAll();
        if(activeBots().every(n=>S.world.resolved[n]))setTimeout(openHarvest,150);
      };
    }
    draw();
  }

  function renderBots(){
    ensureWorld();
    const b=$('#botList');b.innerHTML='';
    activeBots().forEach(n=>{
      const f=FACTIONS[n],r=S.world.records[n],done=!!S.world.resolved[n];
      const card=document.createElement('div');
      card.className=`order-card ${f.className}`;
      card.innerHTML=`
        <div class="order-ribbon"></div>
        <div class="order-card-body">
          <div class="order-card-head">
            <div class="order-faction">
              <div class="faction-seal ${f.className}">${ico(f.icon)}</div>
              <div><div class="order-card-title">${n}</div><div class="order-card-status">${S.phase==='world'?(done?'Orden sellada':'Carta pendiente'):'Esperando Fase del Mundo'}</div></div>
            </div>
            <span class="tag">${r?.suit?SUITS[r.suit].name:'Sin carta'}</span>
          </div>
          ${r?.suit?orderFace(n,r.suit):`<div class="order-face"><svg class="ico order-face-art"><use href="./icons.svg#scene-bird"></use></svg><div class="order-suit-medallion">${ico('card')}</div><span class="order-face-label">Pendiente</span></div>`}
          ${r?.outcomes?.length?`<div class="order-outcomes">${r.outcomes.map(o=>`<span class="order-outcome">${esc(o)}</span>`).join('')}</div>`:''}
          <div class="order-card-actions"><button class="btn ${done?'secondary':''}" data-bot="${n}" ${S.phase!=='world'?'disabled':''}>${done?'Reabrir orden':'Revelar y resolver'}</button></div>
        </div>`;
      card.querySelector('[data-bot]').onclick=()=>openBot(n);
      b.appendChild(card);
    });
    if(S.phase==='world'){
      const ok=activeBots().every(n=>S.world.resolved[n]);
      const c=document.createElement('div');c.className='bot-card';
      c.innerHTML=`<div class="bot-head"><div><div class="bot-name">Consecuencias del día</div><div class="bot-status">${ok?'Las órdenes ya pueden convertirse en historia':'Faltan Cartas de Orden por resolver'}</div></div></div><div class="bot-actions"><button class="btn gold" id="harvestBtn" ${ok?'':'disabled'}>Procesar órdenes</button></div>`;
      b.appendChild(c);
      const h=$('#harvestBtn');if(h)h.onclick=openHarvest;
    }
  }

  function rewardFor(outcome,origin){
    const map={
      'Batalló':'sword','Reclutó':'bag','Construyó':'hammer','Movió':'boot','Movilizó':'boot',
      'Ganó territorio':'crossbow','Perdió territorio':'tea','Extendió simpatía':'coin','Revuelta':'torch'
    };
    return map[outcome]|| (origin==='Alianza'?'coin':'tea');
  }

  function missionDraft(origin,suit,outcomes){
    const primary=outcomes[0]||'Movió',land=SUITS[suit]?.name||'bosque';
    const reward=rewardFor(primary,origin);
    const data={
      'Batalló':['Tras las líneas',`Aprovecha el conflicto de ${origin} en territorio ${land} y recupera algo útil sin quedar atrapado.`],
      'Reclutó':['Nombres en la lista',`Descubre quién está siendo reclutado por ${origin} en los claros de ${land} y qué pretende hacer.`],
      'Construyó':['Suministros desviados',`Sigue el flujo de materiales de ${origin} en territorio ${land} y consigue acceso a sus herramientas.`],
      'Movió':['Rastro en los caminos',`Sigue el desplazamiento de ${origin} por territorio ${land} sin revelar tu presencia.`],
      'Movilizó':['Mensajeros en tránsito',`Sigue la red de movimiento de la Alianza en territorio ${land} y descubre su siguiente enlace.`],
      'Ganó territorio':['Nueva frontera',`Explora el nuevo borde de control de ${origin} en territorio ${land} y encuentra una brecha aprovechable.`],
      'Perdió territorio':['Vacío de poder',`Entra al espacio que ${origin} acaba de perder en territorio ${land} antes de que alguien más lo reclame.`],
      'Extendió simpatía':['Mensajes bajo la corteza',`Sigue la nueva red de simpatizantes de la Alianza entre los claros de ${land}.`],
      'Revuelta':['Después de las llamas',`Llega al territorio ${land} tras la revuelta y recupera algo valioso entre el caos.`]
    }[primary]||['Oportunidad del bosque',`Investiga qué está ocurriendo con ${origin} en territorio ${land}.`];
    return {id:uid(),day:S.day,origin,suit,title:data[0],objective:data[1],reward,status:'active',source:{outcome:primary,outcomes}};
  }

  function rumorDraft(origin,suit,outcomes,mission){
    const p=outcomes[0]||'movimientos',land=SUITS[suit]?.name.toLowerCase()||'bosque';
    const templates={
      'Batalló':`Se habla de nuevos choques de ${origin} en los claros de ${land}.`,
      'Reclutó':`${origin} está reuniendo nuevos partidarios entre los habitantes de ${land}.`,
      'Construyó':`Carretas y materiales de ${origin} están entrando al territorio de ${land}.`,
      'Movió':`Patrullas de ${origin} cruzan los caminos de ${land} con una urgencia poco habitual.`,
      'Movilizó':`Mensajeros vinculados a la Alianza se mueven en secreto entre los claros de ${land}.`,
      'Ganó territorio':`${origin} está consolidando una nueva frontera en territorio de ${land}.`,
      'Perdió territorio':`La autoridad de ${origin} parece debilitarse en los claros de ${land}.`,
      'Extendió simpatía':`Símbolos clandestinos de la Alianza aparecen cada vez más en los claros de ${land}.`,
      'Revuelta':`Una revuelta ligada a la Alianza sacudió territorio de ${land}.`
    };
    return{id:uid(),day:S.day,suit,origin,text:templates[p]||`Algo está cambiando alrededor de ${origin} en territorio de ${land}.`,seed:mission};
  }

  function archiveOrders(){
    activeBots().forEach(n=>{
      const r=S.world.records[n];if(!r)return;
      S.orderHistory.unshift({id:uid(),day:S.day,origin:n,suit:r.suit,outcomes:[...r.outcomes]});
    });
    S.orderHistory=S.orderHistory.slice(0,30);
  }

  function openHarvest(){
    if(!activeBots().every(n=>S.world.resolved[n]))return toast('Quedan órdenes pendientes');
    const seeds=activeBots().map(n=>({origin:n,...S.world.records[n]}));
    let i=0;

    function next(){
      if(i>=seeds.length){finishWorld();return}

      const seed=seeds[i];
      const m=missionDraft(seed.origin,seed.suit,seed.outcomes);
      const r=rumorDraft(seed.origin,seed.suit,seed.outcomes,m);
      const f=FACTIONS[seed.origin];
      const reward=ITEM_DEF[m.reward];

      openSheet(
        `Consecuencia · ${seed.origin}`,
        'La misma Carta de Orden puede quedarse como ruido de fondo o abrir una historia jugable.',
        `
          <div class="order-preview">
            <div class="order-ribbon" style="background:${f.color}"></div>
            ${orderFace(seed.origin,seed.suit)}
            <div class="order-preview-copy">
              <strong>${seed.origin} · ${SUITS[seed.suit].name}</strong>
              <span>${seed.outcomes.length?seed.outcomes.map(esc).join(' · '):'Sin cambio destacado.'}</span>
            </div>
          </div>

          <div class="sheet-section">
            <div class="sheet-label">Qué deja esta orden</div>
            <div class="choice-grid">
              <button class="choice-btn" id="asRumor">${ico('card')}<span>Rumor</span></button>
              <button class="choice-btn" id="asMission">${ico('star')}<span>Misión</span></button>
              <button class="choice-btn" id="asBackground">${ico('world')}<span>Fondo</span></button>
            </div>
          </div>

          <div class="rumor-card" style="--rumor-color:${f.color};margin-top:12px">
            <div class="rumor-head">
              <div class="rumor-source">
                <div class="faction-seal ${f.className}">${ico(f.icon)}</div>
                <div><div class="item-title">Posible rumor</div><div class="item-meta">${SUITS[seed.suit].name}</div></div>
              </div>
              <span class="tag">Rumor</span>
            </div>
            <div class="rumor-copy">“${esc(r.text)}”</div>
          </div>

          <div class="mission" style="--mission-color:${f.color};margin-top:12px">
            <div class="mission-ribbon"></div>
            <div class="mission-inner">
              <div class="mission-head">
                <div><div class="mission-kicker">Posible misión</div><div class="mission-title">${esc(m.title)}</div></div>
                <div class="faction-seal ${f.className}">${ico(f.icon)}</div>
              </div>
              <div class="mission-objective">${esc(m.objective)}</div>
              <div class="mission-separator"></div>
              <div class="reward-panel">
                <div class="reward-token">${ico(reward.icon)}</div>
                <div class="reward-copy"><small>Recompensa potencial</small><strong>${reward.name} + 1 XP</strong></div>
              </div>
            </div>
          </div>
        `,
        ()=>{
          $('#asRumor').onclick=()=>{
            if(S.rumors.length<3){
              S.rumors.push(r);
              addLog(`Rumor: ${r.text}`,'card');
            }else{
              addLog(`Rumor descartado por límite activo: ${r.text}`,'card');
              toast('Ya tienes 3 rumores activos');
            }
            i++;closeSheet();next();
          };
          $('#asMission').onclick=()=>{
            S.missions.push(m);
            addLog(`Nueva misión: ${m.title}`,'star');
            i++;closeSheet();next();
          };
          $('#asBackground').onclick=()=>{
            addLog(`La orden de ${seed.origin} queda como cambio de fondo.`,f.icon);
            i++;closeSheet();next();
          };
        }
      );
    }

    next();
  }

  function finishWorld(){
    archiveOrders();addLog('Fase del Mundo cerrada. El bosque avanza.','world');
    S.day++;S.time=0;S.phase='player';S.character.opportunistReady=true;
    S.world={day:S.day,resolved:{Marquesado:false,Eyrie:false,Alianza:false},records:{}};
    save();closeSheet();renderAll();switchView('turno');toast(`Día ${S.day}`);
  }

  function renderOrderHistory(){
    const b=$('#orderHistoryList');b.innerHTML='';
    if(!S.orderHistory.length){b.innerHTML='<div class="empty">Aquí quedarán archivadas las Cartas de Orden de cada día.</div>';return}
    S.orderHistory.slice(0,10).forEach(o=>{
      const f=FACTIONS[o.origin],s=SUITS[o.suit];
      const r=document.createElement('div');r.className='order-history-card';
      r.innerHTML=`
        <div class="order-history-suit" style="--order-color:${f.color}">${ico(s?.icon||'card')}</div>
        <div><div class="order-history-title">${esc(o.origin)} · ${s?.name||''}</div><div class="order-history-meta">${o.outcomes.map(esc).join(' · ')||'Sin evento destacado'} · Día ${o.day}</div></div>
        <span class="tag">D${o.day}</span>`;
      b.appendChild(r);
    });
  }

  function openAddState(){
    chooseClear('Estado del mapa',c=>openSheet(`Claro ${c}`,'Elige el estado principal.',`<div class="choice-grid">${STATES.map((s,i)=>`<button class="choice-btn" data-state="${i}">${ico(s.icon)}<span>${s.name}</span></button>`).join('')}</div>`,root=>root.querySelectorAll('[data-state]').forEach(b=>b.onclick=()=>{const st=STATES[Number(b.dataset.state)],e=S.states.find(x=>String(x.clear)===String(c));if(e)e.name=st.name;else S.states.push({clear:String(c),name:st.name});addLog(`Estado: claro ${c} · ${st.name}`,st.icon);save();closeSheet();renderStates()})));
  }
  function renderStates(){
    const b=$('#statesList');b.innerHTML='';if(!S.states.length){b.innerHTML='<div class="empty">Sin estados especiales activos.</div>';return}
    S.states.forEach((s,i)=>{const def=STATES.find(x=>x.name===s.name)||STATES[0],d=document.createElement('div');d.className='item';d.innerHTML=`<div class="item-head"><div class="rep-title"><div class="timeline-icon">${ico(def.icon)}</div><div><div class="item-title">Claro ${esc(s.clear)} · ${esc(s.name)}</div><div class="item-meta">Marcador físico activo</div></div></div><button class="chip" data-r="${i}">Resolver</button></div>`;d.querySelector('[data-r]').onclick=()=>{const old=S.states.splice(i,1)[0];addLog(`Estado resuelto: claro ${old.clear} · ${old.name}`,'check');save();renderStates()};b.appendChild(d)});
  }

  function renderRumors(){
    const b=$('#rumorsList');$('#rumorCounter').textContent=`${S.rumors.length} / 3`;b.innerHTML='';
    if(!S.rumors.length){b.innerHTML='<div class="empty">Las órdenes todavía no han dejado rumores activos.</div>';return}
    S.rumors.forEach((r,i)=>{
      const f=FACTIONS[r.origin]||FACTIONS.Marquesado;
      const d=document.createElement('div');d.className='rumor-card';d.style.setProperty('--rumor-color',f.color);
      d.innerHTML=`
        <div class="rumor-head">
          <div class="rumor-source"><div class="faction-seal ${f.className}">${ico(f.icon)}</div><div><div class="item-title">${esc(r.origin)}</div><div class="item-meta">${SUITS[r.suit]?.name||''} · Día ${r.day}</div></div></div>
          <span class="tag">Rumor</span>
        </div>
        <div class="rumor-copy">“${esc(r.text)}”</div>
        <div class="btn-row" style="margin-top:11px"><button class="btn" data-follow="${i}">Seguir pista</button><button class="btn secondary" data-resolve="${i}">Dejar morir</button></div>`;
      d.querySelector('[data-follow]').onclick=()=>{
        const rr=S.rumors[i],m=rr.seed||missionDraft(rr.origin,rr.suit,['Movió']);
        if(recordAction({label:'Seguir rumor',icon:'search',cost:1,meta:rr.text,effect:()=>{S.missions.push({...m,id:uid(),status:'active'});S.rumors.splice(i,1)}}))switchView('descubrir');
      };
      d.querySelector('[data-resolve]').onclick=()=>{
        const old=S.rumors.splice(i,1)[0];addLog(`Rumor se apaga: ${old.text}`,'card');save();renderRumors();
      };
      b.appendChild(d);
    });
  }

  function applyReward(m){
    S.inventory[m.reward]=(S.inventory[m.reward]||0)+1;S.character.xp+=1;
    addLog(`Misión cumplida: ${m.title} · obtienes ${ITEM_DEF[m.reward].name} + 1 XP`,'star');
  }
  function renderMissions(){
    const b=$('#missionsList'),active=S.missions.filter(m=>m.status==='active');
    $('#missionCounter').textContent=`${active.length} activas`;b.innerHTML='';
    if(!active.length){b.innerHTML='<div class="empty">Las Cartas de Orden pueden convertirse en misiones con recompensas físicas.</div>';return}
    active.forEach(m=>{
      const idx=S.missions.indexOf(m),f=FACTIONS[m.origin],reward=ITEM_DEF[m.reward];
      const d=document.createElement('div');d.className='mission';d.style.setProperty('--mission-color',f.color);
      d.innerHTML=`
        <div class="mission-ribbon"></div>
        <div class="mission-inner">
          <div class="mission-head">
            <div><div class="mission-kicker">${esc(m.origin)} · ${SUITS[m.suit]?.name||''}</div><div class="mission-title">${esc(m.title)}</div></div>
            <div class="faction-seal ${f.className}">${ico(f.icon)}</div>
          </div>
          <div class="mission-objective">${esc(m.objective)}</div>
          <div class="mission-separator"></div>
          <div class="reward-panel">
            <div class="reward-token">${ico(reward.icon)}</div>
            <div class="reward-copy" style="flex:1"><small>Recompensa</small><strong>${reward.name} + 1 XP</strong><div class="item-meta">${reward.info}</div></div>
            <span class="tag">Día ${m.day}</span>
          </div>
          <div class="mission-actions">
            <button class="btn" data-success="${idx}">Cumplida</button>
            <button class="btn secondary" data-fail="${idx}">Fallida</button>
            <button class="btn secondary" data-drop="${idx}">Abandonar</button>
          </div>
        </div>`;
      d.querySelector('[data-success]').onclick=()=>{m.status='completed';applyReward(m);save();renderAll()};
      d.querySelector('[data-fail]').onclick=()=>{m.status='failed';addLog(`Misión fallida: ${m.title}`,'close');save();renderMissions()};
      d.querySelector('[data-drop]').onclick=()=>{m.status='abandoned';addLog(`Misión abandonada: ${m.title}`,'scroll');save();renderMissions()};
      b.appendChild(d);
    });
  }

  function renderLandmarks(){
    const b=$('#landmarksList');b.innerHTML='';
    S.landmarks.forEach(l=>{const d=document.createElement('div');d.className='landmark';d.innerHTML=`<div class="landmark-top"><div class="landmark-icon">${ico(l.icon)}</div><div><div class="landmark-name">${l.name}</div><div class="landmark-desc">${l.description}</div></div><span class="tag">${l.clear?'Claro '+esc(l.clear):'Oculto'}</span></div><div class="landmark-actions">${!l.clear?'<button class="chip" data-reveal>Revelar ubicación</button>':''}${l.clear&&l.level<3?`<button class="chip" data-progress>${['','Visitar','Explorar','Vincular'][l.level+1]}</button>`:''}${l.level===3?'<span class="chip active">Vinculado</span>':''}</div><div class="landmark-actions">${l.services.map((s,i)=>`<span class="chip ${l.level>=i+1?'active':''}">${l.level>=i+1?'Disponible':'Bloqueado'} · ${s}</span>`).join('')}</div>`;const rev=d.querySelector('[data-reveal]');if(rev)rev.onclick=()=>chooseClear(`Ubicar · ${l.name}`,c=>{l.clear=String(c);addLog(`${l.name} revelado en claro ${c}`,l.icon);save();closeSheet();renderLandmarks()});const prog=d.querySelector('[data-progress]');if(prog)prog.onclick=()=>{const target=l.level+1,label=['','Visitar','Explorar','Vincular'][target];if(recordAction({label:`${label} · ${l.name}`,icon:l.icon,cost:1,clear:l.clear,meta:`Nivel ${target}/3`,effect:()=>l.level=target})){switchView('descubrir')}};b.appendChild(d)});
  }

  function renderHistory(){
    const b=$('#historyList');if(!b)return;b.innerHTML='';if(!S.log.length){b.innerHTML='<div class="empty">El bosque todavía no tiene historia.</div>';return}
    S.log.slice(0,80).forEach(x=>{const d=document.createElement('div');d.className='timeline-item';d.innerHTML=`<div class="timeline-icon">${ico(x.icon||'scroll')}</div><div><div class="timeline-title">${esc(x.text)}</div><div class="timeline-meta">Día ${x.day}</div></div><span class="tag">D${x.day}</span>`;b.appendChild(d)});
  }

  function renderAll(){renderHeader();renderActions();renderToday();renderWorldBanner();renderSkills();renderInventory();renderReputation();renderBots();renderOrderHistory();renderStates();renderRumors();renderMissions();renderLandmarks();renderHistory()}
  function switchView(n){$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===n));$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${n}`));window.scrollTo({top:0,behavior:'smooth'})}
  $$('.nav-btn').forEach(b=>b.onclick=()=>switchView(b.dataset.view));

  $('#addStateBtn').onclick=openAddState;
  $('#endDayBtn').onclick=()=>{if(S.phase==='world')return;S.phase='world';ensureWorld();addLog('La jornada termina antes de agotar todo el tiempo.','rest');save();renderAll();toast('Fase del Mundo disponible')};
  $('#damageBtn').onclick=()=>{S.character.hp=clamp(S.character.hp-1,0,S.character.maxHp);addLog('Pierde 1 de vida','heart');save();renderHeader()};
  $('#healBtn').onclick=()=>{S.character.hp=clamp(S.character.hp+1,0,S.character.maxHp);addLog('Recupera 1 de vida','heart');save();renderHeader()};
  $('#gainXpBtn').onclick=()=>{S.character.xp++;addLog('+1 XP por progreso significativo','star');save();renderHeader()};
  $('#levelUpBtn').onclick=()=>{
    if(S.character.xp<5)return toast('Necesitas 5 XP');
    const opts=[...Object.entries(S.character.skills).filter(([,v])=>v<2).map(([k])=>({label:'+1 '+k,skill:k})),{label:'+1 Vida máxima',hp:true}];
    choiceSheet('Mejora de nivel','Gastas 5 XP.',opts.map(o=>({icon:'star',label:o.label,...o})),o=>{S.character.xp-=5;S.character.level++;if(o.skill)S.character.skills[o.skill]++;if(o.hp){S.character.maxHp++;S.character.hp++}addLog(`Nivel ${S.character.level}: ${o.label}`,'medal');save();closeSheet();renderAll()});
  };

  $('#settingsBtn').onclick=()=>openSheet('Ajustes','Solo lo esencial.',`
    <div class="setting-row"><div><div class="item-title">Jugador</div><div class="meta">${esc(S.playerName||'Sin nombre')}</div></div><button class="chip" id="editName">Editar</button></div>
    <div class="setting-row"><div><div class="item-title">Claro actual</div><div class="meta">${S.character.clear?'Claro '+esc(S.character.clear):'Sin fijar'}</div></div><button class="chip" id="setLoc">Cambiar</button></div>
    <div class="setting-row"><div><div class="item-title">Alianza Automatizada</div><div class="meta">${S.bots.Alianza?'Activa':'Inactiva'} en la Fase del Mundo.</div></div><button class="chip ${S.bots.Alianza?'active':''}" id="toggleAlliance">${S.bots.Alianza?'Activa':'Activar'}</button></div>
    <div class="setting-row"><div><div class="item-title">Versión</div><div class="meta">v0.4 · Mesa de Órdenes + misiones</div></div><span class="tag">button-first</span></div>
  `,()=>{
    $('#editName').onclick=()=>{closeSheet();showOnboarding()};
    $('#setLoc').onclick=()=>{closeSheet();chooseClear('Claro actual',c=>{S.character.clear=String(c);save();closeSheet();renderAll()})};
    $('#toggleAlliance').onclick=()=>{S.bots.Alianza=!S.bots.Alianza;if(!S.bots.Alianza){S.world.resolved.Alianza=false;delete S.world.records.Alianza}save();closeSheet();renderAll();toast(S.bots.Alianza?'Alianza activada':'Alianza desactivada')};
  });

  $('#exportBtn').onclick=()=>{const bl=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=`root-rpg-${S.playerName||'campana'}-dia-${S.day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
  $('#importInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{S=migrate(JSON.parse(await f.text()));S.onboarded=true;save();renderAll();toast('Campaña importada')}catch(_){toast('Archivo no válido')}e.target.value=''};
  $('#resetBtn').onclick=()=>openSheet('Nueva campaña','Se borrará el estado local actual.',`<div class="result-card"><div class="item-title">Empezar de cero</div><div class="result-text">Exporta un respaldo antes si quieres conservar la campaña.</div></div><button class="btn red" id="confirmReset" style="width:100%;margin-top:12px">Reiniciar campaña</button>`,()=>$('#confirmReset').onclick=()=>{S=fresh();save();closeSheet();renderAll();showOnboarding()});

  function showOnboarding(){$('#onboarding').classList.add('open');$('#playerName').value=S.playerName||'';$('#startCampaignBtn').textContent=S.playerName?'Guardar nombre':'Comenzar campaña';setTimeout(()=>$('#playerName').focus(),80)}
  $('#startCampaignBtn').onclick=()=>{const n=$('#playerName').value.trim();if(!n)return toast('Escribe tu nombre');const first=!S.onboarded;S.playerName=n;S.campaign='Crónicas de '+n;S.onboarded=true;save();$('#onboarding').classList.remove('open');renderAll();if(first){addLog(`${n} entra al bosque como Pícaro.`,'paw');setTimeout(()=>chooseClear('¿Dónde comienzas?',c=>{S.character.clear=String(c);addLog(`Comienza en el claro ${c}.`,'pin');save();closeSheet();renderAll()}),160)}};

  ensureWorld();if(!S.onboarded)showOnboarding();renderAll();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
})();