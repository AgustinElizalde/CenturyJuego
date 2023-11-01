let fondo;
let nave;
let disparos = [];
const cadencia = 150;
let ultimoDisparo = 0;
let enemigos = [];
let disparosEnemigos = [];
const enemyShips = [
  'assets/enemyShip1.png',
  'assets/enemyShip2.png',
  'assets/enemyShip3.png',
  'assets/enemyShip4.png'
];

const naveRadio = 15;
const disparoRadio = 15;

const canvasX = window.innerWidth;
const canvasY = window.innerHeight;

let vidaJugador = 500; 
let barraVidaAncho = 2 * naveRadio;
let barraVidaAlto = 10;

let puntaje = 0; //puntaje (ooo)

let gameOver = false;
let reiniciarBoton;
let menuBoton;

function preload() {
  fondo = loadImage('assets/fondo.jpg');
}

function Nave() {
  this.posicion = createVector(canvasX / 2, canvasY - 200);
  this.asset = loadImage('assets/spaceship1.png');
  this.direccion = createVector(1, 0);
  this.rotacion = 0;
  this.velocidad = createVector(0, 0);

  this.movimiento = function () {
    this.posicion.add(this.velocidad);
    this.velocidad.mult(0.99);

    if (this.posicion.x < 0) {
      this.posicion.x = 0;
      this.velocidad.x = 0;
    } else if (this.posicion.x > canvasX) {
      this.posicion.x = canvasX;
      this.velocidad.x = 0;
    }
    if (this.posicion.y < 0) {
      this.posicion.y = 0;
      this.velocidad.y = 0;
    } else if (this.posicion.y > canvasY) {
      this.posicion.y = canvasY;
      this.velocidad.y = 0;
    }
  }

  this.aceleracion = function () {
    let acc = p5.Vector.fromAngle(this.direccion.heading() + PI / 2);
    this.velocidad.add(acc.mult(-0.08));
  }

  this.draw = function () {
    push();
    translate(this.posicion.x, this.posicion.y);
    rotate(this.direccion.heading());
    imageMode(CENTER);
    image(this.asset, 0, 0, 50, 50);
    pop();
  };

  this.setRotacion = function (angulo) {
    this.rotacion = angulo;
  };

  this.giro = function () {
    this.direccion.rotate(this.rotacion);
  };
}

function disparo(navePos, naveDir) {
  this.pos = createVector(navePos.x, navePos.y);
  this.vel = p5.Vector.fromAngle(naveDir.heading() - PI / 2);
  this.vel.mult(15);
  this.direcion = naveDir.heading();
  this.asset = loadImage('assets/bullet.png');

  this.move = function () {
    this.pos.add(this.vel);
  }

  this.draw = function () {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.direcion + PI / 2);
    imageMode(CENTER);
    image(this.asset, 0, 0, 50, 50);
    pop();
  }
}

//---------- Naves Enemigas ----------//

function NaveEnemiga(naveJugador) {
  let spawnX, spawnY;
  if (random() < 0.5) {
    spawnX = random(canvasX);
    spawnY = random() < 0.5 ? -50 : canvasY + 50;
  } else {
    spawnX = random() < 0.5 ? -50 : canvasX + 50;
    spawnY = random(canvasY);
  }

  this.posicion = createVector(spawnX, spawnY);

  // Calcula la dirección hacia el jugador
  this.direccionJugador = p5.Vector.sub(naveJugador.posicion, this.posicion).normalize();

  // Dirección de movimiento aleatorio
  this.direccionAleatoria = p5.Vector.random2D();

  this.velocidad = p5.Vector.random2D(); //velocidad de movimiento
  this.asset = loadImage(random(enemyShips)); //carga una textura diferente para cada enemigo

  this.movimiento = function () {
    // Mueve la nave en dirección aleatoria por la pantalla
    this.posicion.add(p5.Vector.mult(this.direccionAleatoria, 2));

    // Ajusta la dirección hacia el jugador
    this.direccionJugador = p5.Vector.sub(naveJugador.posicion, this.posicion).normalize();
  }

  this.vidas = 3;

  this.cadenciaEnemiga = 500;
  this.ultimoDisparoEnemigo = 0;

  this.disparo = function () {
    // Verifica si la nave enemiga se encuentra dentro de los límites de la pantalla del jugador
    if (
      this.posicion.x > 0 &&
      this.posicion.x < canvasX &&
      this.posicion.y > 0 &&
      this.posicion.y < canvasY
    ) {
      // Verifica si ha pasado suficiente tiempo desde el último disparo
      if (millis() - this.ultimoDisparoEnemigo > this.cadenciaEnemiga) {
        // Crea un nuevo disparo
        disparosEnemigos.push(new disparoEnemigo(this.posicion, this.direccionJugador));
        this.ultimoDisparoEnemigo = millis(); // Actualiza el tiempo del último disparo
      }
    }
  };

  this.draw = function () {
    push();
    translate(this.posicion.x, this.posicion.y);
    rotate(this.direccionJugador.heading() + PI / 2); // Mira hacia el jugador
    imageMode(CENTER);
    image(this.asset, 0, 0, 50, 50);
    pop();
  };
}

//---------- Disparo Enemigo ----------//

function disparoEnemigo(navePos, naveDir) {
  this.pos = createVector(navePos.x, navePos.y);
  this.vel = p5.Vector.fromAngle(naveDir.heading());
  this.vel.mult(15);
  this.direcion = naveDir.heading();
  this.asset = loadImage('assets/enemyBullet.png');

  this.move = function () {
    this.pos.add(this.vel);
  }

  this.draw = function () {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.direcion - PI);
    imageMode(CENTER);
    image(this.asset, 0, 0, 50, 50);
    pop();
  }
}

//---------- Colisiones ----------//

function colision(disparo, nave) {
  const d = dist(disparo.pos.x, disparo.pos.y, nave.posicion.x, nave.posicion.y);
  if (d < naveRadio + disparoRadio) {
    // Reducir una vida al enemigo cuando hay colisión
    nave.vidas -= 1;
    return true;
  }
  return false;
}

//---------- Setup ----------//

function setup() {
  createCanvas(canvasX, canvasY);
  frameRate(60);

  nave = new Nave();

  //generación de enemigos
  for (let i = 0; i < 10; i++) {
    enemigos.push(new NaveEnemiga(nave));
  }
  
  reiniciarBoton = createButton('Volver a intentarlo');
  menuBoton = createButton('Volver al menú');

  reiniciarBoton.class('boton-juego');
  menuBoton.class('boton-juego');

  // Calcula la posición en el centro de la pantalla
  let centroX = canvasX / 2;
  let centroY = canvasY / 2;

  // Establecer posiciones de los botones y márgenes entre ellos
  let margenEntreBotones = 40;
  let botonAncho = 200; // Ancho de los botones

  reiniciarBoton.position(centroX - botonAncho / 2, centroY + 50);
  menuBoton.position(centroX - botonAncho / 2, centroY + 50 + reiniciarBoton.height + margenEntreBotones);

  reiniciarBoton.mousePressed(reiniciar);
  menuBoton.mousePressed(volverAlMenu);

  reiniciarBoton.hide();
  menuBoton.hide();
}

function draw() {
  background(fondo);

  if (!gameOver) {
    nave.draw();
    nave.giro();
    nave.movimiento();
    
    textSize(24);
    fill(255);
    text(`Puntaje: ${puntaje}`, 20, 40);

    if (keyIsDown(87)) {
      nave.aceleracion();
    }

    if (keyIsDown(65)) {
      nave.setRotacion(-0.08);
    } else if (keyIsDown(68)) {
      nave.setRotacion(0.08);
    } else {
      nave.setRotacion(0);
    }

    if (keyIsDown(32) && millis() - ultimoDisparo > cadencia) {
      disparos.push(new disparo(nave.posicion, nave.direccion));
      ultimoDisparo = millis();
    }

    for (let i = 0; i < disparos.length; i++) {
      disparos[i].draw();
      disparos[i].move();
    }

    for (let i = disparos.length - 1; i >= 0; i--) {
      const disparo = disparos[i];
      for (let j = enemigos.length - 1; j >= 0; j--) {
        const enemigo = enemigos[j];
        if (colision(disparo, enemigo)) {
          disparos.splice(i, 1);
          if (enemigo.vidas <= 0) {
            enemigos.splice(j, 1);
            puntaje += 100;
            if (vidaJugador <= 250) {
              vidaJugador = min(500, vidaJugador + 25);
            }
          }
          break;
        }
      }
    }

    for (let i = 0; i < disparosEnemigos.length; i++) {
      disparosEnemigos[i].draw();
      disparosEnemigos[i].move();
    }

    for (let i = disparosEnemigos.length - 1; i >= 0; i--) {
      const disparoEnemigo = disparosEnemigos[i];
      if (colision(disparoEnemigo, nave)) {
        disparosEnemigos.splice(i, 1);
        vidaJugador -= 10;
        vidaJugador = max(0, vidaJugador);
        
       if (vidaJugador <= 0) {
          gameOver = true;
        }
      }
    }

    for (let i = 0; i < enemigos.length; i++) {
      enemigos[i].draw();
      enemigos[i].movimiento();
      enemigos[i].disparo();
    }

    if (frameCount % 60 == 0) {
      enemigos.push(new NaveEnemiga(nave));
    }

    if (enemigos.length > 25) {
      enemigos.splice(0, 1);
    }

    push();
    translate(nave.posicion.x - barraVidaAncho / 2, nave.posicion.y + naveRadio + 10);
  
    fill(255, 0, 0);
    rect(0, 0, barraVidaAncho, barraVidaAlto);
  
    fill(0, 255, 0);
    let barraVidaActual = map(vidaJugador, 0, 500, 0, barraVidaAncho);
    rect(0, 0, barraVidaActual, barraVidaAlto);
    pop();
    
  } else {
    textSize(32);
    fill(255);
    textAlign(CENTER);
    text('Fin del Juego', canvasX / 2, canvasY / 2 - 50);

    textSize(24);
    textAlign(CENTER);
    text(`Puntaje: ${puntaje}`, canvasX / 2, canvasY / 2);

    reiniciarBoton.show();
    menuBoton.show();
  }

}

function reiniciar() {
  gameOver = false;
  vidaJugador = 500;
  puntaje = 0;
  reiniciarBoton.hide();
  menuBoton.hide();
  enemigos = [];
  disparos = []; // Elimina los disparos del jugador
  disparosEnemigos = []; // Elimina los disparos de los enemigos
  
  // Restablece la posición del jugador
  nave = new Nave();

  for (let i = 0; i < 12; i++) {
      enemigos.push(new NaveEnemiga(nave));
  }

}

function volverAlMenu() {

}
