let currentChannel="general";
let currentTab="trending";

// Canales
const channelButtons=document.querySelectorAll(".channel-btn");
channelButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    currentChannel=btn.dataset.channel;
    updateBodyClass();
    channelButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Tabs
const tabs=document.querySelectorAll(".tab");
tabs.forEach(tab=>{
  tab.addEventListener("click",()=>{
    currentTab=tab.dataset.tab;
    tabs.forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(tc=>tc.classList.remove("active"));
    document.getElementById(currentTab).classList.add("active");
    updateBodyClass(); // Actualiza el texto del canal
  });
});

// Funciones auxiliares
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function getChannelColor(channel){
  switch(channel){
    case "general": return "#1E90FF";
    case "profesores": return "#32CD32";
    case "experiencias": return "#8A2BE2";
    case "quejas": return "#FF4500";
    default: return "#000";
  }
}
function updateBodyClass(){
  // Limpiar y agregar clase de canal
  document.body.className="";
  if(currentTab!=="trending" && currentTab!=="info" && currentTab!=="fame"){
    document.body.classList.add("channel-"+currentChannel);
    const channelName=document.getElementById("currentChannel");
    channelName.innerText="Canal: "+capitalize(currentChannel);
    channelName.style.color=getChannelColor(currentChannel);
  } else {
    document.getElementById("currentChannel").innerText="";
  }
}

// Inicializar
document.addEventListener("DOMContentLoaded",()=>{
  channelButtons[0].classList.add("active");
  tabs[0].classList.add("active");
  document.getElementById("trending").classList.add("active");
  updateBodyClass();
});
