// Jogo da Fazenda Sustentável - p5.js 1.9.0

// Variáveis do jogo
let fase = 0; // 0 = menu, 1 = plantio, 2 = transporte, 3 = feira, 4 = bônus quiz
let alimentos = [];
let obstacles = [];
let items = [];
let score = 0;
let vidas = 3;
let tempo = 70; // segundos para fase transporte
let jogoParado = false;

let truck;

let somAtivo = true;

let moveUp = false;
let moveDown = false;

let timerActive = false;

let collectSound, crashSound, clickSound;

const perguntasQuiz = [
  {
    pergunta: "De onde vêm os alimentos que consumimos?",
    opcoes: ["Da fazenda", "Do mercado", "Da internet", "Do lixo"],
    resposta: 0
  },
  {
    pergunta: "O que é importante fazer para preservar o meio ambiente?",
    opcoes: ["Desperdiçar água", "Reciclar e economizar água", "Poluir rios", "Queimar lixo"],
    resposta: 1
  },
  {
    pergunta: "Qual é o principal meio de transporte dos alimentos do campo para a cidade?",
    opcoes: ["Carro de passeio", "Caminhão", "Bicicleta", "Barco"],
    resposta: 1
  }
];
let quizIndex = 0;
let acertos = 0;

let canvas;
let soundToggleBtn;

function preload() {
  // Sons simples com osciladores p5
  collectSound = new p5.Oscillator('triangle');
  crashSound = new p5.Oscillator('sine');
  clickSound = new p5.Oscillator('square');
}

function setup() {
  // Cria canvas e esconde até iniciar
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'none');

  // Botão som - pega do HTML e adiciona evento
  soundToggleBtn = document.getElementById('soundToggleButton');
  soundToggleBtn.addEventListener('click', toggleSound);

  // Botão iniciar jogo no menu
  document.getElementById('startButton').addEventListener('click', startGame);

  // Controles toque celular - adiciona eventos de toque e mouse
  const upBtn = document.getElementById('upButton');
  const downBtn = document.getElementById('downButton');

  upBtn.addEventListener('touchstart', () => moveUp = true);
  upBtn.addEventListener('touchend', () => moveUp = false);
  upBtn.addEventListener('mousedown', () => moveUp = true);
  upBtn.addEventListener('mouseup', () => moveUp = false);

  downBtn.addEventListener('touchstart', () => moveDown = true);
  downBtn.addEventListener('touchend', () => moveDown = false);
  downBtn.addEventListener('mousedown', () => moveDown = true);
  downBtn.addEventListener('mouseup', () => moveDown = false);

  textAlign(CENTER, CENTER);
  resetGame();
}

function resetGame() {
  // Reseta variáveis e estado do jogo
  fase = 0;
  score = 0;
  vidas = 3;
  tempo = 70;
  alimentos = [];
  obstacles = [];
  items = [];
  jogoParado = false;
  moveUp = false;
  moveDown = false;
  quizIndex = 0;
  acertos = 0;

  truck = {
    x: 100,
    y: height / 2,
    width: 80,
    height: 40,
    speed: 3
  };

  noLoop();
  canvas.style('display', 'none');

  // Mostrar menu e esconder controles e som
  document.getElementById('menu').style.display = 'flex';
  document.getElementById('touchControls').classList.add('hidden');
  soundToggleBtn.style.display = 'none';
}

function startGame() {
  // Começa o jogo: reseta variáveis, esconde menu, mostra canvas e controles
  fase = 1;
  alimentos = [];
  obstacles = [];
  items = [];
  score = 0;
  vidas = 3;
  tempo = 70;
  jogoParado = false;
  truck = {
    x: 100,
    y: height / 2,
    width: 80,
    height: 40,
    speed: 3
  };

  loop();

  document.getElementById('menu').style.display = 'none';
  canvas.style('display', 'block');
  soundToggleBtn.style.display = 'block';

  const touchControls = document.getElementById('touchControls');
  touchControls.classList.add('hidden');

  timerActive = true;
}

function draw() {
  background(220);

  switch (fase) {
    case 0: drawMenu(); break;
    case 1: drawPlantingPhase(); break;
    case 2: drawTransportPhase(); break;
    case 3: drawFairPhase(); break;
    case 4: drawBonusPhase(); break;
  }

  if (fase > 0 && fase < 4) drawHUD();

  // Mostra controles só na fase transporte
  const touchControls = document.getElementById('touchControls');
  if(fase === 2) {
    touchControls.classList.remove('hidden');
  } else {
    touchControls.classList.add('hidden');
  }

  if (jogoParado) {
    textSize(48);
    fill(255, 0, 0);
    text('GAME OVER', width / 2, height / 2);
    textSize(24);
    fill(0);
    text('Clique para reiniciar', width / 2, height / 2 + 60);
  }
}

function drawMenu() {
  // Menu fica gerenciado no HTML, nada a desenhar aqui
}

function drawPlantingPhase() {
  background(139, 176, 75);
  fill(70, 150, 70);
  textSize(32);
  textAlign(LEFT, TOP);
  text('🌾 Fase 1: Plantio no Campo', 20, 20);
  textSize(20);
  text('Clique na tela para plantar! (Min: 5 alimentos)', 20, 60);
  text(`🌱 Plantados: ${alimentos.length}`, 20, 90);

  alimentos.forEach(f => {
    fill(34, 139, 34);
    ellipse(f.x, f.y, 30, 30);
  });

  if (alimentos.length >= 5) {
    setTimeout(() => {
      fase = 2;
      timerActive = true;
      alimentos = [];
    }, 1000);
  }
}

function drawTransportPhase() {
  background(100, 149, 237);

  // Controle por teclado ou botões toque
  if (moveUp) truck.y -= 5;
  if (moveDown) truck.y += 5;

  truck.y = constrain(truck.y, 0, height - truck.height);

  truck.x += truck.speed;

  // Desenha caminhão
  fill(150, 75, 0);
  rect(truck.x, truck.y, truck.width, truck.height);

  // Cria obstáculos e itens
  if (frameCount % 90 === 0) {
    obstacles.push({
      x: width,
      y: random(height * 0.2, height * 0.8),
      size: 50,
      speed: truck.speed * 1.5
    });
  }

  if (frameCount % 150 === 0) {
    items.push({
      x: width,
      y: random(height * 0.2, height * 0.8),
      size: 30,
      speed: truck.speed
    });
  }

  // Atualiza e desenha obstáculos
  obstacles.forEach((obs, i) => {
    obs.x -= obs.speed;
    fill(200, 50, 50);
    rect(obs.x, obs.y, obs.size, obs.size);

    if (checkCollision(truck, obs)) {
      playOneShot(crashSound, 220);
      obstacles.splice(i, 1);
      vidas--;
      if (vidas <= 0) gameOver();
    }

    if (obs.x + obs.size < 0) {
      obstacles.splice(i, 1);
      score += 5;
    }
  });

  // Atualiza e desenha itens coletáveis
  items.forEach((item, i) => {
    item.x -= item.speed;
    fill(255, 215, 0);
    ellipse(item.x, item.y, item.size);

    if (checkCollision(truck, item)) {
      playOneShot(collectSound, 440);
      items.splice(i, 1);
      score += 10;
    }
  });

  // Atualiza o tempo e barra de tempo
  if (timerActive) {
    tempo -= deltaTime / 1000;
    if (tempo <= 0) {
      tempo = 0;
      gameOver();
    }
  }

  // Avança para próxima fase
  if (truck.x >= width) {
    timerActive = false;
    fase = 3;
  }
}

function drawFairPhase() {
  background(255, 215, 0);
  textSize(32);
  fill(0);
  textAlign(CENTER, CENTER);
  text('🛒 Fase 3: Feira na Cidade', width / 2, height / 2 - 80);
  textSize(20);
  text(`Produtos vendidos! Pontuação final: ${score}`, width / 2, height / 2 - 40);

  setTimeout(() => {
    fase = 4;
  }, 4000);
}

function drawBonusPhase() {
  background(180);
  textSize(28);
  fill(0);
  textAlign(CENTER, CENTER);
  text('♻️ Fase Bônus: Quiz Sustentável', width / 2, 50);

  if (quizIndex < perguntasQuiz.length) {
    let q = perguntasQuiz[quizIndex];
    textSize(22);
    text(q.pergunta, width / 2, 120);

    for (let i = 0; i < q.opcoes.length; i++) {
      let x = width / 2;
      let y = 180 + i * 50;
      fill(100, 180, 100);
      rect(x - 120, y - 25, 240, 40, 10);

      fill(0);
      textSize(18);
      text(q.opcoes[i], x, y);
    }

    textSize(16);
    fill(80);
    text('Clique na resposta correta', width / 2, height - 40);
  } else {
    textSize(24);
    fill(50, 150, 50);
    text(`Parabéns! Você acertou ${acertos} de ${perguntasQuiz.length}`, width / 2, height / 2);
    text('Recarregue para jogar novamente', width / 2, height / 2 + 50);
    noLoop();
  }
}

function drawHUD() {
  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);
  text(`Pontuação: ${score}`, 20, 20);
  text(`Vidas: ${vidas}`, 20, 50);

  if (fase === 2) {
    // Barra de tempo
    let barWidth = 200;
    let timePercent = tempo / 70;
    fill(200);
    rect(width - barWidth - 20, 20, barWidth, 20);
    fill(50, 200, 50);
    rect(width - barWidth - 20, 20, barWidth * timePercent, 20);
    fill(0);
    textAlign(CENTER, TOP);
    text('Tempo', width - barWidth / 2 - 20, 45);
  }
}

// Checa colisão retangular simples
function checkCollision(a, b) {
  let aw = a.width || 30;
  let ah = a.height || 30;
  let bw = b.size || 30;
  let bh = b.size || 30;

  return a.x < b.x + bw &&
         a.x + aw > b.x &&
         a.y < b.y + bh &&
         a.y + ah > b.y;
}

// Evento mouse para plantar alimentos e quiz para responder
function mousePressed() {
  if (jogoParado) {
    resetGame();
    return;
  }

  if (fase === 1) {
    alimentos.push({ x: mouseX, y: mouseY });
    playOneShot(collectSound, 440);
  } else if (fase === 4) {
    // Detecta clique na resposta do quiz
    let q = perguntasQuiz[quizIndex];
    for (let i = 0; i < q.opcoes.length; i++) {
      let x1 = width / 2 - 120;
      let y1 = 180 + i * 50 - 25;
      let x2 = x1 + 240;
      let y2 = y1 + 40;
      if (mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2) {
        if (i === q.resposta) {
          acertos++;
          playOneShot(collectSound, 660);
        } else {
          playOneShot(crashSound, 220);
        }
        quizIndex++;
      }
    }
  }
}

// Evento teclado para mover caminhão
function keyPressed() {
  if (fase === 2) {
    if (keyCode === UP_ARROW) moveUp = true;
    if (keyCode === DOWN_ARROW) moveDown = true;
  }
}

function keyReleased() {
  if (fase === 2) {
    if (keyCode === UP_ARROW) moveUp = false;
    if (keyCode === DOWN_ARROW) moveDown = false;
  }
}

// Função para ativar/desativar som
function toggleSound() {
  somAtivo = !somAtivo;
  soundToggleBtn.innerHTML = somAtivo ? '🔊' : '🔇';
}

// Função para tocar sons curtos com oscilador
function playOneShot(osc, freq) {
  if (!somAtivo) return;
  osc.freq(freq);
  osc.start();
  setTimeout(() => osc.stop(), 100);
}

function gameOver() {
  jogoParado = true;
  timerActive = false;
  noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
