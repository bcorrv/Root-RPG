(() => {
  const KEY = 'rootRpg_v03';
  const LEGACY_KEYS = ['rootRpg_v02', 'rootSandboxCompanion_v02', 'rootSandbox_v01'];

  const ACTIONS = [
    {id:'move', icon:'🥾', label:'Mover', cost:1, tone:'special'},
    {id:'observe', icon:'👁️', label:'Observar', cost:1},
    {id:'talk', icon:'💬', label:'Hablar', cost:1},
    {id:'investigate', icon:'🔎', label:'Investigar', cost:1},
    {id:'trade', icon:'🪙', label:'Comerciar', cost:1},
    {id:'infiltrate', icon:'🗝️', label:'Infiltrar', cost:1},
    {id:'combat', icon:'⚔️', label:'Combatir', cost:1, tone:'danger'},
    {id:'explore', icon:'🔥', label:'Explorar', cost:1},
    {id:'help', icon:'🤝', label:'Apoyar facción', cost:1},
    {id:'craft', icon:'🔨', label:'Fabricar / reparar', cost:1},
    {id:'rest', icon:'🍵', label:'Descansar', cost:2},
    {id:'free', icon:'✨', label:'Acción libre', cost:1}
  ];

  const ITEM_INFO = {
    '⚔️ Espada':'Ataque +1 · habilita técnicas de combate',
    '👢 Bota':'Huida · mejora movilidad',
    '🔥 Antorcha':'Permite entrar a ruinas',
    '🔨 Martillo':'Permite fabricar y reparar',
    '🏹 Ballesta':'Ataques a distancia',
    '🍵 Té':'Recuperación rápida',
    '🪙 Moneda':'Comercio, sobornos y favores',
    '🎒 Bolsa':'Capacidad adicional'
  };

  const STATE_TYPES = [
    ['⚠️','Alerta'],['⛔','Bloqueo'],['⚔️','Tensión'],['🥖','Escasez'],
    ['🛡️','Fortificado'],['🌿','Revuelta'],['🔥','Caos']
  ];

  const BOT_CONFIG = {
    Marquesado:{
      icon:'🐱', className:'cat',
      outcomes:['⚔️ Batalló','👥 Reclutó','🏗️ Construyó','🥾 Movió','🏳️ Ganó territorio','💥 Perdió territorio']
    },
    Eyrie:{
      icon:'🦅', className:'bird',
      outcomes:['⚔️ Batalló','👥 Reclutó','🏗️ Construyó','🥾 Movió','🏳️ Ganó territorio','💥 Perdió territorio']
    },
    Alianza:{
      icon:'🌿', className:'alliance',
      outcomes:['🌱 Extendió simpatía','🔥 Revuelta','👥 Reclutó','🥾 Movilizó','🏳️ Ganó territorio','💥 Perdió territorio']
    }
  };

  const LANDMARKS = [
    {
      name:'🔨 Forja Legendaria',
      description:'Centro de artesanía. Convierte equipo ordinario en herramientas con historia.',
      services:['Reparar','Fabricar','Mejorar']
    },
    {
      name:'🕯️ Mercado Negro',
      description:'Información, mercancía dudosa, favores y contactos que las facciones prefieren no ver.',
      services:['Comerciar','Comprar información','Conseguir contacto']
    },
    {
      name:'🏚️ Ciudad Perdida',
      description:'Exploración profunda, reliquias y rutas olvidadas. La Antorcha importa aquí.',
      services:['Explorar','Buscar reliquia','Abrir pasaje']
    },
    {
      name:'🌳 Árbol Ancestral',
      description:'Refugio neutral, recuperación y punto de encuentro entre habitantes del bosque.',
      services:['Descansar','Escuchar rumores','Mediar']
    }
  ];

  function freshState(){
    return {
      version:'0.3',
      onboarded:false,
      playerName:'',
      campaign:'Crónicas del Bosque',
      day:1,
      time:0,
      phase:'player',
      actions:[],
      character:{
        archetype:'Pícaro',
        level:1,
        xp:0,
        hp:3,
        maxHp:3,
        clear:'',
        skills:{Sigilo:1,Engaño:1,Combate:0,Supervivencia:0},
        opportunistReady:true
      },
      inventory:{
        '⚔️ Espada':1,
        '👢 Bota':1,
        '🔥 Antorcha':0,
        '🔨 Martillo':0,
        '🏹 Ballesta':0,
        '🍵 Té':0,
        '🪙 Moneda':3,
        '🎒 Bolsa':0
      },
      reputations:{Marquesado:0,Eyrie:0,Alianza:0},
      bots:{Marquesado:true,Eyrie:true,Alianza:false},
      world:{
        day:1,
        resolved:{Marquesado:false,Eyrie:false,Alianza:false},
        records:{}
      },
      states:[],
      rumors:[],
      landmarks:LANDMARKS.map(x=>({...x,level:0,clear:''})),
      log:[]
    };
  }

  function migrateLegacy(){
    for(const key of LEGACY_KEYS){
      try{
        const old = JSON.parse(localStorage.getItem(key));
        if(!old) continue;
        const n = freshState();
        n.day = old.day || 1;
        n.time = old.time || 0;
        n.phase = old.phase || 'player';
        n.actions = Array.isArray(old.actions) ? old.actions : [];
        const c = old.character || old.char || {};
        n.character.level = c.level || 1;
        n.character.xp = c.xp || 0;
        n.character.hp = Number.isFinite(c.hp) ? c.hp : 3;
        n.character.maxHp = c.maxHp || 3;
        n.character.clear = c.clear || '';
        n.character.skills = c.skills || n.character.skills;
        n.inventory = old.inventory || old.inv || n.inventory;
        n.reputations = old.reputations || old.rep || n.reputations;
        n.states = Array.isArray(old.states) ? old.states.map(s=>({clear:String(s.clear||''),name:s.name||'Estado'})) : [];
        n.rumors = Array.isArray(old.rumors) ? old.rumors : [];
        if(Array.isArray(old.landmarks)){
          n.landmarks = LANDMARKS.map(base=>{
            const found = old.landmarks.find(x=>String(x.name||'').includes(base.name.split(' ').slice(1).join(' '))) || old.landmarks.find(x=>x.name===base.name);
            return found ? {...base,level:found.level||0,clear:found.clear||''} : {...base,level:0,clear:''};
          });
        }
        n.log = Array.isArray(old.log) ? old.log.map(x=>({day:x.day||1,text:x.text||String(x)})) : [];
        n.onboarded = false;
        return n;
      }catch(_){}
    }
    return freshState();
  }

  let S;
  try{
    S = JSON.parse(localStorage.getItem(KEY)) || migrateLegacy();
  }catch(_){
    S = migrateLegacy();
  }

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const esc = v => String(v ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  const sheet = {
    bg:$('#sheetBackdrop'),
    title:$('#sheetTitle'),
    sub:$('#sheetSub'),
    content:$('#sheetContent')
  };

  function save(){
    localStorage.setItem(KEY, JSON.stringify(S));
    const chip = $('#saveChip');
    if(chip){
      chip.textContent = '✓ Guardado';
      clearTimeout(save.timer);
      save.timer = setTimeout(()=>chip.textContent='● Autoguardado',800);
    }
  }

  function toast(text){
    const el = $('#toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(()=>el.classList.remove('show'),1450);
  }

  function addLog(text, icon='•'){
    S.log.unshift({day:S.day,text,icon});
    save();
    renderHistory();
  }

  function repLabel(v){
    if(v<=-3) return 'Enemigo';
    if(v===-2) return 'Hostil';
    if(v===-1) return 'Sospechoso';
    if(v===0) return 'Neutral';
    if(v===1) return 'Conocido';
    if(v===2) return 'Confiable';
    return 'Aliado';
  }

  function activeBots(){
    return Object.keys(S.bots).filter(k=>S.bots[k]);
  }

  function resetWorldProgress(){
    S.world = {
      day:S.day,
      resolved:{Marquesado:false,Eyrie:false,Alianza:false},
      records:{}
    };
  }

  function ensureWorldProgress(){
    if(!S.world || S.world.day !== S.day) resetWorldProgress();
  }

  function openSheet(title, subtitle, html, bind){
    sheet.title.textContent = title;
    sheet.sub.textContent = subtitle || '';
    sheet.content.innerHTML = html + '<button class="btn secondary" data-sheet-close style="width:100%;margin-top:14px">Cerrar</button>';
    sheet.bg.classList.add('open');
    if(typeof bind === 'function') bind(sheet.content);
    const closeBtn = sheet.content.querySelector('[data-sheet-close]');
    if(closeBtn) closeBtn.addEventListener('click', closeSheet);
  }

  function closeSheet(){
    sheet.bg.classList.remove('open');
  }

  sheet.bg.addEventListener('click',e=>{
    if(e.target===sheet.bg) closeSheet();
  });

  function chooseClear(title, onPick){
    const buttons = Array.from({length:12},(_,i)=>i+1)
      .map(n=>'<button class="clear-btn'+(String(n)===String(S.character.clear)?' selected':'')+'" data-clear="'+n+'">'+n+'</button>').join('');
    openSheet(title,'Toca el número del claro en tu tablero.',`
      <div class="sheet-section">
        <div class="sheet-label">Claros 1–12</div>
        <div class="clear-grid">${buttons}</div>
      </div>
    `, root=>{
      root.querySelectorAll('[data-clear]').forEach(btn=>{
        btn.addEventListener('click',()=>{
          onPick(btn.dataset.clear);
        });
      });
    });
  }

  function recordAction({label,icon='•',cost=1,clear='',meta='',effect=null}){
    if(S.phase==='world'){
      toast('Primero resuelve la Fase del Mundo');
      return false;
    }
    if(S.time + cost > 4){
      toast('No queda suficiente tiempo');
      return false;
    }
    S.time += cost;
    if(clear) S.character.clear = String(clear);
    if(typeof effect==='function') effect();

    S.actions.push({
      day:S.day,
      label,
      icon,
      cost,
      clear:S.character.clear || '',
      meta
    });
    addLog(`${label}${meta?' · '+meta:''}${cost?' ['+cost+' tiempo]':''}`,icon);

    if(S.time>=4){
      S.phase='world';
      ensureWorldProgress();
    }
    save();
    renderAll();
    return true;
  }

  function resultBand(total){
    if(total<=1) return {label:'Fallo + consecuencia',icon:'💥'};
    if(total<=3) return {label:'Éxito parcial / coste',icon:'⚠️'};
    if(total<=5) return {label:'Éxito',icon:'✅'};
    return {label:'Éxito excepcional',icon:'🌟'};
  }

  function openDiceResolver({title,actionLabel,icon,cost=1,meta='',after=null}){
    const draft={a:null,b:null,mod:0};
    function content(){
      const result = draft.a===null || draft.b===null ? null : resultBand(draft.a+draft.b+draft.mod);
      const total = result ? draft.a+draft.b+draft.mod : null;
      sheet.content.innerHTML = `
        <div class="sheet-section">
          <div class="sheet-label">Dado 1</div>
          <div class="dice-row">${[0,1,2,3].map(n=>`<button class="dice-btn ${draft.a===n?'selected':''}" data-a="${n}">${n}</button>`).join('')}</div>
        </div>
        <div class="sheet-section">
          <div class="sheet-label">Dado 2</div>
          <div class="dice-row">${[0,1,2,3].map(n=>`<button class="dice-btn ${draft.b===n?'selected':''}" data-b="${n}">${n}</button>`).join('')}</div>
        </div>
        <div class="sheet-section">
          <div class="sheet-label">Modificador</div>
          <div class="mod-row">${[-2,-1,0,1,2].map(n=>`<button class="mod-btn ${draft.mod===n?'selected':''}" data-mod="${n}">${n>0?'+':''}${n}</button>`).join('')}</div>
        </div>
        ${result?`<div class="result-card"><div class="result-score">${result.icon} ${total}</div><div class="result-text">${result.label}</div></div>`:''}
        <button class="btn" id="saveRollBtn" style="width:100%;margin-top:12px" ${result?'':'disabled'}>Registrar resultado</button>
        <button class="btn secondary" data-sheet-close style="width:100%;margin-top:8px">Cerrar</button>
      `;
      sheet.content.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{draft.a=Number(b.dataset.a);content()});
      sheet.content.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{draft.b=Number(b.dataset.b);content()});
      sheet.content.querySelectorAll('[data-mod]').forEach(b=>b.onclick=()=>{draft.mod=Number(b.dataset.mod);content()});
      const close=sheet.content.querySelector('[data-sheet-close]'); if(close) close.onclick=closeSheet;
      const saveBtn=$('#saveRollBtn');
      if(saveBtn) saveBtn.onclick=()=>{
        const total=draft.a+draft.b+draft.mod;
        const band=resultBand(total);
        const finalMeta=`${meta}${meta?' · ':''}${draft.a}+${draft.b}${draft.mod?((draft.mod>0?'+':'')+draft.mod):''} = ${total} · ${band.label}`;
        const ok=recordAction({label:actionLabel,icon,cost,meta:finalMeta,effect:()=>{if(after)after({total,band})}});
        if(ok) closeSheet();
      };
    }
    openSheet(title,'Usa tus dados físicos de Root y toca aquí el resultado.','');
    content();
  }

  function openSimpleChoices(title,subtitle,choices,onPick){
    openSheet(title,subtitle,`
      <div class="sheet-section">
        <div class="outcome-grid">
          ${choices.map((x,i)=>`<button class="outcome-btn" data-choice="${i}">${x.icon||''} ${esc(x.label)}</button>`).join('')}
        </div>
      </div>
    `,root=>{
      root.querySelectorAll('[data-choice]').forEach(btn=>{
        btn.onclick=()=>onPick(choices[Number(btn.dataset.choice)]);
      });
    });
  }

  function openAction(actionId){
    const A=ACTIONS.find(x=>x.id===actionId);
    if(!A) return;

    if(actionId==='move'){
      chooseClear('Mover', clear=>{
        if(String(clear)===String(S.character.clear)){toast('Ya estás en ese claro');return}
        if(recordAction({label:`Mover → claro ${clear}`,icon:'🥾',cost:1,clear,meta:'Movimiento'})) closeSheet();
      });
      return;
    }

    if(actionId==='observe'){
      openSimpleChoices('Observar','¿En qué enfocas la atención?',[
        {icon:'🌲',label:'Entorno'},
        {icon:'🐾',label:'Movimiento de facción'},
        {icon:'🛤️',label:'Ruta / salida'},
        {icon:'🃏',label:'Rumor activo'},
        {icon:'🏛️',label:'Lugar especial'}
      ],choice=>{
        if(recordAction({label:'Observar',icon:'👁️',cost:1,meta:choice.label})) closeSheet();
      });
      return;
    }

    if(actionId==='talk'){
      openSimpleChoices('Hablar','Elige con quién buscas interactuar.',[
        {icon:'🐭',label:'Habitante local'},
        {icon:'🧺',label:'Comerciante'},
        {icon:'🛡️',label:'Soldado / patrulla'},
        {icon:'🤝',label:'Contacto'},
        {icon:'❓',label:'Desconocido'}
      ],choice=>{
        if(recordAction({label:'Hablar',icon:'💬',cost:1,meta:choice.label})) closeSheet();
      });
      return;
    }

    if(actionId==='investigate'){
      openSimpleChoices('Investigar','¿Qué quieres seguir?',[
        {icon:'🃏',label:'Rumor'},
        {icon:'🐾',label:'Facción'},
        {icon:'⚠️',label:'Estado del claro'},
        {icon:'🏚️',label:'Ruina'},
        {icon:'🧩',label:'Rastro / pista'}
      ],choice=>{
        openSimpleChoices('¿Hay riesgo real?','Solo tira si existe incertidumbre + riesgo + consecuencia.',[
          {icon:'✓',label:'No · ocurre'},
          {icon:'🎲',label:'Sí · tirar dados'}
        ],risk=>{
          if(risk.label.startsWith('No')){
            if(recordAction({label:'Investigar',icon:'🔎',cost:1,meta:choice.label})) closeSheet();
          }else{
            openDiceResolver({title:'Resolver investigación',actionLabel:'Investigar',icon:'🔎',cost:1,meta:choice.label});
          }
        });
      });
      return;
    }

    if(actionId==='trade'){
      openSimpleChoices('Comerciar','Selecciona el tipo de intercambio.',[
        {icon:'🛒',label:'Comprar'},
        {icon:'💰',label:'Vender'},
        {icon:'🤫',label:'Sobornar'},
        {icon:'👥',label:'Contratar ayuda'}
      ],choice=>{
        if(recordAction({label:'Comerciar',icon:'🪙',cost:1,meta:choice.label})) closeSheet();
      });
      return;
    }

    if(actionId==='infiltrate'){
      openSimpleChoices('Infiltrar','Elige el enfoque.',[
        {icon:'🥷',label:'Escabullirse'},
        {icon:'🪙',label:'Robar'},
        {icon:'🔨',label:'Sabotear'},
        {icon:'🧾',label:'Plantar evidencia'}
      ],choice=>{
        openDiceResolver({title:choice.label,actionLabel:'Infiltrar',icon:'🗝️',cost:1,meta:choice.label});
      });
      return;
    }

    if(actionId==='combat'){
      openSimpleChoices('Combatir','¿Contra quién?',[
        {icon:'🐱',label:'Marquesado'},
        {icon:'🦅',label:'Eyrie'},
        {icon:'🌿',label:'Alianza'},
        {icon:'⚔️',label:'Otro enemigo'}
      ],faction=>{
        openSimpleChoices('Cantidad de enemigos','Toca cuántas piezas/enemigos enfrentas.',[
          {label:'1'},{label:'2'},{label:'3'},{label:'4'},{label:'5+'}
        ],count=>{
          openDiceResolver({
            title:`Combate vs ${faction.label}`,
            actionLabel:'Combatir',
            icon:'⚔️',
            cost:1,
            meta:`${faction.label} · ${count.label} enemigo(s)`
          });
        });
      });
      return;
    }

    if(actionId==='explore'){
      const discovered=S.landmarks.filter(l=>l.clear);
      const choices=[
        {icon:'🏚️',label:'Ruina',kind:'ruin'},
        ...discovered.map(l=>({icon:l.name.split(' ')[0],label:l.name.split(' ').slice(1).join(' '),kind:'landmark',landmark:l.name}))
      ];
      openSimpleChoices('Explorar','¿Dónde concentras la exploración?',choices,choice=>{
        if(choice.kind==='ruin' && (S.inventory['🔥 Antorcha']||0)<1){
          openSheet('Ruina cerrada','Necesitas una 🔥 Antorcha para internarte con seguridad.',`
            <div class="result-card"><div class="result-score">🔥 0</div><div class="result-text">Consigue una Antorcha antes de entrar.</div></div>
          `);
          return;
        }
        openDiceResolver({title:`Explorar · ${choice.label}`,actionLabel:'Explorar',icon:'🔥',cost:1,meta:choice.label});
      });
      return;
    }

    if(actionId==='help'){
      openSimpleChoices('Apoyar facción','Elige a quién ayudas.',[
        {icon:'🐱',label:'Marquesado'},
        {icon:'🦅',label:'Eyrie'},
        {icon:'🌿',label:'Alianza'}
      ],faction=>{
        openSimpleChoices('Tipo de apoyo',faction.label,[
          {icon:'⚔️',label:'Apoyo en conflicto'},
          {icon:'📦',label:'Suministros'},
          {icon:'👁️',label:'Inteligencia'},
          {icon:'🛟',label:'Rescate / protección'}
        ],support=>{
          openSimpleChoices('Impacto político','¿La ayuda fue suficientemente importante para cambiar la relación?',[
            {icon:'•',label:'Sin cambio de reputación',rep:0},
            {icon:'⬆️',label:'+1 reputación',rep:1}
          ],impact=>{
            if(recordAction({
              label:`Apoyar · ${faction.label}`,
              icon:'🤝',
              cost:1,
              meta:support.label,
              effect:()=>{
                if(impact.rep){
                  S.reputations[faction.label]=clamp((S.reputations[faction.label]||0)+1,-3,3);
                }
              }
            })) closeSheet();
          });
        });
      });
      return;
    }

    if(actionId==='craft'){
      if((S.inventory['🔨 Martillo']||0)<1){
        openSheet('Necesitas un Martillo','🔨 El Martillo habilita fabricación y reparación.',`
          <div class="result-card"><div class="result-score">🔨 0</div><div class="result-text">Consigue un Martillo antes de usar esta acción.</div></div>
        `);
        return;
      }
      openSimpleChoices('Fabricar / reparar','¿Qué haces con tu Martillo?',[
        {icon:'🩹',label:'Reparar objeto'},
        {icon:'🧰',label:'Fabricar recurso'},
        {icon:'⬆️',label:'Mejorar equipo'}
      ],choice=>{
        if(recordAction({label:'Martillo',icon:'🔨',cost:1,meta:choice.label})) closeSheet();
      });
      return;
    }

    if(actionId==='rest'){
      const choices=[{icon:'🏕️',label:'Descanso completo',cost:2,tea:false}];
      if((S.inventory['🍵 Té']||0)>0) choices.push({icon:'🍵',label:'Tomar té',cost:0,tea:true});
      openSimpleChoices('Descansar','Recupera 1 ❤️ hasta tu máximo.',choices,choice=>{
        if(recordAction({
          label:'Descansar',
          icon:'🍵',
          cost:choice.cost,
          meta:choice.label,
          effect:()=>{
            S.character.hp=clamp(S.character.hp+1,0,S.character.maxHp);
            if(choice.tea) S.inventory['🍵 Té']-=1;
          }
        })) closeSheet();
      });
      return;
    }

    if(actionId==='free'){
      openSimpleChoices('Acción libre','La narrativa puede ser cualquier cosa; aquí solo eliges la categoría para registrarla.',[
        {icon:'🥷',label:'Sigilo'},
        {icon:'🎭',label:'Engaño'},
        {icon:'🧠',label:'Plan / preparación'},
        {icon:'🧱',label:'Manipular entorno'},
        {icon:'🐾',label:'Interactuar con facción'},
        {icon:'🎒',label:'Usar objeto'},
        {icon:'✨',label:'Otra'}
      ],choice=>{
        openSimpleChoices('Coste de tiempo','Elige cuánto tiempo consumió.',[
          {label:'0 tiempo',cost:0},{label:'1 tiempo',cost:1},{label:'2 tiempo',cost:2}
        ],time=>{
          if(recordAction({label:'Acción libre',icon:'✨',cost:time.cost,meta:choice.label})) closeSheet();
        });
      });
      return;
    }
  }

  function renderHeader(){
    $('#heroName').textContent = S.campaign;
    $('#heroSubtitle').textContent = `Día ${S.day} · ${S.playerName || 'Pícaro'} · ${S.character.archetype}`;
    $('#heroHp').textContent = `${S.character.hp}/${S.character.maxHp}`;
    $('#heroXp').textContent = `${S.character.xp}/5`;
    $('#heroClear').textContent = S.character.clear || '—';
    $('#heroLevel').textContent = S.character.level;
    $('#timeText').textContent = `${S.time} / 4`;
    $$('#timePips .time-pip').forEach((p,i)=>p.classList.toggle('on',i<S.time));

    $('#characterName').textContent = S.playerName || 'Pícaro';
    $('#characterLevel').textContent = S.character.level;
    $('#charHp').textContent = `${S.character.hp}/${S.character.maxHp}`;
    $('#charXp').textContent = `${S.character.xp}/5`;
    $('#charClear').textContent = S.character.clear || '—';
    $('#levelUpBtn').disabled = S.character.xp < 5;
  }

  function renderActions(){
    const grid=$('#actionGrid');
    grid.innerHTML='';
    ACTIONS.forEach(a=>{
      const locked =
        (a.id==='explore' && (S.inventory['🔥 Antorcha']||0)<1 && !S.landmarks.some(l=>l.clear)) ||
        (a.id==='craft' && (S.inventory['🔨 Martillo']||0)<1);
      const btn=document.createElement('button');
      btn.className=`action-btn ${a.tone||''} ${locked?'locked':''}`;
      btn.innerHTML=`
        <div class="action-icon">${a.icon}</div>
        <div>
          <div class="action-label">${a.label}</div>
          <div class="action-cost">${a.cost===0?'sin tiempo':a.cost+' tiempo'}</div>
        </div>
      `;
      btn.addEventListener('click',()=>openAction(a.id));
      grid.appendChild(btn);
    });
  }

  function renderToday(){
    const box=$('#todayTimeline');
    const today=S.actions.filter(x=>x.day===S.day);
    $('#todayCount').textContent=`${today.length} ${today.length===1?'acción':'acciones'}`;
    box.innerHTML='';
    if(!today.length){
      box.innerHTML='<div class="empty">Tu día está abierto. Elige cualquier acción arriba.</div>';
      return;
    }
    today.forEach(a=>{
      const row=document.createElement('div');
      row.className='timeline-item';
      row.innerHTML=`
        <div class="timeline-icon">${a.icon||'•'}</div>
        <div><div class="timeline-title">${esc(a.label||a.text||'Acción')}</div><div class="timeline-meta">${esc(a.meta||a.note||'')}${a.clear?' · Claro '+esc(a.clear):''}</div></div>
        <span class="tag">${a.cost||0}t</span>
      `;
      box.appendChild(row);
    });
  }

  function renderWorldBanner(){
    const host=$('#worldBanner');
    if(S.phase!=='world'){
      host.innerHTML='';
      return;
    }
    ensureWorldProgress();
    const bots=activeBots();
    const done=bots.filter(b=>S.world.resolved[b]).length;
    host.innerHTML=`
      <div class="world-banner">
        <div><h3>🌍 Fase del Mundo</h3><p>${done}/${bots.length} autómatas resueltos. El bosque se mueve sin ti.</p></div>
        <button class="btn secondary" id="goWorldBtn">${done===bots.length?'Cerrar fase':'Resolver'}</button>
      </div>
    `;
    $('#goWorldBtn').onclick=()=>{
      switchView('mundo');
      if(done===bots.length) openFinishWorld();
    };
  }

  function renderSkills(){
    const box=$('#skillsCard');
    box.innerHTML=`
      <div class="skill-row">
        <div><div class="item-title">🎯 Oportunista</div><div class="item-meta">1 vez por día: +1 cuando explotas una ventaja preparada.</div></div>
        <button class="chip ${S.character.opportunistReady?'active':''}" id="opportunistBtn">${S.character.opportunistReady?'Disponible':'Usado'}</button>
      </div>
    `;
    Object.entries(S.character.skills).forEach(([name,val])=>{
      const row=document.createElement('div');
      row.className='skill-row';
      row.innerHTML=`
        <div><div class="item-title">${esc(name)}</div><div class="item-meta">Bonificador en situaciones pertinentes</div></div>
        <div class="stepper"><strong>+${val}</strong></div>
      `;
      box.appendChild(row);
    });
    const op=$('#opportunistBtn');
    if(op) op.onclick=()=>{
      if(!S.character.opportunistReady){toast('Se recupera al iniciar el siguiente día');return}
      S.character.opportunistReady=false;
      addLog('Oportunista usado: +1 disponible en la resolución actual','🎯');
      save();renderSkills();
    };
  }

  function renderInventory(){
    const box=$('#inventoryGrid'); box.innerHTML='';
    Object.entries(S.inventory).forEach(([key,count])=>{
      const [icon,...parts]=key.split(' ');
      const name=parts.join(' ');
      const card=document.createElement('div');
      card.className='inv';
      card.innerHTML=`
        <div class="inv-icon">${icon}</div>
        <div class="inv-name">${esc(name)}</div>
        <div class="inv-count">×${count}</div>
        <div class="item-meta">${esc(ITEM_INFO[key]||'')}</div>
      `;
      const step=document.createElement('div'); step.className='stepper';
      const minus=document.createElement('button'); minus.textContent='−';
      const plus=document.createElement('button'); plus.textContent='+';
      minus.onclick=()=>{S.inventory[key]=Math.max(0,S.inventory[key]-1);save();renderInventory();renderActions()};
      plus.onclick=()=>{S.inventory[key]=Math.min(99,S.inventory[key]+1);save();renderInventory();renderActions()};
      step.append(minus,plus); card.appendChild(step); box.appendChild(card);
    });
  }

  function renderReputation(){
    const box=$('#reputationList');box.innerHTML='';
    Object.entries(S.reputations).forEach(([name,val])=>{
      const cfg=BOT_CONFIG[name];
      const card=document.createElement('div');card.className='rep-card';
      const left=val<0 ? 50+(val/3)*50 : 50;
      const width=Math.abs(val)/3*50;
      const color=val<0?'var(--red)':'var(--moss)';
      card.innerHTML=`
        <div class="rep-top">
          <div><div class="rep-name">${cfg?.icon||''} ${name}</div><div class="rep-state">${repLabel(val)}</div></div>
          <strong>${val>0?'+':''}${val}</strong>
        </div>
        <div class="rep-track"><div class="rep-fill" style="left:${left}%;width:${width}%;background:${color}"></div></div>
      `;
      const actions=document.createElement('div');actions.className='rep-actions';
      const down=document.createElement('button');down.className='chip';down.textContent='−1';
      const up=document.createElement('button');up.className='chip';up.textContent='+1';
      down.onclick=()=>{const old=S.reputations[name];S.reputations[name]=clamp(old-1,-3,3);addLog(`${cfg?.icon||''} ${name}: ${old} → ${S.reputations[name]}`,'🤝');save();renderReputation()};
      up.onclick=()=>{const old=S.reputations[name];S.reputations[name]=clamp(old+1,-3,3);addLog(`${cfg?.icon||''} ${name}: ${old} → ${S.reputations[name]}`,'🤝');save();renderReputation()};
      actions.append(down,up);card.appendChild(actions);box.appendChild(card);
    });
  }

  function openBotResolution(name){
    ensureWorldProgress();
    const cfg=BOT_CONFIG[name];
    const existing=S.world.records[name]||{suit:null,outcomes:[]};
    const draft={suit:existing.suit,outcomes:[...(existing.outcomes||[])]};

    function draw(){
      sheet.content.innerHTML=`
        <div class="sheet-section">
          <div class="sheet-label">Carta de Orden · palo</div>
          <div class="suit-row">
            ${['🐭','🐰','🦊','🐦'].map(s=>`<button class="suit-btn ${draft.suit===s?'selected':''}" data-suit="${s}">${s}</button>`).join('')}
          </div>
        </div>
        <div class="sheet-section">
          <div class="sheet-label">Qué cambió en mesa</div>
          <div class="outcome-grid">
            ${cfg.outcomes.map((o,i)=>`<button class="outcome-btn ${draft.outcomes.includes(o)?'selected':''}" data-outcome="${i}">${o}</button>`).join('')}
          </div>
        </div>
        <button class="btn" id="saveBotTurn" style="width:100%;margin-top:14px" ${draft.suit?'':'disabled'}>Guardar turno de ${cfg.icon} ${name}</button>
        <button class="btn secondary" data-sheet-close style="width:100%;margin-top:8px">Cerrar</button>
      `;
      sheet.content.querySelectorAll('[data-suit]').forEach(b=>b.onclick=()=>{draft.suit=b.dataset.suit;draw()});
      sheet.content.querySelectorAll('[data-outcome]').forEach(b=>b.onclick=()=>{
        const o=cfg.outcomes[Number(b.dataset.outcome)];
        draft.outcomes=draft.outcomes.includes(o)?draft.outcomes.filter(x=>x!==o):[...draft.outcomes,o];
        draw();
      });
      sheet.content.querySelector('[data-sheet-close]').onclick=closeSheet;
      const saveBtn=$('#saveBotTurn');
      if(saveBtn) saveBtn.onclick=()=>{
        S.world.records[name]={suit:draft.suit,outcomes:draft.outcomes};
        S.world.resolved[name]=true;
        addLog(`${cfg.icon} ${name} · Orden ${draft.suit}${draft.outcomes.length?' · '+draft.outcomes.join(', '):''}`,cfg.icon);
        save();closeSheet();renderAll();
        const allDone=activeBots().every(b=>S.world.resolved[b]);
        if(allDone) setTimeout(openFinishWorld,180);
      };
    }

    openSheet(`${cfg.icon} ${name}`,'Marca lo que realmente ocurrió en el tablero.','');
    draw();
  }

  function renderBots(){
    ensureWorldProgress();
    const box=$('#botList');box.innerHTML='';
    activeBots().forEach(name=>{
      const cfg=BOT_CONFIG[name];
      const resolved=!!S.world.resolved[name];
      const record=S.world.records[name];
      const card=document.createElement('div');card.className='bot-card';
      card.innerHTML=`
        <div class="bot-head">
          <div><div class="bot-name">${cfg.icon} ${name}</div><div class="bot-status">${S.phase==='world'?(resolved?'Resuelto hoy':'Pendiente'):'Esperando Fase del Mundo'}</div></div>
          <span class="tag">${record?.suit||'—'}</span>
        </div>
        ${record?.outcomes?.length?`<div class="item-meta" style="margin-top:8px">${record.outcomes.map(esc).join(' · ')}</div>`:''}
        <div class="bot-actions"><button class="btn ${resolved?'secondary':''}" data-bot="${name}" ${S.phase!=='world'?'disabled':''}>${resolved?'Editar turno':'Resolver turno'}</button></div>
      `;
      card.querySelector('[data-bot]').onclick=()=>openBotResolution(name);
      box.appendChild(card);
    });

    if(S.phase==='world'){
      const allDone=activeBots().every(b=>S.world.resolved[b]);
      const card=document.createElement('div');card.className='bot-card';
      card.innerHTML=`
        <div class="bot-head"><div><div class="bot-name">🌙 Cierre del mundo</div><div class="bot-status">${allDone?'Todo listo para avanzar':'Resuelve los autómatas activos primero'}</div></div></div>
        <div class="bot-actions"><button class="btn gold" id="finishWorldViewBtn" ${allDone?'':'disabled'}>Cerrar Fase del Mundo</button></div>
      `;
      box.appendChild(card);
      const b=$('#finishWorldViewBtn'); if(b) b.onclick=openFinishWorld;
    }
  }

  function generateRumorCandidates(botName){
    const rec=S.world.records[botName];
    if(!rec) return [];
    const cfg=BOT_CONFIG[botName];
    const suitName={'🐭':'ratón','🐰':'conejo','🦊':'zorro','🐦':'de todo el bosque'}[rec.suit]||'del bosque';
    const outcome=rec.outcomes[0]||'movimiento inusual';
    const templates={
      '⚔️ Batalló':[
        `Se habla de nuevos choques de ${cfg.icon} ${botName} en territorio ${suitName}.`,
        `Viajeros aseguran que ${cfg.icon} ${botName} está buscando pelea en los claros ${suitName}.`,
        `Los habitantes ${suitName} comentan que el conflicto de ${cfg.icon} ${botName} está escalando.`
      ],
      '👥 Reclutó':[
        `${cfg.icon} ${botName} está reuniendo nuevos reclutas entre los claros ${suitName}.`,
        `Corren rumores de una movilización de ${cfg.icon} ${botName} en territorio ${suitName}.`,
        `Más guerreros de ${cfg.icon} ${botName} aparecen de lo normal en los claros ${suitName}.`
      ],
      '🏗️ Construyó':[
        `Carretas y materiales de ${cfg.icon} ${botName} están llegando a territorio ${suitName}.`,
        `Se comenta que ${cfg.icon} ${botName} prepara una nueva posición en los claros ${suitName}.`,
        `Obreros bajo protección de ${cfg.icon} ${botName} trabajan día y noche en territorio ${suitName}.`
      ],
      '🥾 Movió':[
        `Patrullas de ${cfg.icon} ${botName} están cruzando los claros ${suitName} con una urgencia poco habitual.`,
        `Los caminos ${suitName} registran un movimiento extraño de fuerzas de ${cfg.icon} ${botName}.`,
        `Mercaderes dicen haber visto tropas de ${cfg.icon} ${botName} desplazándose hacia territorio ${suitName}.`
      ],
      '🏳️ Ganó territorio':[
        `${cfg.icon} ${botName} está consolidando su presencia en los claros ${suitName}.`,
        `Algunos habitantes ${suitName} creen que el control de ${cfg.icon} ${botName} será difícil de revertir.`,
        `Las rutas ${suitName} comienzan a responder a la autoridad de ${cfg.icon} ${botName}.`
      ],
      '💥 Perdió territorio':[
        `La autoridad de ${cfg.icon} ${botName} parece debilitarse en territorio ${suitName}.`,
        `En los claros ${suitName} se comenta que ${cfg.icon} ${botName} sufrió un revés importante.`,
        `Viejos enemigos de ${cfg.icon} ${botName} vuelven a mostrarse en territorio ${suitName}.`
      ],
      '🌱 Extendió simpatía':[
        `Símbolos de la 🌿 Alianza aparecen cada vez más en los claros ${suitName}.`,
        `Los habitantes ${suitName} intercambian mensajes clandestinos ligados a la 🌿 Alianza.`,
        `Algo está cambiando entre los habitantes ${suitName}: la 🌿 Alianza gana simpatizantes.`
      ],
      '🔥 Revuelta':[
        `Una revuelta ligada a la 🌿 Alianza sacude territorio ${suitName}.`,
        `Los ocupantes de los claros ${suitName} temen nuevas revueltas de la 🌿 Alianza.`,
        `Refugiados ${suitName} hablan de una explosión de violencia asociada a la 🌿 Alianza.`
      ],
      '👥 Reclutó|Alianza':[],
      '🥾 Movilizó':[
        `Agentes de la 🌿 Alianza están moviéndose entre los claros ${suitName}.`,
        `Mensajeros ${suitName} aseguran que la 🌿 Alianza prepara algo lejos de la vista.`,
        `La red clandestina de la 🌿 Alianza parece más activa en territorio ${suitName}.`
      ]
    };
    let list=templates[outcome] || [
      `Se comenta que ${cfg.icon} ${botName} prepara algo en territorio ${suitName}.`,
      `Los habitantes ${suitName} observan movimientos inusuales de ${cfg.icon} ${botName}.`,
      `Una nueva historia sobre ${cfg.icon} ${botName} circula por los claros ${suitName}.`
    ];
    if(botName==='Alianza' && outcome==='👥 Reclutó'){
      list=[
        `La 🌿 Alianza está reuniendo nuevos partidarios entre los habitantes ${suitName}.`,
        `Se dice que células de la 🌿 Alianza reclutan en secreto en territorio ${suitName}.`,
        `Más voces ${suitName} parecen dispuestas a unirse a la 🌿 Alianza.`
      ];
    }
    return list.map(text=>({text,suit:rec.suit,origin:botName}));
  }

  function finishWorld(rumor=null){
    if(rumor && S.rumors.length<3){
      S.rumors.push({day:S.day,suit:rumor.suit,origin:rumor.origin,text:rumor.text});
      addLog(`Nuevo rumor ${rumor.suit}: ${rumor.text}`,'🃏');
    }
    addLog('Fase del Mundo cerrada. El bosque avanza.','🌍');
    S.day+=1;
    S.time=0;
    S.phase='player';
    S.character.opportunistReady=true;
    resetWorldProgress();
    save();
    closeSheet();
    renderAll();
    switchView('turno');
    toast(`Día ${S.day}`);
  }

  function openFinishWorld(){
    const bots=activeBots();
    if(!bots.every(b=>S.world.resolved[b])){
      toast('Aún quedan autómatas por resolver');
      return;
    }
    let html=`
      <div class="sheet-section">
        <div class="sheet-label">Rumor del día</div>
        <div class="outcome-grid">
          <button class="outcome-btn" id="noRumorBtn">🌙 Sin rumor</button>
          ${bots.map(b=>`<button class="outcome-btn" data-rumor-source="${b}" ${S.rumors.length>=3?'disabled':''}>${BOT_CONFIG[b].icon} Desde ${b}</button>`).join('')}
        </div>
      </div>
      <div id="rumorCandidates"></div>
    `;
    openSheet('Cerrar Fase del Mundo','No toda Carta de Orden tiene que crear una historia. Tú decides.',html,root=>{
      $('#noRumorBtn').onclick=()=>finishWorld(null);
      root.querySelectorAll('[data-rumor-source]').forEach(btn=>{
        btn.onclick=()=>{
          const name=btn.dataset.rumorSource;
          const candidates=generateRumorCandidates(name);
          const host=$('#rumorCandidates');
          host.innerHTML=`
            <div class="sheet-section">
              <div class="sheet-label">Elige qué historia emerge</div>
              <div class="stack">
                ${candidates.map((c,i)=>`<button class="outcome-btn" style="text-align:left;min-height:52px" data-candidate="${i}">${esc(c.text)}</button>`).join('')}
              </div>
            </div>
          `;
          host.querySelectorAll('[data-candidate]').forEach(c=>c.onclick=()=>finishWorld(candidates[Number(c.dataset.candidate)]));
        };
      });
    });
  }

  function renderStates(){
    const box=$('#statesList');box.innerHTML='';
    if(!S.states.length){
      box.innerHTML='<div class="empty">El mapa no tiene estados especiales activos.</div>';
      return;
    }
    S.states.forEach((s,i)=>{
      const div=document.createElement('div');div.className='item';
      div.innerHTML=`
        <div class="item-head">
          <div><div class="item-title">Claro ${esc(s.clear)} · ${esc(s.name)}</div><div class="item-meta">Marcador físico activo</div></div>
          <button class="chip" data-resolve-state="${i}">Resolver</button>
        </div>
      `;
      div.querySelector('[data-resolve-state]').onclick=()=>{
        const old=S.states.splice(i,1)[0];
        addLog(`Estado resuelto: claro ${old.clear} · ${old.name}`,'🗺️');
        save();renderStates();
      };
      box.appendChild(div);
    });
  }

  function openAddState(){
    chooseClear('Estado del mapa',clear=>{
      openSheet(`Claro ${clear}`,'Elige el único estado principal de ese claro.',`
        <div class="state-grid">
          ${STATE_TYPES.map((x,i)=>`<button class="state-btn" data-state="${i}">${x[0]} ${x[1]}</button>`).join('')}
        </div>
      `,root=>{
        root.querySelectorAll('[data-state]').forEach(btn=>{
          btn.onclick=()=>{
            const stateName=STATE_TYPES[Number(btn.dataset.state)][1];
            const existing=S.states.find(x=>String(x.clear)===String(clear));
            if(existing) existing.name=stateName;
            else S.states.push({clear:String(clear),name:stateName});
            addLog(`Estado: claro ${clear} · ${stateName}`,'🗺️');
            save();closeSheet();renderStates();
          };
        });
      });
    });
  }

  function renderRumors(){
    const box=$('#rumorsList');
    $('#rumorCounter').textContent=`${S.rumors.length} / 3`;
    box.innerHTML='';
    if(!S.rumors.length){
      box.innerHTML='<div class="empty">Todavía no hay historias activas. Surgen durante la Fase del Mundo.</div>';
      return;
    }
    S.rumors.forEach((r,i)=>{
      const div=document.createElement('div');div.className='item';
      div.innerHTML=`
        <div class="item-head">
          <div>
            <span class="tag">${r.suit} · ${esc(r.origin)} · Día ${r.day}</span>
            <div class="item-title" style="margin-top:8px">${esc(r.text)}</div>
          </div>
        </div>
        <div class="btn-row" style="margin-top:10px">
          <button class="btn secondary" data-investigate-rumor="${i}">🔎 Investigar</button>
          <button class="btn secondary" data-resolve-rumor="${i}">✓ Resolver</button>
        </div>
      `;
      div.querySelector('[data-investigate-rumor]').onclick=()=>{
        if(recordAction({label:'Investigar rumor',icon:'🔎',cost:1,meta:r.text})) switchView('turno');
      };
      div.querySelector('[data-resolve-rumor]').onclick=()=>{
        const old=S.rumors.splice(i,1)[0];
        addLog(`Rumor resuelto: ${old.text}`,'🃏');
        save();renderRumors();
      };
      box.appendChild(div);
    });
  }

  function serviceUnlocked(level,index){
    return level >= index+1;
  }

  function renderLandmarks(){
    const box=$('#landmarksList');box.innerHTML='';
    S.landmarks.forEach((l,idx)=>{
      const base=LANDMARKS[idx] || l;
      const card=document.createElement('div');card.className='landmark';
      card.innerHTML=`
        <div class="landmark-top">
          <div>
            <div class="landmark-name">${esc(l.name)}</div>
            <div class="landmark-desc">${esc(base.description||'')}</div>
          </div>
          <span class="tag">${l.clear?'Claro '+esc(l.clear):'Oculto'}</span>
        </div>
        <div class="landmark-actions">
          ${!l.clear?'<button class="chip" data-reveal>📍 Revelar ubicación</button>':''}
          ${l.clear && l.level<1?'<button class="chip" data-progress>👣 Visitar</button>':''}
          ${l.level===1?'<button class="chip" data-progress>🔎 Explorar</button>':''}
          ${l.level===2?'<button class="chip" data-progress>⭐ Vincular</button>':''}
          ${l.level===3?'<span class="chip active">✓ Vinculado</span>':''}
        </div>
        <div class="landmark-actions">
          ${base.services.map((s,i)=>`<span class="chip ${serviceUnlocked(l.level,i)?'active':''}">${serviceUnlocked(l.level,i)?'✓':'🔒'} ${esc(s)}</span>`).join('')}
        </div>
      `;
      const reveal=card.querySelector('[data-reveal]');
      if(reveal) reveal.onclick=()=>chooseClear(`Ubicar · ${l.name}`,clear=>{
        l.clear=String(clear);
        addLog(`${l.name} revelado en claro ${clear}`,'🏛️');
        save();closeSheet();renderLandmarks();
      });
      const progress=card.querySelector('[data-progress]');
      if(progress) progress.onclick=()=>{
        const labels=['','Visitar','Explorar','Vincular'];
        const target=l.level+1;
        if(recordAction({label:`${labels[target]} · ${l.name}`,icon:'🏛️',cost:1,clear:l.clear,meta:`Nivel ${target}/3`,effect:()=>{l.level=target}})){
          renderLandmarks();switchView('descubrir');
        }
      };
      box.appendChild(card);
    });
  }

  function renderHistory(){
    const box=$('#historyList');
    if(!box) return;
    box.innerHTML='';
    if(!S.log.length){
      box.innerHTML='<div class="empty">El bosque todavía no tiene historia registrada.</div>';
      return;
    }
    S.log.slice(0,80).forEach(x=>{
      const row=document.createElement('div');row.className='timeline-item';
      row.innerHTML=`
        <div class="timeline-icon">${x.icon||'•'}</div>
        <div><div class="timeline-title">${esc(x.text)}</div><div class="timeline-meta">Día ${x.day}</div></div>
        <span class="tag">D${x.day}</span>
      `;
      box.appendChild(row);
    });
  }

  function renderAll(){
    renderHeader();
    renderActions();
    renderToday();
    renderWorldBanner();
    renderSkills();
    renderInventory();
    renderReputation();
    renderBots();
    renderStates();
    renderRumors();
    renderLandmarks();
    renderHistory();
  }

  function switchView(name){
    $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
    $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  $$('.nav-btn').forEach(btn=>btn.onclick=()=>switchView(btn.dataset.view));

  $('#addStateBtn').onclick=openAddState;

  $('#damageBtn').onclick=()=>{
    S.character.hp=clamp(S.character.hp-1,0,S.character.maxHp);
    addLog('Pierde 1 ❤️','❤️');
    save();renderHeader();
  };
  $('#healBtn').onclick=()=>{
    S.character.hp=clamp(S.character.hp+1,0,S.character.maxHp);
    addLog('Recupera 1 ❤️','❤️');
    save();renderHeader();
  };
  $('#gainXpBtn').onclick=()=>{
    S.character.xp+=1;
    addLog('+1 XP por progreso significativo','⭐');
    save();renderHeader();
  };

  $('#levelUpBtn').onclick=()=>{
    if(S.character.xp<5){toast('Necesitas 5 XP');return}
    const options=[
      ...Object.entries(S.character.skills).filter(([,v])=>v<2).map(([k])=>({label:`+ 1 ${k}`,skill:k})),
      {label:'+1 Vida máxima',hp:true}
    ];
    openSheet('Mejora de nivel','Gastas 5 XP y eliges una mejora.',`
      <div class="outcome-grid">
        ${options.map((o,i)=>`<button class="outcome-btn" data-upgrade="${i}">⭐ ${esc(o.label)}</button>`).join('')}
      </div>
    `,root=>{
      root.querySelectorAll('[data-upgrade]').forEach(btn=>btn.onclick=()=>{
        const choice=options[Number(btn.dataset.upgrade)];
        S.character.xp-=5;
        S.character.level+=1;
        if(choice.skill) S.character.skills[choice.skill]+=1;
        if(choice.hp){S.character.maxHp+=1;S.character.hp+=1}
        addLog(`Nivel ${S.character.level}: ${choice.label}`,'🏅');
        save();closeSheet();renderAll();
      });
    });
  };

  $('#settingsBtn').onclick=()=>{
    openSheet('Ajustes','Solo lo esencial; el juego ocurre en la mesa.',`
      <div class="setting-row">
        <div><div class="item-title">Jugador</div><div class="meta">${esc(S.playerName||'Sin nombre')}</div></div>
        <button class="chip" id="editNameBtn">Editar</button>
      </div>
      <div class="setting-row">
        <div><div class="item-title">Posición actual</div><div class="meta">${S.character.clear?'Claro '+esc(S.character.clear):'Sin fijar'}</div></div>
        <button class="chip" id="setLocationBtn">Cambiar</button>
      </div>
      <div class="setting-row">
        <div><div class="item-title">🌿 Alianza Automatizada</div><div class="meta">${S.bots.Alianza?'Activa':'Inactiva'} en las Fases del Mundo.</div></div>
        <button class="chip ${S.bots.Alianza?'active':''}" id="toggleAllianceBtn">${S.bots.Alianza?'Activa':'Activar'}</button>
      </div>
      <div class="setting-row">
        <div><div class="item-title">Versión</div><div class="meta">Root RPG Sandbox Companion v0.3</div></div>
        <span class="tag">button-first</span>
      </div>
    `,root=>{
      $('#editNameBtn').onclick=()=>{
        closeSheet();
        $('#onboarding').classList.add('open');
        $('#playerName').value=S.playerName||'';
        $('#startCampaignBtn').textContent='Guardar nombre';
      };
      $('#setLocationBtn').onclick=()=>{
        closeSheet();
        chooseClear('Posición actual',clear=>{S.character.clear=String(clear);save();closeSheet();renderAll()});
      };
      $('#toggleAllianceBtn').onclick=()=>{
        S.bots.Alianza=!S.bots.Alianza;
        if(!S.bots.Alianza){
          S.world.resolved.Alianza=false;
          delete S.world.records.Alianza;
        }
        save();closeSheet();renderAll();toast(S.bots.Alianza?'Alianza activada':'Alianza desactivada');
      };
    });
  };

  $('#exportBtn').onclick=()=>{
    const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`root-rpg-${S.playerName||'campana'}-dia-${S.day}.json`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };

  $('#importInput').onchange=async e=>{
    const file=e.target.files?.[0];
    if(!file) return;
    try{
      const parsed=JSON.parse(await file.text());
      S={...freshState(),...parsed,onboarded:true};
      save();renderAll();toast('Campaña importada');
    }catch(_){toast('Archivo no válido')}
    e.target.value='';
  };

  $('#resetBtn').onclick=()=>{
    openSheet('Nueva campaña','Se borrará el estado local actual de esta campaña.',`
      <div class="result-card">
        <div class="result-score">⚠️ Reiniciar</div>
        <div class="result-text">Exporta un respaldo antes si quieres conservarla.</div>
      </div>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn red grow" id="confirmResetBtn">Sí, empezar de cero</button>
      </div>
    `,()=>{
      $('#confirmResetBtn').onclick=()=>{
        S=freshState();
        localStorage.setItem(KEY,JSON.stringify(S));
        closeSheet();
        renderAll();
        showOnboarding();
      };
    });
  };

  function showOnboarding(){
    $('#onboarding').classList.add('open');
    $('#playerName').value=S.playerName||'';
    $('#startCampaignBtn').textContent=S.playerName?'Guardar nombre':'Comenzar campaña';
    setTimeout(()=>$('#playerName').focus(),100);
  }

  $('#startCampaignBtn').onclick=()=>{
    const name=$('#playerName').value.trim();
    if(!name){toast('Escribe tu nombre');return}
    const first=!S.onboarded;
    S.playerName=name;
    S.onboarded=true;
    save();
    $('#onboarding').classList.remove('open');
    renderAll();
    if(first){
      addLog(`${name} entra al bosque como Pícaro.`,'🦝');
      setTimeout(()=>chooseClear('¿Dónde comienza tu Pícaro?',clear=>{
        S.character.clear=String(clear);
        addLog(`Comienza en el claro ${clear}.`,'📍');
        save();closeSheet();renderAll();
      }),180);
    }
  };

  if(!S.onboarded) showOnboarding();
  ensureWorldProgress();
  renderAll();

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  }
})();