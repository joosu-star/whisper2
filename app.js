const firebaseConfig={
  apiKey:"AIzaSyAh7...",
  authDomain:"icg-slp.firebaseapp.com",
  projectId:"icg-slp"
};

firebase.initializeApp(firebaseConfig);
const db=firebase.firestore();

let currentTab="trending";
let currentChannel="general";
let lastTime=0;

// ADMIN
const A="MzAxOTE1MzE=";
let isAdmin=false;

function activarAdmin(){
  let p=prompt("...");
  if(p===atob(A)){
    isAdmin=true;
    localStorage.setItem("owner",getUserId());
    alert("Admin activado");
    render();
  }
}

// USER
function getUserId(){
  let id=localStorage.getItem("uid");
  if(!id){
    id="u_"+Math.random().toString(36).substr(2,9);
    localStorage.setItem("uid",id);
  }
  return id;
}

function getOwner(){
  return localStorage.getItem("owner");
}

// MODAL
function openModal(){
  if(currentTab==="info" || currentTab==="fame"){
    alert("No puedes publicar aquí");
    return;
  }
  document.getElementById("newMsg").placeholder=getPlaceholder();
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal(){
  document.getElementById("modal").classList.add("hidden");
}

// TIEMPO
function timeAgo(t){
  let d=(Date.now()-t)/1000;
  if(d<60) return Math.floor(d)+"s";
  if(d<3600) return Math.floor(d/60)+"m";
  if(d<86400) return Math.floor(d/3600)+"h";
  return Math.floor(d/86400)+"d";
}

// SCORE
function score(m){
  return (m.likes||0)+(m.pinned?1000:0);
}

// PLACEHOLDER
function getPlaceholder(){
  switch(currentChannel){
    case "general": return "¿Qué quieres decir?";
    case "profesores": return "Opina sobre un profesor…";
    case "experiencias": return "Cuenta tu experiencia…";
    case "quejas": return "Describe la situación…";
    default: return "Escribe algo...";
  }
}

// ADD
async function addMessage(){
  let text=document.getElementById("newMsg").value.trim();
  if(!text)return;

  if(Date.now()-lastTime<4000){
    alert("Espera unos segundos");
    return;
  }

  await db.collection("mensajes").add({
    text,
    user:getUserId(),
    likes:0,
    likedBy:[],
    pinned:false,
    timestamp:Date.now(),
    categoria:currentChannel
  });

  lastTime=Date.now();
  document.getElementById("newMsg").value="";
  closeModal();
}

// LIKE
async function like(id){
  let ref=db.collection("mensajes").doc(id);
  let doc=await ref.get();
  let data=doc.data();
  let user=getUserId();

  if(data.likedBy?.includes(user)) return;

  await ref.update({
    likes:(data.likes||0)+1,
    likedBy:[...(data.likedBy||[]),user]
  });
}

// DELETE
async function deleteMessage(id){
  await db.collection("mensajes").doc(id).delete();
}

// TAB
function switchTab(tab){
  currentTab=tab;
  document.querySelectorAll(".main-tab").forEach(t=>t.classList.remove("active"));
  event.target.classList.add("active");
  if(tab!=="trending") hideChannels();
  render();
}

// CHANNELS
function toggleChannels(){
  let d=document.getElementById("channelsDropdown");
  d.classList.toggle("show");
}

function hideChannels(){
  document.getElementById("channelsDropdown").classList.remove("show");
}

function switchChannel(channel){
  currentChannel=channel;
  hideChannels();
  render();
}

// RENDER
function render(){
  let c=document.getElementById("content");
  let search=document.getElementById("searchInput").value.toLowerCase();

  db.collection("mensajes").onSnapshot(snap=>{
    c.innerHTML="";
    let arr=[];
    snap.forEach(d=>arr.push({id:d.id,...d.data()}));
    arr=arr.filter(m=>m.text.toLowerCase().includes(search));

    // INFO
    if(currentTab==="info"){
      c.innerHTML=`<div class="info-box">
      🕶️ Whispr<br><br>
      Plataforma digital enfocada en la expresión anónima dentro de comunidades.<br><br>
      🎯 Misión: Permitir que las personas compartan experiencias, opiniones y situaciones sin miedo.<br>
      🔒 Privacidad: No almacenamos identidad real<br>
      ⚖️ Normas: No amenazas reales, no datos personales, no contenido ilegal.<br>
      📌 Nota: Whispr es una plataforma independiente creada con fines sociales y de expresión.
      </div>`;
      updateBodyClass();
      return;
    }

    // SALON
    if(currentTab==="fame"){
      let hoy=Date.now()-86400000;
      let semana=Date.now()-604800000;

      let topDia=arr.filter(m=>m.timestamp>hoy).sort((a,b)=>score(b)-score(a)).slice(0,6);
      let topSemana=arr.filter(m=>m.timestamp>semana).sort((a,b)=>score(b)-score(a)).slice(0,6);
      let topGlobal=arr.sort((a,b)=>score(b)-score(a)).slice(0,6);

      c.innerHTML+=crearSeccion("🔥 Hoy",topDia);
      c.innerHTML+=crearSeccion("🏆 Semana",topSemana);
      c.innerHTML+=crearSeccion("💎 Historia",topGlobal);
      updateBodyClass();
      return;
    }

    if(currentTab!=="trending") arr=arr.filter(m=>m.categoria===currentChannel);

    // trending logic
    if(currentTab==="trending"){
      arr.sort((a,b)=>score(b)-score(a));
    } else {
      arr.sort((a,b)=>b.timestamp-a.timestamp);
    }

    arr.forEach(createMessage);
    updateBodyClass();
  });
}

// SALON
function crearSeccion(titulo,data){
  if(data.length===0){
    return `<div class="info-box">Sin mensajes aún</div>`;
  }

  let html=`<div class="fame-section"><div class="fame-title">${titulo}</div><div class="fame-grid">`;

  data.forEach((m,i)=>{
    html+=`
      <div class="fame-card ${i===0?"fame-top":""}">
        ${i===0?"👑":""}
        <div>${m.text}</div>
        <div><span class="category-badge" style="background:${getChannelColor(m.categoria)}">${getChannelIcon(m.categoria)} ${m.categoria}</span></div>
        <div>❤️ ${m.likes}</div>
      </div>
    `;
  });

  html+="</div></div>";
  return html;
}

function getChannelColor(c){
  switch(c){
    case "general": return "#1E90FF";
    case "profesores": return "#32CD32";
    case "experiencias": return "#8A2BE2";
    case "quejas": return "#FF4500";
    default: return "#888";
  }
}

function getChannelIcon(c){
  switch(c){
    case "general": return "💬";
    case "profesores": return "👨‍🏫";
    case "experiencias": return "🧠";
    case "quejas": return "⚠️";
    default: return "";
  }
}

// UI
function createMessage(m){
  let div=document.createElement("div");
  let isOwner=m.user===getOwner();

  div.className="message "+(isOwner?"owner":"");

  div.innerHTML=`
    ${isOwner?`<span class="owner-name">👑 Owner</span>`:""}
    <br>${m.text}
    <br><small>${timeAgo(m.timestamp)}</small>
    <br><span class="category-badge" style="background:${getChannelColor(m.categoria)}">${getChannelIcon(m.categoria)} ${m.categoria}</span>
    <br>❤️ ${m.likes}
    <br>
    <button onclick="like('${m.id}')">❤️</button>
    ${(m.user===getUserId()||isAdmin)?`<button onclick="deleteMessage('${m.id}')">🗑️</button>`:""}
  `;

  document.getElementById("content").appendChild(div);
}

function updateBodyClass(){
  document.body.className="";
  if(currentTab!=="trending" && currentTab!=="fame" && currentTab!=="info"){
    document.body.classList.add("channel-"+currentChannel);
    document.getElementById("currentChannel").innerText="Canal: "+capitalize(currentChannel);
  } else {
    document.getElementById("currentChannel").innerText="";
  }
}

function capitalize(str){
  return str.charAt(0).toUpperCase()+str.slice(1);
}

render();
