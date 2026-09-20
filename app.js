(() => {
  const KEY='rootRpg_v07';
  const LEGACY=['rootRpg_v06','rootRpg_v04','rootRpg_v03','rootRpg_v02','rootSandboxCompanion_v02','rootSandbox_v01'];
  const DATA=window.ROOT_RPG_CHARACTER_DATA;
  const VAGS=DATA.vagabonds;
  const MILESTONES=DATA.milestoneRules;

  const ITEM_DEF={
    sword:{name:'Espada',icon:'sword'},boot:{name:'Bota',icon:'boot'},crossbow:{name:'Ballesta',icon:'crossbow'},
    torch:{name:'Antorcha',icon:'torch'},hammer:{name:'Martillo',icon:'hammer'},tea:{name:'Té',icon:'rest'},
    coin:{name:'Moneda',icon:'coin'},bag:{name:'Bolsa',icon:'bag'}
  };
  const FACTIONS={
    Marquesado:{icon:'faction-cat',className:'cat',color:'var(--cat)',outcomes:['Batalló','Reclutó','Construyó','Movió','Ganó territorio','Perdió territorio']},
    Eyrie:{icon:'faction-bird',className:'bird',color:'var(--bird)',outcomes:['Batalló','Reclutó','Construyó','Movió','Ganó territorio','Perdió territorio']},
    Alianza:{icon:'faction-alliance',className:'alliance',color:'var(--alliance)',outcomes:['Extendió simpatía','Revuelta','Reclutó','Movilizó','Ganó territorio','Perdió territorio']}
  };
  const SUITS={mouse:{name:'Ratón',icon:'suit-mouse'},rabbit:{name:'Conejo',icon:'suit-rabbit'},fox:{name:'Zorro',icon:'suit-fox'},bird:{name:'Ave',icon:'suit-bird'}};
  const STATES=[{name:'Alerta',icon:'alert'},{name:'Bloqueo',icon:'lock'},{name:'Tensión',icon:'sword'},{name:'Escasez',icon:'bread'},{name:'Fortificado',icon:'shield'},{name:'Revuelta',icon:'leaf'},{name:'Caos',icon:'flame'}];
  const LANDMARKS=[
    {id:'forge',name:'Forja Legendaria',icon:'forge',description:'Artesanía, reparación y mejoras de equipo.',services:['Reparar','Fabricar','Mejorar']},
    {id:'market',name:'Mercado Negro',icon:'market',description:'Información, objetos, favores y contactos discretos.',services:['Comerciar','Información','Contacto']},
    {id:'ruins',name:'Ciudad Perdida',icon:'ruins',description:'Reliquias, rutas olvidadas y secretos bajo el bosque.',services:['Explorar','Reliquia','Pasaje']},
    {id:'tree',name:'Árbol Ancestral',icon:'tree',description:'Refugio neutral, descanso y mediación.',services:['Descansar','Rumores','Mediar']}
  ];
  const ACTIONS=[
    {id:'special',label:'Habilidad única',icon:'star',cost:1,tone:'special'},
    {id:'move',label:'Mover',icon:'move',cost:1,tone:'special'},
    {id:'observe',label:'Observar',icon:'eye',cost:1},
    {id:'talk',label:'Hablar',icon:'chat',cost:1},
    {id:'investigate',label:'Investigar',icon:'search',cost:1},
    {id:'trade',label:'Comerciar',icon:'coin',cost:1},
    {id:'infiltrate',label:'Infiltrar',icon:'key',cost:1},
    {id:'combat',label:'Combatir',icon:'sword',cost:1,tone:'danger'},
    {id:'explore',label:'Explorar',icon:'torch',cost:1},
    {id:'help',label:'Apoyar facción',icon:'handshake',cost:1},
    {id:'craft',label:'Fabricar / reparar',icon:'hammer',cost:1},
    {id:'rest',label:'Descansar',icon:'rest',cost:2}
  ];

  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
  const ico=(id,cls='')=>`<svg class="ico ${cls}"><use href="./icons.svg#${id}"></use></svg>`;

  function item(type,status='ready',source='starting'){return{id:uid(),type,status,source,obtainedDay:1}}
  function characterShell(){
    return{id:uid(),name:'',vagabondType:null,startingItems:[],currentItems:[],specialAbility:null,skills:[],milestones:[],pendingSkillChoices:0,reputation:{Marquesado:0,Eyrie:0,Alianza:0},discoveries:[],importantEvents:[],clear:'',signatureActionCount:0};
  }
  function fresh(){
    return{version:'0.6',onboarded:false,campaign:'Crónicas del Bosque',day:1,time:0,phase:'player',actions:[],character:characterShell(),bots:{Marquesado:true,Eyrie:true,Alianza:false},world:{day:1,resolved:{Marquesado:false,Eyrie:false,Alianza:false},records:{}},orderHistory:[],states:[],rumors:[],missions:[],landmarks:LANDMARKS.map(x=>({...x,level:0,clear:''})),log:[]};
  }
  function legacyItemType(k){
    const map={'⚔️ Espada':'sword','👢 Bota':'boot','🔥 Antorcha':'torch','🔨 Martillo':'hammer','🏹 Ballesta':'crossbow','🍵 Té':'tea','🪙 Moneda':'coin','🎒 Bolsa':'bag'};
    return map[k]||k;
  }
  function migrate(old){
    const n=fresh(); if(!old)return n;
    n.day=old.day||1;n.time=old.time||0;n.phase=old.phase||'player';n.campaign=old.campaign||n.campaign;
    n.bots=old.bots||n.bots;n.world=old.world||n.world;n.orderHistory=old.orderHistory||[];
    n.states=Array.isArray(old.states)?old.states:[];
    n.rumors=Array.isArray(old.rumors)?old.rumors:[];
    n.missions=Array.isArray(old.missions)?old.missions.map(m=>({
      ...m,id:m.id||uid(),status:m.status||'active',stage:m.stage||'lead',targetClear:m.targetClear||null,tags:Array.isArray(m.tags)?m.tags:missionTags(m?.source?.outcome)
    })):[];
    n.landmarks=Array.isArray(old.landmarks)?LANDMARKS.map(base=>{
      const hit=old.landmarks.find(x=>x.id===base.id||String(x.name||'').includes(base.name.split(' ')[0]));
      return hit?{...base,level:hit.level||0,clear:hit.clear||''}:{...base,level:0,clear:''}
    }):n.landmarks;
    n.log=Array.isArray(old.log)?old.log:[];
    n.actions=Array.isArray(old.actions)?old.actions:[];

    const oc=old.character||{};
    n.character.name=old.playerName||oc.name||'';
    n.character.clear=oc.clear||'';
    n.character.reputation=old.reputations||oc.reputation||n.character.reputation;

    if(oc.vagabondType&&VAGS[oc.vagabondType]){
      setupCharacter(n.character.name,oc.vagabondType,n.character);
      if(Array.isArray(oc.currentItems)&&oc.currentItems.length){
        n.character.currentItems=oc.currentItems.map(it=>({
          id:it.id||uid(),
          type:legacyItemType(it.type),
          status:['ready','exhausted','damaged'].includes(it.status)?it.status:'ready',
          source:it.source||'legacy',
          obtainedDay:it.obtainedDay||1
        }));
      }
      n.character.skills=Array.isArray(oc.skills)?oc.skills:[];
      n.character.milestones=Array.isArray(oc.milestones)?oc.milestones:[];
      n.character.pendingSkillChoices=oc.pendingSkillChoices||0;
      n.character.discoveries=Array.isArray(oc.discoveries)?oc.discoveries:[];
      n.character.importantEvents=Array.isArray(oc.importantEvents)?oc.importantEvents:[];
      n.character.signatureActionCount=oc.signatureActionCount||0;
      n.character.clear=oc.clear||'';
      n.character.reputation=oc.reputation||old.reputations||n.character.reputation;
      n.onboarded=true;
    }else{
      const inv=old.inventory||{};
      n.character._legacyItems=[];
      Object.entries(inv).forEach(([k,v])=>{for(let i=0;i<Number(v||0);i++)n.character._legacyItems.push(legacyItemType(k))});
      n.onboarded=false;
    }
    return n;
  }
    function setupCharacter(name,type,target=null){
    const c=target||characterShell(),d=VAGS[type];
    c.name=name;c.vagabondType=type;c.startingItems=[...d.startingItems];c.specialAbility={...d.specialAbility};c.skills=[];c.milestones=[];c.pendingSkillChoices=0;c.discoveries=[];c.importantEvents=[];c.signatureActionCount=0;
    c.currentItems=d.startingItems.map(t=>item(t,'ready','starting'));
    c.reputation=c.reputation||{Marquesado:0,Eyrie:0,Alianza:0};c.clear=c.clear||'';
    return c;
  }

  let S;
  try{S=JSON.parse(localStorage.getItem(KEY));if(!S){for(const k of LEGACY){const o=JSON.parse(localStorage.getItem(k));if(o){S=migrate(o);break}}}if(!S)S=fresh()}catch(_){S=fresh()}
  const sheet={bg:$('#sheetBackdrop'),title:$('#sheetTitle'),sub:$('#sheetSub'),content:$('#sheetContent')};

  function save(){localStorage.setItem(KEY,JSON.stringify(S));const c=$('#saveChip');if(c){c.textContent='Guardado';clearTimeout(save.t);save.t=setTimeout(()=>c.textContent='Autoguardado',700)}}
  function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1500)}
  function addLog(text,icon='scroll'){S.log.unshift({day:S.day,text,icon});save();renderHistory()}
  function repLabel(v){return v<=-3?'Enemigo':v===-2?'Hostil':v===-1?'Sospechoso':v===0?'Neutral':v===1?'Conocido':v===2?'Confiable':'Aliado'}
  function activeBots(){return Object.keys(S.bots).filter(k=>S.bots[k])}
  function ensureWorld(){if(!S.world||S.world.day!==S.day)S.world={day:S.day,resolved:{Marquesado:false,Eyrie:false,Alianza:false},records:{}}}
  function openSheet(title,sub,html,bind){sheet.title.textContent=title;sheet.sub.textContent=sub||'';sheet.content.innerHTML=html+`<button class="btn secondary" data-close style="width:100%;margin-top:14px">Cerrar</button>`;sheet.bg.classList.add('open');if(bind)bind(sheet.content);const x=sheet.content.querySelector('[data-close]');if(x)x.onclick=closeSheet}
  function closeSheet(){sheet.bg.classList.remove('open')}
  sheet.bg.onclick=e=>{if(e.target===sheet.bg)closeSheet()};
  function choiceSheet(title,sub,choices,onPick){openSheet(title,sub,`<div class="choice-grid">${choices.map((c,i)=>`<button class="choice-btn" data-choice="${i}">${c.icon?ico(c.icon):''}<span>${esc(c.label)}</span></button>`).join('')}</div>`,r=>r.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>onPick(choices[+b.dataset.choice])))}
  function chooseClear(title,onPick){openSheet(title,'Toca el claro físico del tablero.',`<div class="clear-grid">${Array.from({length:12},(_,i)=>i+1).map(n=>`<button class="clear-btn" data-clear="${n}">${n}</button>`).join('')}</div>`,r=>r.querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>onPick(b.dataset.clear)))}

  function countReady(type){return S.character.currentItems.filter(i=>i.type===type&&i.status==='ready').length}
  function getItem(id){return S.character.currentItems.find(i=>i.id===id)}
  function setItemStatus(id,status){const i=getItem(id);if(i){i.status=status;save();renderInventory()}}
  function exhaustOne(type){const i=S.character.currentItems.find(x=>x.type===type&&x.status==='ready');if(!i)return false;i.status='exhausted';return true}

  function signatureActions(){return VAGS[S.character.vagabondType]?.signatureActionIds||[]}
  function recordAction({actionId='free',label,icon='spark',cost=1,clear='',meta='',effect=null}){
    if(S.phase==='world')return toast('Primero resuelve la Fase del Mundo'),false;
    if(S.time+cost>4)return toast('No queda suficiente tiempo'),false;
    S.time+=cost;if(clear)S.character.clear=String(clear);if(effect)effect();
    S.actions.push({day:S.day,actionId,label,icon,cost,clear:S.character.clear||'',meta});
    if(signatureActions().includes(actionId))S.character.signatureActionCount++;
    addLog(label+(meta?' · '+meta:'')+(cost?' ['+cost+' tiempo]':''),icon);
    if(S.time>=4){S.phase='world';ensureWorld()}
    evaluateMilestones();save();renderAll();return true;
  }
  function resultBand(t){if(t<=1)return{label:'Fallo + consecuencia',success:false};if(t<=3)return{label:'Éxito parcial / coste',success:true};if(t<=5)return{label:'Éxito',success:true};return{label:'Éxito excepcional',success:true}}
  function diceResolver({title,label,icon,cost=1,actionId='free',meta='',initialMod=0,after=null}){
    const d={a:null,b:null,mod:initialMod};openSheet(title,'Usa los dados físicos de Root.','');
    const draw=()=>{const ready=d.a!==null&&d.b!==null,t=ready?d.a+d.b+d.mod:null,b=ready?resultBand(t):null;sheet.content.innerHTML=`
      <div class="sheet-label">Dado 1</div><div class="dice-row">${[0,1,2,3].map(n=>`<button class="dice-btn ${d.a===n?'selected':''}" data-a="${n}">${n}</button>`).join('')}</div>
      <div class="sheet-label" style="margin-top:12px">Dado 2</div><div class="dice-row">${[0,1,2,3].map(n=>`<button class="dice-btn ${d.b===n?'selected':''}" data-b="${n}">${n}</button>`).join('')}</div>
      <div class="sheet-label" style="margin-top:12px">Modificador</div><div class="mod-row">${[-2,-1,0,1,2].map(n=>`<button class="mod-btn ${d.mod===n?'selected':''}" data-m="${n}">${n>0?'+':''}${n}</button>`).join('')}</div>
      ${ready?`<div class="result-card"><div class="result-score">${t}</div><div class="result-text">${b.label}</div></div>`:''}
      <button class="btn" id="saveRoll" style="width:100%;margin-top:12px" ${ready?'':'disabled'}>Registrar resultado</button><button class="btn secondary" data-close style="width:100%;margin-top:8px">Cerrar</button>`;
      sheet.content.querySelectorAll('[data-a]').forEach(x=>x.onclick=()=>{d.a=+x.dataset.a;draw()});sheet.content.querySelectorAll('[data-b]').forEach(x=>x.onclick=()=>{d.b=+x.dataset.b;draw()});sheet.content.querySelectorAll('[data-m]').forEach(x=>x.onclick=()=>{d.mod=+x.dataset.m;draw()});sheet.content.querySelector('[data-close]').onclick=closeSheet;
      const sv=$('#saveRoll');if(sv)sv.onclick=()=>{const band=resultBand(d.a+d.b+d.mod);if(recordAction({actionId,label,icon,cost,meta:(meta?meta+' · ':'')+band.label,effect:()=>after&&after(band)}))closeSheet()}
    };draw();
  }

  function useSpecialAbility(){
    const v=VAGS[S.character.vagabondType];if(!v)return;
    if(countReady('torch')<1)return toast('Necesitas una Antorcha lista');
    if(v.id==='thief')choiceSheet('STEAL','Agota una Antorcha y resuelve el robo con el actor presente.',[{icon:'faction-cat',label:'Marquesado'},{icon:'faction-bird',label:'Eyrie'},{icon:'faction-alliance',label:'Alianza'},{icon:'paw',label:'Otro actor'}],x=>{if(recordAction({actionId:'infiltrate',label:'STEAL',icon:'key',cost:1,meta:x.label,effect:()=>exhaustOne('torch')}))closeSheet()});
    if(v.id==='tinker')openSheet('DAY LABOR','Recupera físicamente una carta apropiada del descarte.',`<div class="result-card"><div class="item-title">La app no elige la carta</div><div class="result-text">Selecciona la carta legal en el descarte físico y luego confirma.</div></div><button class="btn" id="confirmAbility" style="width:100%;margin-top:12px">Carta recuperada</button>`,()=>$('#confirmAbility').onclick=()=>{if(recordAction({actionId:'craft',label:'DAY LABOR',icon:'hammer',cost:1,effect:()=>exhaustOne('torch')}))closeSheet()});
    if(v.id==='ranger'){
      const damaged=S.character.currentItems.filter(i=>i.status==='damaged');
      openSheet('HIDEOUT','Agota una Antorcha. Puedes reparar hasta 3 objetos dañados y termina tu jornada.',`<div class="choice-grid">${damaged.length?damaged.map(i=>`<button class="choice-btn" data-repair="${i.id}">${ico(ITEM_DEF[i.type].icon)}<span>${ITEM_DEF[i.type].name}</span></button>`).join(''):'<div class="empty">No hay objetos dañados. Puedes usar Hideout solo para retirarte.</div>'}</div><button class="btn" id="finishHideout" style="width:100%;margin-top:12px">Usar Hideout</button>`,root=>{
        const picked=new Set();root.querySelectorAll('[data-repair]').forEach(b=>b.onclick=()=>{const id=b.dataset.repair;if(picked.has(id)){picked.delete(id);b.classList.remove('selected')}else if(picked.size<3){picked.add(id);b.classList.add('selected')}});
        $('#finishHideout').onclick=()=>{picked.forEach(id=>{const it=getItem(id);if(it)it.status='ready'});exhaustOne('torch');S.phase='world';ensureWorld();addLog('HIDEOUT · retirada y reparación','rest');save();closeSheet();renderAll()}
      });
    }
  }

  function openAction(id){
    if(id==='special')return useSpecialAbility();
    if(id==='move')return chooseClear('Mover',c=>{if(recordAction({actionId:'move',label:`Mover al claro ${c}`,icon:'move',cost:1,clear:c}))closeSheet()});
    if(id==='observe')return choiceSheet('Observar','¿Dónde pones la atención?',[{icon:'eye',label:'Entorno'},{icon:'world',label:'Facción'},{icon:'card',label:'Rumor'},{icon:'landmark',label:'Lugar'}],c=>{if(recordAction({actionId:'observe',label:'Observar',icon:'eye',cost:1,meta:c.label}))closeSheet()});
    if(id==='talk')return choiceSheet('Hablar','¿Con quién?',[{icon:'chat',label:'Habitante'},{icon:'market',label:'Comerciante'},{icon:'shield',label:'Patrulla'},{icon:'handshake',label:'Contacto'}],c=>{if(recordAction({actionId:'talk',label:'Hablar',icon:'chat',cost:1,meta:c.label}))closeSheet()});
    if(id==='investigate')return diceResolver({title:'Investigar',label:'Investigar',icon:'search',actionId:'investigate',cost:1});
    if(id==='trade')return choiceSheet('Comerciar','Elige el intercambio.',[{icon:'coin',label:'Comprar'},{icon:'coin',label:'Vender'},{icon:'key',label:'Sobornar'},{icon:'handshake',label:'Favores'}],c=>{if(recordAction({actionId:'trade',label:'Comerciar',icon:'coin',cost:1,meta:c.label}))closeSheet()});
    if(id==='infiltrate')return diceResolver({title:'Infiltrar',label:'Infiltrar',icon:'key',actionId:'infiltrate',cost:1});
    if(id==='combat')return diceResolver({title:'Combatir',label:'Combatir',icon:'sword',actionId:'combat',cost:1});
    if(id==='explore')return diceResolver({title:'Explorar',label:'Explorar',icon:'torch',actionId:'explore',cost:1});
    if(id==='help')return choiceSheet('Apoyar facción','¿A quién? ',Object.keys(FACTIONS).map(n=>({icon:FACTIONS[n].icon,label:n})),f=>choiceSheet('Impacto','¿Cambió realmente la relación?',[{label:'Sin cambio',rep:0},{label:'+1 reputación',rep:1}],r=>{if(recordAction({actionId:'help',label:`Apoyar a ${f.label}`,icon:'handshake',cost:1,effect:()=>{if(r.rep)S.character.reputation[f.label]=clamp(S.character.reputation[f.label]+1,-3,3)}}))closeSheet()}));
    if(id==='craft'){if(!S.character.currentItems.some(i=>i.type==='hammer'&&i.status==='ready'))return toast('Necesitas un Martillo listo');return diceResolver({title:'Fabricar / reparar',label:'Fabricar / reparar',icon:'hammer',actionId:'craft',cost:1})}
    if(id==='rest')return choiceSheet('Descansar','Puedes preparar un objeto agotado.',S.character.currentItems.filter(i=>i.status==='exhausted').map(i=>({icon:ITEM_DEF[i.type].icon,label:ITEM_DEF[i.type].name,id:i.id})).concat([{icon:'rest',label:'Solo descansar',id:null}]),x=>{if(recordAction({actionId:'rest',label:'Descansar',icon:'rest',cost:2,effect:()=>{if(x.id)setItemStatus(x.id,'ready')}}))closeSheet()});
  }

  function milestone(id,label){if(S.character.milestones.some(m=>m.id===id))return;S.character.milestones.push({id,label,day:S.day,dateUnlocked:new Date().toISOString()});S.character.pendingSkillChoices++;addLog(`Nuevo hito: ${label}`,'star');toast('Nueva habilidad disponible')}
  function evaluateMilestones(){
    const complete=S.missions.filter(m=>m.status==='completed').length;
    if(complete>=1)milestone(MILESTONES.firstMission.id,MILESTONES.firstMission.label);
    if(complete>=3)milestone(MILESTONES.thirdMission.id,MILESTONES.thirdMission.label);
    if(S.landmarks.some(l=>l.clear))milestone(MILESTONES.firstLandmark.id,MILESTONES.firstLandmark.label);
    if(S.landmarks.some(l=>l.level>=3))milestone(MILESTONES.bondedLandmark.id,MILESTONES.bondedLandmark.label);
    if(Object.values(S.character.reputation).some(v=>v>=2))milestone(MILESTONES.firstTrustedFaction.id,MILESTONES.firstTrustedFaction.label);
    if(new Set(S.character.currentItems.map(i=>i.type)).size>=5)milestone(MILESTONES.itemBreadth.id,MILESTONES.itemBreadth.label);
    if(S.character.signatureActionCount>=3)milestone(MILESTONES.signatureActions.id,MILESTONES.signatureActions.label);
    if(S.character.importantEvents.length)milestone(MILESTONES.majorWorldEvent.id,MILESTONES.majorWorldEvent.label);
  }
  function skillDefs(){return VAGS[S.character.vagabondType]?.skills||[]}
  function unlocked(id){return S.character.skills.some(s=>s.id===id)}
  function skillAvailable(s){return !unlocked(s.id)&&(s.unlockRequirements||[]).every(unlocked)}
  function unlockSkill(id){const d=skillDefs().find(s=>s.id===id);if(!d||!skillAvailable(d)||S.character.pendingSkillChoices<1)return;S.character.skills.push({...d,unlocked:true,dateUnlocked:new Date().toISOString()});S.character.pendingSkillChoices--;addLog(`Nueva habilidad: ${d.name}`,'star');save();renderAll();toast(d.name+' desbloqueada')}
  function missionOptions(m){return S.character.skills.flatMap(s=>(s.opensOptions||[]).filter(o=>(m.tags||[]).includes(o.tag)).map(o=>({...o,skill:s.name})))}

  function missionTags(outcome){
    return{
      'Batalló':['ambush','dangerous_target','salvage','survival_extreme'],
      'Reclutó':['information','faction_rumor','tracking','contraband'],
      'Construyó':['infiltration','alternative_entry','tracking','salvage','information'],
      'Movió':['tracking','difficult_route','pursuit','information'],
      'Movilizó':['tracking','difficult_route','information'],
      'Ganó territorio':['hidden_location','infiltration','alternative_entry','engineering'],
      'Perdió territorio':['salvage','rare_salvage','loot','hidden_location'],
      'Extendió simpatía':['faction_rumor','information','alternative_entry'],
      'Revuelta':['salvage','repair','survival_extreme','rare_salvage']
    }[outcome]||['information'];
  }
  function rewardFor(o){return{'Batalló':'sword','Reclutó':'bag','Construyó':'hammer','Movió':'boot','Movilizó':'boot','Ganó territorio':'crossbow','Perdió territorio':'tea','Extendió simpatía':'coin','Revuelta':'torch'}[o]||'coin'}
  function missionDraft(origin,suit,outcomes){
    const p=outcomes[0]||'Movió',land=SUITS[suit]?.name||'bosque',d={
      'Batalló':['Tras las líneas',`Aprovecha el conflicto de ${origin} en territorio ${land} sin quedar atrapado.`],
      'Reclutó':['Nombres en la lista',`Descubre quién está siendo reclutado por ${origin} en los claros de ${land}.`],
      'Construyó':['Suministros desviados',`Sigue el flujo de materiales de ${origin} en territorio ${land}.`],
      'Movió':['Rastro en los caminos',`Sigue el desplazamiento de ${origin} por territorio ${land}.`],
      'Movilizó':['Mensajeros en tránsito',`Sigue la red de movimiento clandestino en territorio ${land}.`],
      'Ganó territorio':['Nueva frontera',`Explora el nuevo borde de control de ${origin} en territorio ${land}.`],
      'Perdió territorio':['Vacío de poder',`Entra al espacio que ${origin} acaba de perder en territorio ${land}.`],
      'Extendió simpatía':['Mensajes bajo la corteza',`Sigue la nueva red de simpatizantes entre los claros de ${land}.`],
      'Revuelta':['Después de las llamas',`Llega al territorio ${land} tras la revuelta y encuentra qué quedó atrás.`]
    }[p]||['Oportunidad del bosque',`Investiga qué ocurre con ${origin}.`];
    return{id:uid(),day:S.day,origin,suit,title:d[0],objective:d[1],reward:rewardFor(p),status:'active',stage:'lead',targetClear:null,tags:missionTags(p),source:{outcome:p,outcomes}};
  }
  function rumorDraft(origin,suit,outcomes,mission){const p=outcomes[0]||'Movió',land=SUITS[suit]?.name.toLowerCase()||'bosque',t={
    'Batalló':`Se habla de nuevos choques de ${origin} en los claros de ${land}.`,'Reclutó':`${origin} está reuniendo nuevos partidarios entre los habitantes de ${land}.`,'Construyó':`Carretas y materiales de ${origin} están entrando al territorio de ${land}.`,'Movió':`Patrullas de ${origin} cruzan los caminos de ${land} con urgencia.`,'Ganó territorio':`${origin} consolida una nueva frontera en territorio de ${land}.`,'Perdió territorio':`La autoridad de ${origin} parece debilitarse en los claros de ${land}.`,'Extendió simpatía':`Símbolos clandestinos aparecen en los claros de ${land}.`,'Revuelta':`Una revuelta sacudió territorio de ${land}.`}[p];return{id:uid(),day:S.day,suit,origin,text:t||`Algo está cambiando alrededor de ${origin}.`,seed:mission}}
  function archiveOrders(){activeBots().forEach(n=>{const r=S.world.records[n];if(r)S.orderHistory.unshift({id:uid(),day:S.day,origin:n,suit:r.suit,outcomes:[...r.outcomes]})});S.orderHistory=S.orderHistory.slice(0,30)}

  function orderFace(origin,suit){const f=FACTIONS[origin],s=SUITS[suit];return`<div class="order-face"><svg class="ico order-face-art"><use href="./icons.svg#scene-${suit}"></use></svg><div class="order-suit-medallion">${ico(s.icon)}</div><span class="order-face-label">${s.name}</span></div>`}
  function openBot(name){ensureWorld();const f=FACTIONS[name],old=S.world.records[name]||{suit:null,outcomes:[]},d={suit:old.suit,outcomes:[...old.outcomes]};openSheet(name,'Carta de Orden + cambios reales en mesa.','');const draw=()=>{sheet.content.innerHTML=`${d.suit?orderFace(name,d.suit):''}<div class="sheet-label" style="margin-top:12px">Carta de Orden</div><div class="suit-row">${Object.entries(SUITS).map(([id,s])=>`<button class="suit-btn ${d.suit===id?'selected':''}" data-s="${id}">${ico(s.icon)}</button>`).join('')}</div><div class="sheet-label" style="margin-top:12px">Qué ocurrió</div><div class="choice-grid">${f.outcomes.map((o,i)=>`<button class="choice-btn ${d.outcomes.includes(o)?'selected':''}" data-o="${i}">${o}</button>`).join('')}</div><button class="btn" id="saveOrder" style="width:100%;margin-top:12px" ${d.suit?'':'disabled'}>Sellar orden</button><button class="btn secondary" data-close style="width:100%;margin-top:8px">Cerrar</button>`;sheet.content.querySelectorAll('[data-s]').forEach(x=>x.onclick=()=>{d.suit=x.dataset.s;draw()});sheet.content.querySelectorAll('[data-o]').forEach(x=>x.onclick=()=>{const o=f.outcomes[+x.dataset.o];d.outcomes=d.outcomes.includes(o)?d.outcomes.filter(y=>y!==o):[...d.outcomes,o];draw()});sheet.content.querySelector('[data-close]').onclick=closeSheet;$('#saveOrder').onclick=()=>{S.world.records[name]={suit:d.suit,outcomes:d.outcomes};S.world.resolved[name]=true;addLog(`Orden de ${name}: ${SUITS[d.suit].name}`,'card');save();closeSheet();renderAll();if(activeBots().every(n=>S.world.resolved[n]))setTimeout(openHarvest,150)}};draw()}
  function openHarvest(){if(!activeBots().every(n=>S.world.resolved[n]))return toast('Quedan órdenes pendientes');const seeds=activeBots().map(n=>({origin:n,...S.world.records[n]}));let i=0;const next=()=>{if(i>=seeds.length)return finishWorld();const s=seeds[i],m=missionDraft(s.origin,s.suit,s.outcomes),r=rumorDraft(s.origin,s.suit,s.outcomes,m),f=FACTIONS[s.origin];openSheet(`Consecuencia · ${s.origin}`,'¿Qué deja esta orden en el mundo?',`${orderFace(s.origin,s.suit)}<div class="rumor-card" style="--rumor-color:${f.color};margin-top:12px"><div class="rumor-copy">“${esc(r.text)}”</div></div><div class="choice-grid" style="margin-top:12px"><button class="choice-btn" id="asRumor">${ico('card')}Rumor</button><button class="choice-btn" id="asMission">${ico('star')}Misión</button><button class="choice-btn" id="asBackground">${ico('world')}Fondo</button></div>`,()=>{$('#asRumor').onclick=()=>{if(S.rumors.length<3)S.rumors.push(r);i++;closeSheet();next()};$('#asMission').onclick=()=>{S.missions.push(m);i++;closeSheet();next()};$('#asBackground').onclick=()=>{i++;closeSheet();next()}})};next()}
  function finishWorld(){
    archiveOrders();
    addLog('Fase del Mundo cerrada.','world');

    const readyTea=S.character.currentItems.filter(i=>i.type==='tea'&&i.status==='ready').length;
    const exhausted=S.character.currentItems.filter(i=>i.status==='exhausted');
    const refreshCapacity=3+(2*readyTea);

    S.day++;S.time=0;S.phase='player';
    S.world={day:S.day,resolved:{Marquesado:false,Eyrie:false,Alianza:false},records:{}};
    save();closeSheet();renderAll();switchView('turno');

    const refreshCount=Math.min(refreshCapacity,exhausted.length);
    if(refreshCount===0){toast(`Día ${S.day}`);return}
    if(exhausted.length<=refreshCapacity){
      exhausted.forEach(i=>i.status='ready');
      addLog(`Birdsong · ${refreshCount} objeto(s) refrescado(s).`,'rest');
      save();renderAll();toast(`Día ${S.day}`);
      return;
    }

    const selected=new Set();
    openSheet('Birdsong · Refresh',`Elige exactamente ${refreshCount} objetos agotados. Tus Té listos aportaron ${readyTea*2} refresh adicional.`,'');
    const draw=()=>{
      sheet.content.innerHTML=`
        <div class="refresh-grid">
          ${exhausted.map(it=>`<button class="refresh-item ${selected.has(it.id)?'selected':''}" data-refresh="${it.id}">${ico(ITEM_DEF[it.type].icon)}<span>${ITEM_DEF[it.type].name}</span></button>`).join('')}
        </div>
        <div class="result-card"><div class="item-title">${selected.size} / ${refreshCount}</div><div class="result-text">El tablero físico sigue siendo la referencia de qué objetos están agotados.</div></div>
        <button class="btn" id="confirmRefresh" style="width:100%;margin-top:12px" ${selected.size===refreshCount?'':'disabled'}>Refrescar objetos</button>`;
      sheet.content.querySelectorAll('[data-refresh]').forEach(b=>b.onclick=()=>{
        const id=b.dataset.refresh;
        if(selected.has(id))selected.delete(id);
        else if(selected.size<refreshCount)selected.add(id);
        draw();
      });
      const confirm=$('#confirmRefresh');
      if(confirm)confirm.onclick=()=>{
        selected.forEach(id=>{const it=getItem(id);if(it)it.status='ready'});
        addLog(`Birdsong · ${refreshCount} objeto(s) refrescado(s).`,'rest');
        save();closeSheet();renderAll();toast(`Día ${S.day}`);
      };
    };
    draw();
  }

    function resolveMission(m,option=null){
    const opt=typeof option==='string'?{label:option,resolution:'generic'}:(option||{label:'Resolver escena',resolution:'generic'});
    const mod=opt.resolution==='special'?2:(opt.resolution==='skill'||opt.resolution==='reward'?1:0);
    diceResolver({
      title:opt.label,
      label:`Misión · ${m.title}`,
      icon:'star',
      actionId:'investigate',
      cost:1,
      meta:opt.skill?`${opt.label} · ${opt.skill}`:opt.label,
      initialMod:mod,
      after:band=>{
        if(band.success){
          m.stage='reward';
          m.routeUsed=opt.label;
          m.skillUsed=opt.skill||null;
          m.rewardChoice=opt.resolution==='reward';
          save();renderMissions();
        }else{
          addLog(`Complicación en ${m.title}`,'alert');
          save();renderMissions();
        }
      }
    });
  }

  function progressLead(m){
    if(recordAction({actionId:'investigate',label:`Investigar pista · ${m.title}`,icon:'search',cost:1})){
      chooseClear('Localizar objetivo',c=>{
        m.targetClear=String(c);m.stage='travel';save();closeSheet();renderMissions();
      });
    }
  }

  function moveToMission(m){
    if(!m.targetClear)return progressLead(m);
    if(recordAction({actionId:'move',label:`Viajar hacia · ${m.title}`,icon:'move',cost:1,clear:m.targetClear,meta:`Claro ${m.targetClear}`})){
      m.stage='scene';save();renderAll();switchView('descubrir');
    }
  }

  function enterScene(m){m.stage='scene';save();renderMissions()}

  function claimReward(m,rewardType=null){
    const chosen=rewardType||m.reward;
    S.character.currentItems.push(item(chosen,'ready','mission'));
    m.status='completed';m.stage='done';m.claimedReward=chosen;
    addLog(`Misión cumplida: ${m.title} · obtienes ${ITEM_DEF[chosen].name}`,'star');
    evaluateMilestones();save();renderAll();toast('Recompensa obtenida');
  }

    function renderHeader(){const v=VAGS[S.character.vagabondType];$('#heroName').textContent=S.campaign;$('#heroSubtitle').textContent=`Día ${S.day} · ${S.character.name||'Vagabundo'}`;$('#heroType').textContent=v?.name||'—';$('#heroClear').textContent=S.character.clear||'—';$('#heroItems').textContent=S.character.currentItems.length;$('#heroMilestones').textContent=S.character.milestones.length;$('#timeText').textContent=`${S.time} / 4`;$$('#timePips .time-pip').forEach((p,i)=>p.classList.toggle('on',i<S.time))}
  function renderActions(){const g=$('#actionGrid');g.innerHTML='';ACTIONS.forEach(a=>{const b=document.createElement('button');b.className=`action-btn ${a.tone||''}`;const label=a.id==='special'?(VAGS[S.character.vagabondType]?.specialAbility.name||a.label):a.label;b.innerHTML=`<div class="action-icon">${ico(a.icon)}</div><div><div class="action-label">${label}</div><div class="action-cost">${a.cost} tiempo</div></div>`;b.onclick=()=>openAction(a.id);g.appendChild(b)})}
  function renderToday(){const b=$('#todayTimeline'),arr=S.actions.filter(a=>a.day===S.day);$('#todayCount').textContent=`${arr.length} ${arr.length===1?'acción':'acciones'}`;b.innerHTML=arr.length?'':'<div class="empty">El día está abierto.</div>';arr.forEach(a=>{const r=document.createElement('div');r.className='timeline-item';r.innerHTML=`<div class="timeline-icon">${ico(a.icon||'spark')}</div><div><div class="timeline-title">${esc(a.label)}</div><div class="timeline-meta">${esc(a.meta||'')}${a.clear?' · Claro '+a.clear:''}</div></div><span class="tag">${a.cost}t</span>`;b.appendChild(r)});$('#endDayBtn').style.display=S.phase==='world'?'none':'block'}
  function renderWorldBanner(){const h=$('#worldBanner');if(S.phase!=='world'){h.innerHTML='';return}ensureWorld();const bs=activeBots(),done=bs.filter(n=>S.world.resolved[n]).length;h.innerHTML=`<div class="world-banner"><div><h3>Fase del Mundo</h3><p>${done}/${bs.length} órdenes resueltas.</p></div><button class="btn secondary" id="goWorld">Resolver</button></div>`;$('#goWorld').onclick=()=>switchView('mundo')}

  function renderCharacter(){
    const v=VAGS[S.character.vagabondType];if(!v)return;
    $('#vagabondTypeLabel').textContent=v.playstyle;
    const host=$('#vagabondSheet');
    host.innerHTML=`
      <div class="character-sheet">
        <div class="character-portrait-wrap"><img class="character-portrait" src="${v.portrait}" alt="Retrato de ${v.name}"></div>
        <div class="character-sheet-copy">
          <div class="eyebrow dark-eyebrow">${v.name}</div>
          <div class="character-name big">${esc(S.character.name)}</div>
          <div class="character-tagline">${esc(v.tagline)}</div>
          <div class="ability-card">
            <div class="ability-kicker">Habilidad única</div>
            <div class="ability-title">${v.specialAbility.name}</div>
            <div class="ability-copy">${esc(v.specialAbility.description)}</div>
            <button class="chip" id="useAbilityFromSheet" style="margin-top:9px">Usar habilidad</button>
          </div>
        </div>
      </div>
      ${S.character.pendingSkillChoices>0?`<div class="skill-ready"><div><strong>Nueva habilidad disponible</strong><span>Tienes ${S.character.pendingSkillChoices} elección pendiente.</span></div><button class="btn gold" id="jumpSkills">Elegir</button></div>`:''}
    `;
    $('#useAbilityFromSheet').onclick=useSpecialAbility;
    const js=$('#jumpSkills');if(js)js.onclick=()=>document.getElementById('skillTree').scrollIntoView({behavior:'smooth'});
  }
  function renderInventory(){const b=$('#inventoryGrid');b.innerHTML='';S.character.currentItems.forEach(it=>{const d=ITEM_DEF[it.type],c=document.createElement('button');c.className=`inv item-${it.status}`;c.innerHTML=`<div class="inv-icon">${ico(d.icon)}</div><div class="inv-name">${d.name}</div><div class="item-status">${it.status==='ready'?'Listo':it.status==='exhausted'?'Agotado':'Dañado'}</div>`;c.onclick=()=>choiceSheet(d.name,'Actualiza solo para reflejar la pieza física.',[{label:'Listo',status:'ready'},{label:'Agotado',status:'exhausted'},{label:'Dañado',status:'damaged'},{label:'Quitar objeto',status:'remove'}],x=>{if(x.status==='remove')S.character.currentItems=S.character.currentItems.filter(i=>i.id!==it.id);else it.status=x.status;save();closeSheet();renderAll()});b.appendChild(c)});const add=document.createElement('button');add.className='inv add-item';add.innerHTML=`<div class="inv-icon">${ico('bag')}</div><div class="inv-name">Añadir objeto</div>`;add.onclick=()=>choiceSheet('Añadir objeto','Refleja un objeto físico que acabas de conseguir.',Object.entries(ITEM_DEF).map(([id,d])=>({icon:d.icon,label:d.name,id})),x=>{S.character.currentItems.push(item(x.id,'ready','manual'));evaluateMilestones();save();closeSheet();renderAll()});b.appendChild(add)}
  function renderSkillTree(){const v=VAGS[S.character.vagabondType],b=$('#skillTree');$('#skillStatus').textContent=S.character.pendingSkillChoices>0?`${S.character.pendingSkillChoices} elección disponible`:'hitos y caminos';b.innerHTML='';v.branches.forEach(br=>{const col=document.createElement('div');col.className='skill-branch';col.innerHTML=`<div class="branch-head"><strong>${br.name}</strong><span>${br.summary}</span></div>`;v.skills.filter(s=>s.branch===br.id).sort((a,b)=>a.tier-b.tier).forEach(s=>{const isU=unlocked(s.id),avail=skillAvailable(s),node=document.createElement('button');node.className=`skill-node ${isU?'unlocked':avail?'available':'locked'}`;node.innerHTML=`<span class="skill-state">${isU?'✓':avail?'○':'⌕'}</span><span><strong>${s.name}</strong><small>${s.description}</small></span>`;node.onclick=()=>{if(isU)return openSheet(s.name,'Habilidad adquirida',`<div class="result-card"><div class="result-text">${esc(s.description)}</div></div>`);if(!avail)return toast('Desbloquea primero la habilidad anterior de esta rama');if(S.character.pendingSkillChoices<1)return toast('Necesitas un nuevo hito');openSheet(s.name,'Usarás 1 elección de habilidad.',`<div class="result-card"><div class="result-text">${esc(s.description)}</div></div><button class="btn" id="confirmSkill" style="width:100%;margin-top:12px">Desbloquear</button>`,()=>$('#confirmSkill').onclick=()=>{unlockSkill(s.id);closeSheet()})};col.appendChild(node)});b.appendChild(col)})}
  function renderMilestones(){const b=$('#milestoneList');b.innerHTML=S.character.milestones.length?'':'<div class="empty">Aún no has alcanzado hitos importantes.</div>';S.character.milestones.forEach(m=>{const r=document.createElement('div');r.className='milestone-row';r.innerHTML=`${ico('star')}<div><strong>${esc(m.label)}</strong><span>Día ${m.day}</span></div>`;b.appendChild(r)})}
  function renderReputation(){const b=$('#reputationList');b.innerHTML='';Object.entries(S.character.reputation).forEach(([n,v])=>{const f=FACTIONS[n],c=document.createElement('div');c.className='rep-card';c.innerHTML=`<div class="rep-top"><div class="rep-title"><div class="faction-seal ${f.className}">${ico(f.icon)}</div><div><div class="rep-name">${n}</div><div class="rep-state">${repLabel(v)}</div></div></div><strong>${v>0?'+':''}${v}</strong></div><div class="rep-actions"><button class="chip" data-d>-1</button><button class="chip" data-u>+1</button></div>`;c.querySelector('[data-d]').onclick=()=>{S.character.reputation[n]=clamp(v-1,-3,3);save();renderReputation()};c.querySelector('[data-u]').onclick=()=>{S.character.reputation[n]=clamp(v+1,-3,3);evaluateMilestones();save();renderReputation()};b.appendChild(c)})}

  function renderBots(){ensureWorld();const b=$('#botList');b.innerHTML='';activeBots().forEach(n=>{const f=FACTIONS[n],r=S.world.records[n],done=S.world.resolved[n],c=document.createElement('div');c.className=`order-card ${f.className}`;c.innerHTML=`<div class="order-ribbon"></div><div class="order-card-body"><div class="order-card-head"><div class="order-faction"><div class="faction-seal ${f.className}">${ico(f.icon)}</div><div><div class="order-card-title">${n}</div><div class="order-card-status">${S.phase==='world'?(done?'Orden sellada':'Carta pendiente'):'Esperando Fase del Mundo'}</div></div></div><span class="tag">${r?.suit?SUITS[r.suit].name:'Sin carta'}</span></div>${r?.suit?orderFace(n,r.suit):''}<div class="order-card-actions"><button class="btn ${done?'secondary':''}" data-b ${S.phase!=='world'?'disabled':''}>${done?'Editar':'Resolver'}</button></div></div>`;c.querySelector('[data-b]').onclick=()=>openBot(n);b.appendChild(c)});if(S.phase==='world'){const ok=activeBots().every(n=>S.world.resolved[n]),c=document.createElement('div');c.className='bot-card';c.innerHTML=`<button class="btn gold" id="harvestBtn" style="width:100%" ${ok?'':'disabled'}>Procesar consecuencias</button>`;b.appendChild(c);$('#harvestBtn').onclick=openHarvest}}
  function renderOrderHistory(){const b=$('#orderHistoryList');b.innerHTML=S.orderHistory.length?'':'<div class="empty">Aquí quedarán las Cartas de Orden.</div>';S.orderHistory.slice(0,10).forEach(o=>{const r=document.createElement('div');r.className='order-history-card';r.innerHTML=`<div class="order-history-suit">${ico(SUITS[o.suit]?.icon||'card')}</div><div><div class="order-history-title">${o.origin} · ${SUITS[o.suit]?.name||''}</div><div class="order-history-meta">${o.outcomes.join(' · ')} · Día ${o.day}</div></div><span class="tag">D${o.day}</span>`;b.appendChild(r)})}
  function renderStates(){const b=$('#statesList');b.innerHTML=S.states.length?'':'<div class="empty">Sin estados activos.</div>';S.states.forEach((s,i)=>{const d=document.createElement('div');d.className='item';d.innerHTML=`<div class="item-head"><div class="item-title">Claro ${s.clear} · ${s.name}</div><button class="chip">Resolver</button></div>`;d.querySelector('button').onclick=()=>{S.states.splice(i,1);save();renderStates()};b.appendChild(d)})}
  function renderRumors(){
    const b=$('#rumorsList');
    $('#rumorCounter').textContent=`${S.rumors.length} / 3`;
    b.innerHTML=S.rumors.length?'':'<div class="empty">Sin rumores activos.</div>';
    S.rumors.forEach((r,i)=>{
      const f=FACTIONS[r.origin]||FACTIONS.Marquesado,d=document.createElement('div');
      d.className='rumor-card';d.style.setProperty('--rumor-color',f.color);
      d.innerHTML=`<div class="rumor-head"><div class="rumor-source"><div class="faction-seal ${f.className}">${ico(f.icon)}</div><div><div class="item-title">${r.origin}</div><div class="item-meta">${SUITS[r.suit]?.name} · Día ${r.day}</div></div></div></div><div class="rumor-copy">“${esc(r.text)}”</div><div class="btn-row" style="margin-top:10px"><button class="btn" data-f>Seguir pista</button><button class="btn secondary" data-r>Dejar morir</button></div>`;
      d.querySelector('[data-f]').onclick=()=>{
        const m=r.seed||missionDraft(r.origin,r.suit,['Movió']);
        if(!recordAction({actionId:'investigate',label:`Seguir rumor · ${m.title}`,icon:'search',cost:1,meta:r.text}))return;
        S.rumors.splice(i,1);
        m.stage='travel';
        S.missions.push(m);
        save();
        chooseClear('La pista conduce a…',c=>{
          m.targetClear=String(c);
          save();closeSheet();renderAll();switchView('descubrir');
        });
      };
      d.querySelector('[data-r]').onclick=()=>{S.rumors.splice(i,1);save();renderRumors()};
      b.appendChild(d);
    });
  }

    function renderMissions(){
    const b=$('#missionsList'),ms=S.missions.filter(m=>m.status==='active');
    $('#missionCounter').textContent=`${ms.length} activas`;
    b.innerHTML=ms.length?'':'<div class="empty">Las Órdenes pueden abrir misiones.</div>';

    ms.forEach(m=>{
      const f=FACTIONS[m.origin]||FACTIONS.Marquesado,reward=ITEM_DEF[m.reward],d=document.createElement('div');
      d.className='mission';d.style.setProperty('--mission-color',f.color);

      const stages=['lead','travel','scene'];
      const currentIndex=m.stage==='reward'?3:Math.max(0,stages.indexOf(m.stage));
      const progress=`
        <div class="mission-progress">
          ${['Pista','Objetivo','Resolución'].map((label,i)=>`<div class="mission-progress-step ${i<currentIndex?'done':i===currentIndex?'current':''}"><span>${i<currentIndex?ico('check'):i+1}</span><small>${label}</small></div>`).join('')}
        </div>`;

      let action='';
      if(m.stage==='lead')action=`<button class="btn" data-lead>Investigar pista</button>`;
      if(m.stage==='travel'){
        action=String(S.character.clear)===String(m.targetClear)
          ?`<button class="btn" data-enter>Entrar a la escena</button>`
          :`<button class="btn" data-journey>Mover al claro ${m.targetClear}</button>`;
      }
      if(m.stage==='scene'){
        const opts=missionOptions(m);
        action=`${opts.map((o,i)=>`<button class="btn gold mission-skill-option" data-skill="${i}"><span>${esc(o.label)}</span><small>${esc(o.skill)} · ${o.resolution==='special'?'+2':'+1'}</small></button>`).join('')}<button class="btn" data-generic>Resolver sin habilidad</button>`;
      }
      if(m.stage==='reward'){
        const alt=m.reward==='coin'?'bag':'coin';
        action=m.rewardChoice
          ?`<button class="btn gold" data-reward="${m.reward}">Tomar ${reward.name}</button><button class="btn secondary" data-reward="${alt}">Elegir ${ITEM_DEF[alt].name}</button>`
          :`<button class="btn gold" data-reward="${m.reward}">Tomar ${reward.name}</button>`;
      }

      d.innerHTML=`
        <div class="mission-ribbon"></div>
        <div class="mission-inner">
          <div class="mission-head"><div><div class="mission-kicker">${m.origin} · ${SUITS[m.suit]?.name||''}</div><div class="mission-title">${esc(m.title)}</div></div><div class="faction-seal ${f.className}">${ico(f.icon)}</div></div>
          <div class="mission-objective">${esc(m.objective)}</div>
          ${progress}
          ${m.targetClear?`<div class="mission-location">${ico('pin')} Objetivo · claro ${esc(m.targetClear)}</div>`:''}
          <div class="mission-separator"></div>
          <div class="reward-panel"><div class="reward-token">${ico(reward.icon)}</div><div class="reward-copy"><small>Recompensa potencial</small><strong>${reward.name}</strong></div></div>
          <div class="mission-actions dynamic-actions">${action}</div>
        </div>`;

      const q=s=>d.querySelector(s);
      if(q('[data-lead]'))q('[data-lead]').onclick=()=>progressLead(m);
      if(q('[data-enter]'))q('[data-enter]').onclick=()=>enterScene(m);
      if(q('[data-journey]'))q('[data-journey]').onclick=()=>moveToMission(m);
      if(q('[data-generic]'))q('[data-generic]').onclick=()=>resolveMission(m);
      d.querySelectorAll('[data-skill]').forEach(x=>x.onclick=()=>resolveMission(m,missionOptions(m)[+x.dataset.skill]));
      d.querySelectorAll('[data-reward]').forEach(x=>x.onclick=()=>claimReward(m,x.dataset.reward));
      b.appendChild(d);
    });
  }

    function renderLandmarks(){const b=$('#landmarksList');b.innerHTML='';S.landmarks.forEach(l=>{const d=document.createElement('div');d.className='landmark';d.innerHTML=`<div class="landmark-top"><div class="landmark-icon">${ico(l.icon)}</div><div><div class="landmark-name">${l.name}</div><div class="landmark-desc">${l.description}</div></div><span class="tag">${l.clear?'Claro '+l.clear:'Oculto'}</span></div><div class="landmark-actions">${!l.clear?'<button class="chip" data-reveal>Revelar</button>':''}${l.clear&&l.level<3?`<button class="chip" data-progress>${['','Visitar','Explorar','Vincular'][l.level+1]}</button>`:''}</div>`;const r=d.querySelector('[data-reveal]');if(r)r.onclick=()=>chooseClear('Ubicar · '+l.name,c=>{l.clear=String(c);S.character.discoveries.push({type:'landmark',id:l.id,day:S.day});evaluateMilestones();save();closeSheet();renderAll()});const p=d.querySelector('[data-progress]');if(p)p.onclick=()=>{l.level++;evaluateMilestones();save();renderAll()};b.appendChild(d)})}
  function renderHistory(){const b=$('#historyList');b.innerHTML=S.log.length?'':'<div class="empty">El bosque todavía no tiene historia.</div>';S.log.slice(0,80).forEach(x=>{const d=document.createElement('div');d.className='timeline-item';d.innerHTML=`<div class="timeline-icon">${ico(x.icon||'scroll')}</div><div><div class="timeline-title">${esc(x.text)}</div><div class="timeline-meta">Día ${x.day}</div></div></div>`;b.appendChild(d)})}
  function renderAll(){renderHeader();renderActions();renderToday();renderWorldBanner();renderCharacter();renderInventory();renderSkillTree();renderMilestones();renderReputation();renderBots();renderOrderHistory();renderStates();renderRumors();renderMissions();renderLandmarks();renderHistory()}
  function switchView(n){$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===n));$$('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+n));window.scrollTo({top:0,behavior:'smooth'})}
  $$('.nav-btn').forEach(b=>b.onclick=()=>switchView(b.dataset.view));

  $('#endDayBtn').onclick=()=>{if(S.phase==='world')return;S.phase='world';ensureWorld();addLog('La jornada termina.','rest');save();renderAll()};
  $('#addStateBtn').onclick=()=>chooseClear('Estado del mapa',c=>choiceSheet('Claro '+c,'Elige el estado principal.',STATES.map(s=>({icon:s.icon,label:s.name,...s})),s=>{const e=S.states.find(x=>x.clear===String(c));if(e)e.name=s.name;else S.states.push({clear:String(c),name:s.name});save();closeSheet();renderStates()}));
  $('#settingsBtn').onclick=()=>openSheet('Ajustes','Solo lo esencial.',`<div class="setting-row"><div><div class="item-title">Claro actual</div><div class="meta">${S.character.clear||'Sin fijar'}</div></div><button class="chip" id="setLoc">Cambiar</button></div><div class="setting-row"><div><div class="item-title">Alianza Automatizada</div><div class="meta">${S.bots.Alianza?'Activa':'Inactiva'}</div></div><button class="chip" id="toggleAlliance">${S.bots.Alianza?'Desactivar':'Activar'}</button></div><div class="setting-row"><div><div class="item-title">Evento importante</div><div class="meta">Úsalo solo cuando algo cambió realmente el bosque.</div></div><button class="chip" id="majorEvent">Registrar</button></div>`,()=>{$('#setLoc').onclick=()=>{closeSheet();chooseClear('Claro actual',c=>{S.character.clear=String(c);save();closeSheet();renderAll()})};$('#toggleAlliance').onclick=()=>{S.bots.Alianza=!S.bots.Alianza;save();closeSheet();renderAll()};$('#majorEvent').onclick=()=>{S.character.importantEvents.push({day:S.day,id:uid()});evaluateMilestones();save();closeSheet();renderAll()}});
  $('#exportBtn').onclick=()=>{const bl=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=`root-rpg-${S.character.name||'campana'}-dia-${S.day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
  $('#importInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{S=migrate(JSON.parse(await f.text()));save();renderAll();if(!S.onboarded)showCreator()}catch(_){toast('Archivo no válido')}e.target.value=''};
  $('#resetBtn').onclick=()=>openSheet('Nueva campaña','Se borrará el estado local actual.',`<button class="btn red" id="confirmReset" style="width:100%">Empezar de cero</button>`,()=>$('#confirmReset').onclick=()=>{S=fresh();save();closeSheet();renderAll();showCreator()});

  let draftName='',draftType=null;
  function showCreator(){draftName=S.character.name||'';draftType=S.character.vagabondType||null;$('#playerName').value=draftName;$('#onboarding').classList.add('open');showCreatorStep('name')}
  function showCreatorStep(step){$('#creatorStepName').hidden=step!=='name';$('#creatorStepType').hidden=step!=='type';$('#creatorStepConfirm').hidden=step!=='confirm';if(step==='type')renderPicker();if(step==='confirm')renderCreatorSummary()}
  function renderPicker(){const b=$('#vagabondPicker');b.innerHTML='';Object.values(VAGS).forEach(v=>{const c=document.createElement('button');c.className=`vagabond-card ${draftType===v.id?'selected':''}`;c.innerHTML=`<img src="${v.portrait}" alt=""><div class="vagabond-card-copy"><div class="vagabond-name">${v.name}</div><div class="vagabond-tag">${v.tagline}</div><div class="vagabond-ability">${v.specialAbility.name}</div><div class="starting-items">${v.startingItems.map(t=>`<span>${ico(ITEM_DEF[t].icon)}${ITEM_DEF[t].name}</span>`).join('')}</div></div>`;c.onclick=()=>{draftType=v.id;showCreatorStep('confirm')};b.appendChild(c)})}
  function renderCreatorSummary(){const v=VAGS[draftType];$('#creatorSummary').innerHTML=`<div class="creator-summary"><img src="${v.portrait}" alt=""><div><div class="eyebrow dark-eyebrow">${v.name}</div><h3>${esc(draftName)}</h3><p>${v.tagline}</p><div class="ability-card"><div class="ability-kicker">Habilidad única</div><div class="ability-title">${v.specialAbility.name}</div><div class="ability-copy">${v.specialAbility.description}</div></div></div></div>`}
  $('#creatorNextBtn').onclick=()=>{draftName=$('#playerName').value.trim();if(!draftName)return toast('Escribe el nombre del personaje');showCreatorStep('type')};
  $('#creatorBackBtn').onclick=()=>showCreatorStep('name');$('#creatorEditBtn').onclick=()=>showCreatorStep('type');
  $('#startCampaignBtn').onclick=()=>{if(!draftName||!draftType)return;const oldWorld={day:S.day,time:S.time,phase:S.phase,bots:S.bots,world:S.world,orderHistory:S.orderHistory,states:S.states,rumors:S.rumors,missions:S.missions,landmarks:S.landmarks,log:S.log,actions:S.actions};S.character=setupCharacter(draftName,draftType,S.character);S.campaign='Crónicas de '+draftName;S.onboarded=true;Object.assign(S,oldWorld);save();$('#onboarding').classList.remove('open');addLog(`${draftName} entra al bosque como ${VAGS[draftType].name}.`,'paw');renderAll();if(!S.character.clear)setTimeout(()=>chooseClear('¿Dónde comienza tu Vagabundo?',c=>{S.character.clear=String(c);save();closeSheet();renderAll()}),120)};

  ensureWorld();if(!S.onboarded||!S.character.vagabondType)showCreator();renderAll();save();
  if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
})();