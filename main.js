const inputW = document.getElementById('inputW');
const btnInit = document.getElementById('btnInit');
const btnStep = document.getElementById('btnStep');
const btnRun = document.getElementById('btnRun');
const btnPause = document.getElementById('btnPause');
const btnReset = document.getElementById('btnReset');
const btnExport = document.getElementById('btnExport');
const tapeEl = document.getElementById('tape');
const stateBox = document.getElementById('stateBox');
const idBox = document.getElementById('idBox');
const resultBox = document.getElementById('result');
const speed = document.getElementById('speed');
const speedLabel = document.getElementById('speedLabel');

let tape = [];
let head = 0;
let state = 'q0';
let interval = null;
let halted = false;

let latestMarkedIndex = null;
let latestMarkedSymbol = null;

speed.addEventListener('input', () => speedLabel.textContent = speed.value + 'ms');

function blank() { return ' '; }
function isBlank(c) { return c === ' '; }

function renderTape() {
  tapeEl.innerHTML = '';
  tape.forEach((c,i)=>{
    const cell=document.createElement('div');
    cell.className='cell'+(i===head?' head':'');
    cell.innerHTML=`<div class="symbol">${c===blank()?'␣':c}</div><div class="idx">${i}</div>`;
    tapeEl.appendChild(cell);
  });
  const tapeStr=tape.map((c,i)=>(i===head?'[':' ')+(c===blank()?'␣':c)+(i===head?']':' ')).join('');
  idBox.textContent=`${state}  ${tapeStr}`;
  stateBox.textContent=state;
}

function initTape(){
  const w=inputW.value.trim();
  if(!w.includes(' ')){ alert('Por favor ingresa dos cadenas separadas por un espacio.'); return false; }
  tape=Array(6).fill(blank()).concat([...w],Array(12).fill(blank()));
  head=6; state='q0'; halted=false; latestMarkedIndex=null; latestMarkedSymbol=null; resultBox.innerHTML='';
  renderTape(); return true;
}

function findFirstUnmarkedInFirstBlock(){
  for(let i=6;i<tape.length&&!isBlank(tape[i]);i++){ if(tape[i]==='0'||tape[i]==='1') return i; }
  return -1;
}

function findFirstUnmarkedInSecondBlock(){
  let sep=6; while(sep<tape.length&&!isBlank(tape[sep])) sep++;
  for(let j=sep+1;j<tape.length&&!isBlank(tape[j]);j++){ if(tape[j]==='0'||tape[j]==='1') return j; }
  return -1;
}

function allSecondMarked(){
  let sep=6; while(sep<tape.length&&!isBlank(tape[sep])) sep++;
  for(let j=sep+1;j<tape.length&&!isBlank(tape[j]);j++){ if(tape[j]==='0'||tape[j]==='1') return false; }
  return true;
}

function step(){
  if(halted) return;
  switch(state){
    case 'q0':{
      const i=findFirstUnmarkedInFirstBlock();
      if(i===-1){ state='q4'; let k=6; while(k<tape.length&&!isBlank(tape[k]))k++; head=k; break; }
      latestMarkedIndex=i; latestMarkedSymbol=tape[i]; tape[i]=(tape[i]==='0'?'A':'B');
      const idxSecond=findFirstUnmarkedInSecondBlock(); head=idxSecond===-1?tape.length-1:idxSecond; state='q1';
      break;
    }
    case 'q1':{
      const idxSecond=findFirstUnmarkedInSecondBlock();
      if(idxSecond===-1){ state='q_reject'; halted=true; showReject(); break; }
      head=idxSecond; state='q2'; break;
    }
    case 'q2':{
      const idxSecond=head; const s2=tape[idxSecond];
      if(!(s2==='0'||s2==='1')){ state='q_reject'; halted=true; showReject(); break; }
      if(latestMarkedSymbol===null){ state='q_reject'; halted=true; showReject(); break; }
      if((latestMarkedSymbol==='0'&&s2==='0')||(latestMarkedSymbol==='1'&&s2==='1')){
        tape[idxSecond]=s2==='0'?'a':'b'; latestMarkedIndex=null; latestMarkedSymbol=null;
        const nextFirst=findFirstUnmarkedInFirstBlock();
        if(nextFirst===-1){ state='q4'; let k=6; while(k<tape.length&&!isBlank(tape[k]))k++; head=k; }else{ head=nextFirst; state='q0'; }
      }else{ state='q_reject'; halted=true; showReject(); }
      break;
    }
    case 'q4':{ if(allSecondMarked()){ state='q_accept'; halted=true; showAccept(); }else{ state='q_reject'; halted=true; showReject(); } break; }
    default: halted=true; break;
  }
  renderTape();
}

function showAccept(){ resultBox.innerHTML='<div class="status ok">✅ Aceptada — Las cadenas son IGUALES.</div>'; let k=tape.length-1; while(k>=0&&isBlank(tape[k]))k--; if(k<tape.length-1)tape[k+1]='#'; renderTape();}
function showReject(){ resultBox.innerHTML='<div class="status bad">❌ Rechazada — Las cadenas son DIFERENTES.</div>'; renderTape();}

// Controles
btnInit.onclick=()=>initTape();
btnStep.onclick=()=>{ if(!tape.length&&!initTape())return; step(); };
btnRun.onclick=()=>{
  if(!tape.length&&!initTape())return;
  if(interval)return;
  interval=setInterval(()=>{ if(halted){ clearInterval(interval); interval=null; return; } step(); }, parseInt(speed.value));
};
btnPause.onclick=()=>{ if(interval){ clearInterval(interval); interval=null; } };
btnReset.onclick=()=>{
  if(interval){ clearInterval(interval); interval=null; }
  tape=[]; head=0; state='q0'; halted=false; latestMarkedIndex=null; latestMarkedSymbol=null;
  resultBox.innerHTML=''; tapeEl.innerHTML=''; idBox.textContent='—'; stateBox.textContent='q0';
};
btnExport.onclick=()=>{
  const content=`Estudiante: Sergio Gramajo Pineda (0902-23-20001)\nEntrada: ${inputW.value}\nEstado final: ${state}\nResultado: ${state==='q_accept'?'ACEPTADA':'RECHAZADA'}\n\nCinta final:\n${tape.join('')}`;
  const blob=new Blob([content],{type:'text/plain'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='MT3_resultado.txt'; a.click();
};

// Toggle menú hamburguesa
const menuToggle=document.getElementById('menu-toggle');
const navMenu=document.getElementById('nav-menu');
menuToggle.addEventListener('click',()=>{ navMenu.classList.toggle('active'); });
