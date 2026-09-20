window.ROOT_RPG_CHARACTER_DATA = {
  version: "character-system-v1",
  vagabonds: {
    thief: {
      id: "thief",
      name: "THIEF",
      species: "Raccoon",
      portrait: "./portrait-thief.svg",
      tagline: "Oportunismo, sigilo e información",
      playstyle: "Infiltración · robo · contrabando · inteligencia",
      specialAbility: {
        id: "steal",
        name: "STEAL",
        frequency: "once_per_day",
        description: "Una vez por día, interactúa con otro actor presente en tu claro para sustraer recursos, cartas, objetos o información cuando la situación lo permita.",
        physicalReminder: "La carta u objeto físico se resuelve en mesa; la app solo registra la consecuencia."
      },
      startingItems: ["torch","tea","boot","sword"],
      branches: [
        {id:"shadow",name:"SHADOW",summary:"Infiltración y evasión"},
        {id:"opportunist",name:"OPPORTUNIST",summary:"Saqueo, recursos y contrabando"},
        {id:"informant",name:"INFORMANT",summary:"Rumores, contactos e inteligencia"}
      ],
      skills: [
        {id:"thief_shadow_1",name:"SNEAK",characterType:"thief",branch:"shadow",tier:1,description:"Abre soluciones discretas de infiltración.",effect:"mission_option",opensOptions:[{tag:"infiltration",label:"INFILTRARSE",resolution:"skill"}],unlockRequirements:[],unlocked:false,dateUnlocked:null},
        {id:"thief_shadow_2",name:"GHOST",characterType:"thief",branch:"shadow",tier:2,description:"Reduce determinadas consecuencias al ser descubierto.",effect:"consequence_softener",opensOptions:[{tag:"escape",label:"DESAPARECER",resolution:"skill"}],unlockRequirements:["thief_shadow_1"],unlocked:false,dateUnlocked:null},
        {id:"thief_shadow_3",name:"MASTER OF SHADOWS",characterType:"thief",branch:"shadow",tier:3,description:"Abre soluciones especiales de infiltración avanzada.",effect:"mission_option",opensOptions:[{tag:"infiltration_advanced",label:"ENTRAR SIN DEJAR RASTRO",resolution:"special"}],unlockRequirements:["thief_shadow_2"],unlocked:false,dateUnlocked:null},

        {id:"thief_opportunist_1",name:"SCAVENGER",characterType:"thief",branch:"opportunist",tier:1,description:"Mejora las oportunidades de saqueo.",effect:"reward_option",opensOptions:[{tag:"loot",label:"BUSCAR ALGO MÁS",resolution:"reward"}],unlockRequirements:[],unlocked:false,dateUnlocked:null},
        {id:"thief_opportunist_2",name:"BLACK MARKET",characterType:"thief",branch:"opportunist",tier:2,description:"Desbloquea comerciantes e intercambios especiales.",effect:"market_access",opensOptions:[{tag:"trade",label:"CONTACTAR MERCADO NEGRO",resolution:"special"}],unlockRequirements:["thief_opportunist_1"],unlocked:false,dateUnlocked:null},
        {id:"thief_opportunist_3",name:"KING OF THIEVES",characterType:"thief",branch:"opportunist",tier:3,description:"Abre oportunidades únicas de contrabando, robo e información.",effect:"mission_option",opensOptions:[{tag:"contraband",label:"ACTIVAR RED DE CONTRABANDO",resolution:"special"}],unlockRequirements:["thief_opportunist_2"],unlocked:false,dateUnlocked:null},

        {id:"thief_informant_1",name:"EAVESDROP",characterType:"thief",branch:"informant",tier:1,description:"Permite extraer información adicional en encuentros.",effect:"mission_option",opensOptions:[{tag:"information",label:"ESCUCHAR A ESCONDIDAS",resolution:"skill"}],unlockRequirements:[],unlocked:false,dateUnlocked:null},
        {id:"thief_informant_2",name:"NETWORK",characterType:"thief",branch:"informant",tier:2,description:"Amplía el acceso a rumores de facciones conocidas.",effect:"rumor_access",opensOptions:[{tag:"faction_rumor",label:"CONSULTAR LA RED",resolution:"special"}],unlockRequirements:["thief_informant_1"],unlocked:false,dateUnlocked:null},
        {id:"thief_informant_3",name:"SPYMASTER",characterType:"thief",branch:"informant",tier:3,description:"Permite acceder ocasionalmente a información oculta del mundo.",effect:"world_intel",opensOptions:[{tag:"hidden_intel",label:"ACTIVAR INFORMANTE",resolution:"special"}],unlockRequirements:["thief_informant_2"],unlocked:false,dateUnlocked:null}
      ],
      signatureTags:["infiltration","theft","information","contraband"],
      signatureActionIds:["infiltrate","investigate","trade"]
    },

    ranger: {
      id: "ranger",
      name: "RANGER",
      species: "Fox",
      portrait: "./portrait-ranger.svg",
      tagline: "Supervivencia, combate y exploración",
      playstyle: "Rastreo · zonas peligrosas · autosuficiencia",
      specialAbility: {
        id: "hideout",
        name: "HIDEOUT",
        frequency: "once_per_day",
        description: "Una vez por día, retírate a un refugio: repara hasta tres objetos dañados y termina inmediatamente tu jornada.",
        physicalReminder: "Conserva la identidad original de recuperación del Ranger."
      },
      startingItems: ["torch","boot","sword","crossbow"],
      branches: [
        {id:"pathfinder",name:"PATHFINDER",summary:"Rastreo y exploración"},
        {id:"hunter",name:"HUNTER",summary:"Persecución y emboscada"},
        {id:"survivor",name:"SURVIVOR",summary:"Recuperación y resistencia"}
      ],
      skills: [
        {id:"ranger_pathfinder_1",name:"TRACKER",characterType:"ranger",branch:"pathfinder",tier:1,description:"Detecta rastros, amenazas e información extra.",effect:"mission_option",opensOptions:[{tag:"tracking",label:"LEER HUELLAS",resolution:"skill"}],unlockRequirements:[],unlocked:false,dateUnlocked:null},
        {id:"ranger_pathfinder_2",name:"PATHFINDER",characterType:"ranger",branch:"pathfinder",tier:2,description:"Abre rutas especiales en viajes y zonas difíciles.",effect:"travel_option",opensOptions:[{tag:"difficult_route",label:"BUSCAR RUTA SEGURA",resolution:"skill"}],unlockRequirements:["ranger_pathfinder_1"],unlocked:false,dateUnlocked:null},
        {id:"ranger_pathfinder_3",name:"MASTER EXPLORER",characterType:"ranger",branch:"pathfinder",tier:3,description:"Puede descubrir rutas o localizaciones excepcionales.",effect:"discovery_option",opensOptions:[{tag:"hidden_location",label:"EXPLORAR MÁS ALLÁ",resolution:"special"}],unlockRequirements:["ranger_pathfinder_2"],unlocked:false,dateUnlocked:null},

        {id:"ranger_hunter_1",name:"HUNTER",characterType:"ranger",branch:"hunter",tier:1,description:"Abre opciones de caza y persecución.",effect:"mission_option",opensOptions:[{tag:"pursuit",label:"SEGUIR LA PRESA",resolution:"skill"}],unlockRequirements:[],unlocked:false,dateUnlocked:null},
        {id:"ranger_hunter_2",name:"AMBUSHER",characterType:"ranger",branch:"hunter",tier:2,description:"Permite preparar emboscadas en determinadas misiones.",effect:"mission_option",opensOptions:[{tag:"ambush",label:"PREPARAR EMBOSCADA",resolution:"skill"}],unlockRequirements:["ranger_hunter_1"],unlocked:false,dateUnlocked:null},
        {id:"ranger_hunter_3",name:"APEX HUNTER",characterType:"ranger",branch:"hunter",tier:3,description:"Abre oportunidades contra objetivos especialmente peligrosos.",effect:"mission_option",opensOptions:[{tag:"dangerous_target",label:"CAZAR AL OBJETIVO",resolution:"special"}],unlockRequirements:["ranger_hunter_2"],unlocked:false,dateUnlocked:null},

        {id:"ranger_survivor_1",name:"FIELD REPAIR",characterType:"ranger",branch:"survivor",tier:1,description:"Mejora oportunidades de reparación lejos de un refugio.",effect:"repair_option",opensOptions:[{tag:"repair",label:"REPARACIÓN DE CAMPO",resolution:"skill"}],unlockRequirements:[],unlocked:false,dateUnlocked:null},
        {id:"ranger_survivor_2",name:"ENDURANCE",characterType:"ranger",branch:"survivor",tier:2,description:"Reduce determinadas penalizaciones de expediciones.",effect:"consequence_softener",opensOptions:[{tag:"expedition",label:"SEGUIR ADELANTE",resolution:"skill"}],unlockRequirements:["ranger_survivor_1"],unlocked:false,dateUnlocked:null},
        {id:"ranger_survivor_3",name:"UNBREAKABLE",characterType:"ranger",branch:"survivor",tier:3,description:"Abre opciones exclusivas en supervivencia extrema.",effect:"mission_option",opensOptions:[{tag:"survival_extreme",label:"RESISTIR LO IMPOSIBLE",resolution:"special"}],unlockRequirements:["ranger_survivor_2"],unlocked:false,dateUnlocked:null}
      ],
      signatureTags:["tracking","exploration","pursuit","survival"],
      signatureActionIds:["explore","combat","move"]
    },

    tinker: {
      id: "tinker",
      name: "TINKER",
      species: "Beaver",
      portrait: "./portrait-tinker.svg",
      tagline: "Creación, recuperación y recursos",
      playstyle: "Fabricación · reparación · rescate de materiales",
      specialAbility: {
        id: "day_labor",
        name: "DAY LABOR",
        frequency: "once_per_day",
        description: "Una vez por día, recupera una carta o recurso apropiado del descarte físico. En el RPG abre soluciones de recuperación y reutilización.",
        physicalReminder: "La carta se toma del descarte físico; la app no elige por ti."
      },
      startingItems: ["torch","bag","boot","hammer"],
      branches: [
        {id:"craftsman",name:"CRAFTSMAN",summary:"Reparación y fabricación"},
        {id:"scavenger",name:"SCAVENGER",summary:"Restos, ruinas y recuperación"},
        {id:"inventor",name:"INVENTOR",summary:"Improvisación y mecanismos"}
      ],
      skills: [
        {id:"tinker_craftsman_1",name:"REPAIRMAN",characterType:"tinker",branch:"craftsman",tier:1,description:"Abre mejores opciones al reparar objetos.",effect:"repair_option",opensOptions:[{tag:"repair",label:"REPARAR CON PRECISIÓN",resolution:"skill"}],unlockRequirements:[],unlocked:false,dateUnlocked:null},
        {id:"tinker_craftsman_2",name:"CRAFTSMAN",characterType:"tinker",branch:"craftsman",tier:2,description:"Desbloquea recetas y soluciones de fabricación.",effect:"craft_option",opensOptions:[{tag:"craft",label:"FABRICAR SOLUCIÓN",resolution:"skill"}],unlockRequirements:["tinker_craftsman_1"],unlocked:false,dateUnlocked:null},
        {id:"tinker_craftsman_3",name:"MASTER ARTIFICER",characterType:"tinker",branch:"craftsman",tier:3,description:"Permite fabricar o restaurar objetos excepcionales.",effect:"craft_option",opensOptions:[{tag:"exceptional_craft",label:"RESTAURAR ARTEFACTO",resolution:"special"}],unlockRequirements:["tinker_craftsman_2"],unlocked:false,dateUnlocked:null},

        {id:"tinker_scavenger_1",name:"SALVAGE",characterType:"tinker",branch:"scavenger",tier:1,description:"Mejora recompensas de restos, ruinas y campos de batalla.",effect:"reward_option",opensOptions:[{tag:"salvage",label:"RECUPERAR RESTOS",resolution:"reward"}],unlockRequirements:[],unlocked:false,dateUnlocked:null},
        {id:"tinker_scavenger_2",name:"RECLAIM",characterType:"tinker",branch:"scavenger",tier:2,description:"Permite recuperar determinados recursos especiales.",effect:"resource_recovery",opensOptions:[{tag:"resource",label:"RECLAMAR MATERIAL",resolution:"skill"}],unlockRequirements:["tinker_scavenger_1"],unlocked:false,dateUnlocked:null},
        {id:"tinker_scavenger_3",name:"TREASURE FROM TRASH",characterType:"tinker",branch:"scavenger",tier:3,description:"Puede hallar materiales excepcionales donde otros no.",effect:"reward_option",opensOptions:[{tag:"rare_salvage",label:"BUSCAR TESORO ENTRE RESTOS",resolution:"special"}],unlockRequirements:["tinker_scavenger_2"],unlocked:false,dateUnlocked:null},

        {id:"tinker_inventor_1",name:"IMPROVISE",characterType:"tinker",branch:"inventor",tier:1,description:"Abre soluciones alternativas con lo que haya disponible.",effect:"mission_option",opensOptions:[{tag:"alternative_entry",label:"IMPROVISAR OTRA ENTRADA",resolution:"skill"}],unlockRequirements:[],unlocked:false,dateUnlocked:null},
        {id:"tinker_inventor_2",name:"CONTRAPTION",characterType:"tinker",branch:"inventor",tier:2,description:"Permite emplear dispositivos y mecanismos especiales.",effect:"mission_option",opensOptions:[{tag:"mechanism",label:"MONTAR MECANISMO",resolution:"skill"}],unlockRequirements:["tinker_inventor_1"],unlocked:false,dateUnlocked:null},
        {id:"tinker_inventor_3",name:"INVENTOR",characterType:"tinker",branch:"inventor",tier:3,description:"Abre soluciones únicas de ingeniería y artefactos.",effect:"mission_option",opensOptions:[{tag:"engineering",label:"DISEÑAR SOLUCIÓN ÚNICA",resolution:"special"}],unlockRequirements:["tinker_inventor_2"],unlocked:false,dateUnlocked:null}
      ],
      signatureTags:["craft","repair","salvage","alternative_entry"],
      signatureActionIds:["craft","explore","trade"]
    }
  },

  milestoneRules: {
    firstMission: {id:"first_mission",label:"Primera misión completada",grantsSkillChoice:true},
    thirdMission: {id:"third_mission",label:"Tres misiones completadas",grantsSkillChoice:true},
    firstLandmark: {id:"first_landmark",label:"Primer Lugar Mítico descubierto",grantsSkillChoice:true},
    bondedLandmark: {id:"bonded_landmark",label:"Primer Lugar Mítico vinculado",grantsSkillChoice:true},
    firstTrustedFaction: {id:"first_trusted_faction",label:"Primera facción en Confiable",grantsSkillChoice:true},
    itemBreadth: {id:"item_breadth",label:"Cinco tipos de objetos distintos",grantsSkillChoice:true},
    signatureActions: {id:"signature_actions",label:"Tres acciones propias del arquetipo",grantsSkillChoice:true},
    majorWorldEvent: {id:"major_world_event",label:"Participó en un evento importante del bosque",grantsSkillChoice:true}
  }
};