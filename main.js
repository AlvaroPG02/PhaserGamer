var juego = new Phaser.Game(370, 550, Phaser.AUTO, 'bloque_juego');

// Variables globales para el juego
var fondoJuego;
var jugador;
var enemigos;
var cursors;
var teclaA;
var teclaD;
var puntuacion = 0;
var tiempoInicio = 0;
var textoPuntuacion;
var juegoTerminado = false;
var textoGameOver;
var botonReiniciar;
var temporizadorEnemigos;
var musica;

var estadoPrincipal = {
    preload: function() {
        juego.load.image('fondo', 'Assets/Fondo.png');
        juego.load.image('btn', 'Assets/btn.png');
        juego.load.spritesheet('personaje', 'Assets/Caminar.png', 64, 128, 2);        
        juego.load.audio('musica', ['Assets/musicafondo.mp3', 'Assets/music.ogg']);    },

    create: function() {
        juego.physics.startSystem(Phaser.Physics.ARCADE);

        fondoJuego = juego.add.tileSprite(0, 0, 370, 550, 'fondo');
        var fondoImg = juego.cache.getImage('fondo');
        if (fondoImg) {
            fondoJuego.tileScale.setTo(370 / fondoImg.width, 550 / fondoImg.height);
        }

        enemigos = juego.add.group();
        enemigos.enableBody = true;

        jugador = juego.add.sprite(320, 460, 'personaje', 0);
        jugador.anchor.setTo(0.5);
        jugador.scale.setTo(0.7, 0.7);
        jugador.animations.add('caminar', [0, 1], 6, true);
        juego.physics.arcade.enable(jugador);
        jugador.body.collideWorldBounds = true;
        jugador.body.immovable = true;

        cursors = juego.input.keyboard.createCursorKeys();
        teclaA = juego.input.keyboard.addKey(Phaser.Keyboard.A);
        teclaD = juego.input.keyboard.addKey(Phaser.Keyboard.D);

        textoPuntuacion = juego.add.text(20, 20, 'Puntos: 0', { font: '20px Arial', fill: '#ffffff' });
        tiempoInicio = juego.time.now;

        musica = juego.add.audio('musica', 0.6, true);
        musica.play();

        temporizadorEnemigos = juego.time.events.loop(900, this.generarEnemigo, this);
    },

    update: function() {
        fondoJuego.tilePosition.x -= 2;

        if (juegoTerminado) {
            return;
        }

        jugador.body.velocity.x = 0;

        if (cursors.left.isDown || teclaA.isDown) {
            jugador.body.velocity.x = -250;
            jugador.animations.play('caminar');
            jugador.scale.x = -1;
        } else if (cursors.right.isDown || teclaD.isDown) {
            jugador.body.velocity.x = 250;
            jugador.animations.play('caminar');
            jugador.scale.x = 1;
        } else {
            jugador.animations.stop();
            jugador.frame = 0;
        }

        juego.physics.arcade.overlap(jugador, enemigos, this.gameOver, null, this);

        puntuacion = Math.floor((juego.time.now - tiempoInicio) / 1000);
        textoPuntuacion.text = 'Puntos: ' + puntuacion;

        enemigos.forEachAlive(function(enemigo) {
            if (enemigo.y > 560 || enemigo.x < -enemigo.width || enemigo.x > 370 + enemigo.width) {
                enemigo.kill();
            }
        }, this);
    },

    generarEnemigo: function() {
        var ancho = 30 + Math.floor(Math.random() * 30);
        var alto = 30 + Math.floor(Math.random() * 30);
        var x = 30 + Math.floor(Math.random() * 310);
        var y = -alto;

        var enemigoBitmap = juego.add.bitmapData(ancho, alto);
        enemigoBitmap.ctx.fillStyle = '#ff4a4a';
        enemigoBitmap.ctx.fillRect(0, 0, ancho, alto);

        var enemigo = enemigos.create(x, y, enemigoBitmap);
        enemigo.body.velocity.y = 220 + Math.random() * 100;
        enemigo.body.velocity.x = -40 + Math.random() * 80;
        enemigo.body.gravity.y = 0;
        enemigo.body.bounce.set(0);
        enemigo.body.collideWorldBounds = false;
        enemigo.body.checkCollision.up = false;
        enemigo.body.checkCollision.left = false;
        enemigo.body.checkCollision.right = false;
        enemigo.hasScored = false;
        enemigo.checkWorldBounds = true;
        enemigo.outOfBoundsKill = true;
    },

    gameOver: function() {
        juegoTerminado = true;
        jugador.body.velocity.x = 0;

        enemigos.forEachAlive(function(enemigo) {
            enemigo.body.velocity.y = 0;
            enemigo.body.velocity.x = 0;
        }, this);

        if (temporizadorEnemigos) {
            juego.time.events.remove(temporizadorEnemigos);
        }

        textoGameOver = juego.add.text(juego.world.centerX, juego.world.centerY - 60, 'Game Over', { font: '40px Arial', fill: '#ffffff' });
        textoGameOver.anchor.setTo(0.5);

        botonReiniciar = juego.add.button(juego.world.centerX, juego.world.centerY + 40, 'btn', this.reiniciarJuego, this);
        botonReiniciar.anchor.setTo(0.5);
        botonReiniciar.scale.setTo(0.7);
        botonReiniciar.width = 240;
        botonReiniciar.height = 350;
    },

    reiniciarJuego: function() {
        puntuacion = 0;
        tiempoInicio = juego.time.now;
        juegoTerminado = false;

        if (textoGameOver) { textoGameOver.destroy(); }
        if (botonReiniciar) { botonReiniciar.destroy(); }

        jugador.x = 320;
        jugador.y = 460;
        jugador.body.velocity.setTo(0, 0);

        enemigos.removeAll(true);

        textoPuntuacion.text = 'Puntos: 0';

        temporizadorEnemigos = juego.time.events.loop(900, this.generarEnemigo, this);
    }
};

juego.state.add('Principal', estadoPrincipal);
juego.state.start('Principal');