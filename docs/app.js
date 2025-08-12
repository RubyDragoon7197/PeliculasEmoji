// --- Base de datos de películas ---
// Cada objeto tiene emojis y un arreglo de respuestas aceptadas (minúsculas y sin tildes)
const MOVIES = [
  { e:"🤠🧸🌟", a:["toy story","toystory"] },
  { e:"🐠🔍🌊", a:["buscando a nemo","finding nemo","nemo"] },
  { e:"🧙‍♂️🚪👹", a:["monsters inc","monsters sa","monsters, inc","monsters inc.","monsters" ,"monsters and co","monsters y company"] },
  { e:"🦸‍♂️👨‍👩‍👧‍👦💥", a:["los increibles","the incredibles","increibles"] },
  { e:"🧅👹👸", a:["shrek"] },
  { e:"🦁👑🌅", a:["el rey leon","the lion king","rey leon"] },
  { e:"🎈🏠👴👦", a:["up"] },
  { e:"👧❄️👭", a:["frozen","frozen 1"] },
  { e:"🎭🧠😭😊", a:["intensamente","inside out"] },
  { e:"🤖🌍🚮", a:["wall e","walle","wall-e"] },
  { e:"🐉🛩️🏔️", a:["como entrenar a tu dragon","how to train your dragon","entrenar a tu dragon"] },
  { e:"🐭👨‍🍳🥖", a:["ratatouille","ratatuie","ratatui"] },
  { e:"🧙‍♀️🚂🎐", a:["el viaje de chihiro","spirited away","viaje de chihiro"] },
  { e:"🏎️⚡🏁", a:["cars","cars 1"] },
  { e:"🐼🥋🐉", a:["kung fu panda","kungfu panda"] },
  { e:"🌊🚢🗿", a:["moana","vaiana"] },
  { e:"🧒🧓🪗🌺", a:["coco"] },
  { e:"🦊👮‍♂️🕵️‍♀️", a:["zootopia","zootropolis"] },
  { e:"🧜‍♀️🌊🐚", a:["la sirenita","the little mermaid","sirenita"] },
  { e:"🐻🔴🧧", a:["red","turning red","red panda"] },
  { e:"🕯️🏠🎶", a:["encanto"] },
  { e:"🐜🏰🦗", a:["bichos","a bugs life","antz","bichos una aventura en miniatura"] },
  { e:"👊🐱🥷", a:["el gato con botas","puss in boots","gato con botas"] },
  { e:"🧛🦇🏰", a:["hotel transylvania","hotel transilvania"] },
  { e:"🐍📿🐒", a:["kunfú panda 2","kung fu panda 2","kung fu panda2","kungfu panda 2"] }
];

// --- Utilidades ---
const normalize = (s) => s
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'') // sin tildes
  .replace(/[^a-z0-9\s]/g,'') // sin signos
  .replace(/\b(el|la|los|las|de|del|the|and|y)\b/g,'') // sin artículos comunes
  .replace(/\s+/g,' ') // espacios simples
  .trim();

const vibrate = (ms) => { if (navigator.vibrate) navigator.vibrate(ms) };

// --- Estado del juego ---
const ROUNDS = 10; // rondas por partida
let pool = []; // preguntas aleatorias para la partida
let currentIndex = 0;
let score = 0;
let lives = 3;
let showedHint = false;

// --- Elementos ---
const $ = (id) => document.getElementById(id);
const emojiBox = $("emojiBox");
const answer = $("answer");
const scoreEl = $("score");
const bestEl = $("bestScore");
const roundEl = $("round");
const totalEl = $("total");
const livesEl = $("lives");
const feedback = $("feedback");
const btnCheck = $("btnCheck");
const btnNext = $("btnNext");
const btnSkip = $("btnSkip");
const btnHint = $("btnHint");

// --- Inicio ---
function newGame(){
  // récord guardado
  bestEl.textContent = localStorage.getItem('bestEmojiPelis') || 0;
  // seleccionar ROUNDS aleatorias sin repetir
  pool = [...MOVIES].sort(()=> Math.random()-0.5).slice(0, ROUNDS);
  currentIndex = 0; score = 0; lives = 3; showedHint = false;
  totalEl.textContent = ROUNDS;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  roundEl.textContent = 1;
  feedback.textContent = '';
  btnNext.style.display = 'none';
  btnCheck.disabled = false;
  setQuestion();
}

function setQuestion(){
  const q = pool[currentIndex];
  emojiBox.textContent = q.e;
  answer.value = '';
  answer.focus();
  feedback.innerHTML = '';
  showedHint = false;
}

function check(){
  const q = pool[currentIndex];
  const user = normalize(answer.value);
  const correct = q.a.map(normalize).some(a => a === user);
  if(correct){
    score += showedHint ? 5 : 10; // con pista vale menos
    scoreEl.textContent = score;
    feedback.innerHTML = `<span class="ok">✅ ¡Correcto!</span> <span class=\"small\">(${q.a[0]})</span>`;
    vibrate(40);
    btnNext.style.display = 'inline-block';
    btnCheck.disabled = true;
  } else {
    lives -= 1; livesEl.textContent = lives;
    feedback.innerHTML = `<span class="bad">❌ Incorrecto</span> <span class=\"small\">¡Intenta otra vez!</span>`;
    vibrate([20,40,20]);
    if(lives <= 0){ endGame(false); }
  }
}

function next(){
  currentIndex++;
  if(currentIndex >= pool.length){ endGame(true); return; }
  roundEl.textContent = currentIndex+1;
  btnNext.style.display = 'none';
  btnCheck.disabled = false;
  setQuestion();
}

function skip(){
  feedback.innerHTML = `<span class=\"small\">⏭️ Saltaste. Era: <strong>${pool[currentIndex].a[0]}</strong></span>`;
  btnNext.style.display = 'inline-block';
  btnCheck.disabled = true;
  vibrate(15);
}

function hint(){
  const ans = pool[currentIndex].a[0];
  const first = ans[0].toUpperCase();
  const len = ans.length;
  feedback.innerHTML = `<span class=\"hint\">💡 Pista:</span> empieza por <strong>${first}</strong> y tiene <strong>${len}</strong> caracteres (incluye espacios).`;
  showedHint = true;
  vibrate(10);
}

function endGame(completed){
  answer.blur();
  btnCheck.disabled = true;
  btnNext.style.display = 'inline-block';
  btnNext.textContent = 'Jugar otra vez';
  btnNext.onclick = ()=>{ btnNext.textContent='Siguiente'; btnNext.onclick=next; newGame(); };
  const best = parseInt(localStorage.getItem('bestEmojiPelis')||'0');
  if(score > best){ localStorage.setItem('bestEmojiPelis', String(score)); bestEl.textContent = score; }
  feedback.innerHTML = completed
    ? `<span class=\"ok\">🎉 ¡Terminaste!</span> Puntuación final: <strong>${score}</strong>.`
    : `<span class=\"bad\">💥 Sin vidas</span> Puntuación: <strong>${score}</strong>.`;
}

// Eventos
btnCheck.addEventListener('click', check);
btnNext.addEventListener('click', next);
btnSkip.addEventListener('click', skip);
btnHint.addEventListener('click', hint);
answer.addEventListener('keyup', (e)=>{ if(e.key==='Enter') check(); });

// Lanzar juego
newGame();