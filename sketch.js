let carroX = 400;
let carroDirecao = 1;
let carroVelocidade = 0;
let carroAcelerando = false;

let lenhaCarro = 5; // quantidade inicial de lenha carregada
let lenhaCidade = [];

let nuvens = [
  { x: 50, y: 60 },
  { x: 150, y: 100 },
  { x: 250, y: 70 }
];
let arvoresExtras = [];

let tempoDoDia = 0; // 0 a 1 (0 = dia, 1 = noite)
let semaforoEstado = "verde";
let trafegoX = 800;

// Constante para definir os prédios
const predios = [
  { x: 420, y: 200, w: 80, h: 200, chamine: false },
  { x: 520, y: 250, w: 60, h: 150, chamine: false },
  { x: 600, y: 180, w: 70, h: 220, chamine: true },
  { x: 700, y: 230, w: 60, h: 170, chamine: false }
];

function setup() {
  createCanvas(800, 400);
}

function draw() {
  background(200);

  // Dividir tela entre campo e cidade
  stroke(0);
  line(width / 2, 0, width / 2, height);

  drawCampo();
  drawCidade();

  // Checa se o carro chegou na cidade para descarregar lenha
  if (carroX >= width - 50 && lenhaCarro > 0) {
    lenhaCarro = 0;
    lenhaCidade.push({ x: width - 80, y: height - 70 });
  }

  // Atualiza posição e desenho do carro
  drawCarro();

  // Desaceleração automática
  if (!carroAcelerando) {
    carroVelocidade *= 0.95;
    if (abs(carroVelocidade) < 0.1) {
      carroVelocidade = 0;
    }
  }

  atualizarTempo();
}

function drawCarro() {
  carroX += carroVelocidade * carroDirecao;
  carroX = constrain(carroX, width / 2, width - 40);

  push();
  if (carroDirecao === -1) {
    translate(carroX + 40, 0);
    scale(-1, 1);
  }

  fill(255, 0, 0);
  rect(carroDirecao === -1 ? 0 : carroX, height - 70, 40, 20);

  // Desenhar rodas
  fill(0);
  ellipse((carroDirecao === -1 ? 0 : carroX) + 10, height - 50, 10, 10);
  ellipse((carroDirecao === -1 ? 0 : carroX) + 30, height - 50, 10, 10);

  // Desenhar lenha no carro (um monte de retângulos pequenos)
  fill(139, 69, 19);
  let baseX = carroDirecao === -1 ? 5 : (carroX + 5);
  let baseY = height - 80;
  for (let i = 0; i < lenhaCarro; i++) {
    rect(baseX + i * 6, baseY - i * 4, 10, 4);
  }

  pop();
}

function drawCidade() {
  noStroke();

  // Céu dinâmico: do dia para a noite
  const skyR = lerp(135, 20, tempoDoDia);
  const skyG = lerp(206, 24, tempoDoDia);
  const skyB = lerp(235, 72, tempoDoDia);
  fill(skyR, skyG, skyB);
  rect(width / 2, 0, width / 2, height);

  // Sol / Lua com movimento suave
  const sunMoonX = width - 100;
  let currentSunMoonY;
  // Variável para armazenar a cor do sol/lua
  let sunMoonColor; 

  if (tempoDoDia < 0.5) {
    currentSunMoonY = map(tempoDoDia, 0, 0.5, height - 300, 80);
    sunMoonColor = color(255, 204, 0); // Cor do sol (amarelo)
    fill(sunMoonColor); 
    ellipse(sunMoonX, currentSunMoonY, 60, 60);
  } else {
    currentSunMoonY = map(tempoDoDia, 0.5, 1, 80, height - 300);
    sunMoonColor = color(255, 255, 224); // Cor da lua (quase branco)
    fill(sunMoonColor); 
    ellipse(sunMoonX, currentSunMoonY, 50, 50);
  }

  // Semáforo
  drawSemaforo(770, height - 140);

  // Poluição: escurece conforme anoitece
  const poluicaoCor = lerp(105, 40, tempoDoDia);
  fill(poluicaoCor, poluicaoCor, poluicaoCor, 100);
  ellipse(650, 80, 100, 50);

  // Fumaça com transparência variável para suavizar o efeito
  const fumacaAlpha = lerp(150, 70, tempoDoDia);
  drawFumaca(600, 180, fumacaAlpha);

  // Desenho dos prédios com janelas e chaminés
  // Passamos a cor do sol/lua para drawPredioAnimado
  predios.forEach((p, i) => drawPredioAnimado(p.x, p.y, p.w, p.h, i, p.chamine, sunMoonColor));

  // Rua da cidade
  fill(50);
  rect(width / 2, height - 50, width / 2, 50);

  // Tráfego ao fundo
  drawCarroFundo();

  // Lenha empilhada na cidade
  fill(139, 69, 19);
  for (let lenha of lenhaCidade) {
    for (let i = 0; i < 5; i++) {
      rect(lenha.x + i * 12, lenha.y - i * 6, 10, 6);
    }
  }
}

function drawCampo() {
  noStroke();
  // Céu do campo
  fill(135, 206, 235);
  rect(0, 0, width / 2, height);

  // Grama
  fill(34, 139, 34);
  rect(0, height - 50, width / 2, 50);

  // Árvores simples
  fill(139, 69, 19);
  rect(100, height - 100, 20, 50);
  fill(0, 100, 0);
  ellipse(110, height - 110, 60, 60);

  // Nuvens
  fill(255);
  for (let n of nuvens) {
    ellipse(n.x, n.y, 50, 30);
    ellipse(n.x + 20, n.y + 10, 50, 30);
    ellipse(n.x - 20, n.y + 10, 50, 30);
  }
}

function drawSemaforo(x, y) {
  // Corpo do semáforo
  fill(50);
  rect(x, y, 20, 60, 5);

  const isNight = tempoDoDia > 0.5;

  // Luz Vermelha
  fill(!isNight && semaforoEstado === "vermelho" ? 'red' : 'darkred');
  ellipse(x + 10, y + 15, 15, 15);

  // Luz Amarela
  fill(isNight ? 'yellow' : (semaforoEstado === "amarelo" ? 'yellow' : 'darkgoldenrod'));
  ellipse(x + 10, y + 30, 15, 15);

  // Luz Verde
  fill(!isNight && semaforoEstado === "verde" ? 'green' : 'darkgreen');
  ellipse(x + 10, y + 45, 15, 15);
}

function drawFumaca(x, y, alpha = 150) {
  noStroke();
  fill(200, 200, 200, alpha);
  for (let i = 0; i < 5; i++) {
    let offsetX = i * 10 + random(-3, 3);
    let offsetY = y - i * 20 + random(-5, 5);
    let sizeX = random(25, 35);
    let sizeY = random(15, 25);
    ellipse(x + offsetX, offsetY, sizeX, sizeY);
  }
}

function drawPredioAnimado(x, y, w, h, idx, chamine, sunMoonColor) {
  // Cor base do prédio (o corpo do prédio)
  if (red(sunMoonColor) === 255 && green(sunMoonColor) === 255 && blue(sunMoonColor) === 224) {
    // Se o círculo for branco/lua (noite)
    fill('yellow'); // Prédio fica amarelo
  } else if (red(sunMoonColor) === 255 && green(sunMoonColor) === 204 && blue(sunMoonColor) === 0) {
    // Se o círculo for amarelo/sol (dia)
    fill('black'); // Prédio fica preto
  } else {
    // Transições: mantém a cor padrão de lerp (cinza claro/escuro)
    const baseGray = lerp(180, 50, tempoDoDia);
    fill(baseGray);
  }
  rect(x, y, w, h); // Desenha o corpo do prédio com a cor definida

  // Lógica das Janelas: Esta lógica continua a ser baseada APENAS em tempoDoDia
  let chanceLuzAcesa;

  if (tempoDoDia < 0.2 || tempoDoDia > 0.8) { // Noite profunda (janelas acesas)
    chanceLuzAcesa = 0.9; 
  } else if (tempoDoDia > 0.4 && tempoDoDia < 0.6) { // Meio do dia (janelas apagadas)
    chanceLuzAcesa = 0.05; 
  } else { // Transição (amanhecer/entardecer)
    chanceLuzAcesa = map(tempoDoDia, 0.2, 0.8, 0.9, 0.05);
  }

  const cols = 4;
  const rows = 6;
  const janelaW = w / cols;
  const janelaH = h / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = (idx * 1000) + (r * 100) + c;
      const noiseValue = noise((frameCount * 0.05) + seed);

      if (noiseValue < chanceLuzAcesa) {
        fill('yellow'); // Janela acesa
      } else {
        fill('black'); // Janela apagada (cor do prédio base, se não houver luz)
      }
      rect(x + c * janelaW + 2, y + r * janelaH + 2, janelaW - 4, janelaH - 4);
    }
  }

  // Chaminé com cor variável conforme a cor do prédio
  if (chamine) {
    // Pega a cor do pixel do prédio (aproximadamente) para a chaminé corresponder
    fill(get(x + w - 10, y - 10)); 
    rect(x + w - 20, y - 40, 15, 40);
  }
}

function drawCarroFundo() {
  fill(0, 0, 255);
  trafegoX -= 2;
  if (trafegoX < width / 2) trafegoX = width;
  rect(trafegoX, height - 60, 30, 15);
  ellipse(trafegoX + 5, height - 45, 10, 10);
  ellipse(trafegoX + 25, height - 45, 10, 10);
}

function atualizarTempo() {
  tempoDoDia += 0.001;
  if (tempoDoDia > 1) tempoDoDia = 0;
}