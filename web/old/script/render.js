var tileD = 32; //size of a single tile
var screenW = tileD * 42; //how many tiles there is in the entire image
var screenH = tileD * 49;
var screenRatio = screenW/screenH;
var arenaX1 = tileD * 8; //how many tiles until the start of the arena
var arenaY1 = tileD * 14;
var arenaD = screenW - (2 * arenaX1); //tiles not valid in the left and right side
var arenaRate = arenaD / 25;
var nglad = 0;
var json, loadglads = false, startsim = false;
var loadCache = false;
var stab, gender;
var simtimenow;
var dt = 0;
var prefs = {
    bars: true,
    frames: true,
    fps: false,
    text: true,
    speech: true,
    sound: {
        music: 1,
        sfx: 1
    },
    crowd: 1
}

var actionlist = [
    {'name': 'fireball', 'value': 0, 'animation': 'cast'},
    {'name': 'teleport', 'value': 1, 'animation': 'cast'},
    {'name': 'charge', 'value': 2, 'animation': 'walk'},
    {'name': 'block', 'value': 3, 'animation': 'cast'},
    {'name': 'assassinate', 'value': 4, 'animation': 'shoot'},
    {'name': 'ambush', 'value': 5, 'animation': 'cast'},
    {'name': 'melee', 'value': 6, 'animation': 'melee'},
    {'name': 'ranged', 'value': 7, 'animation': 'shoot'},
    {'name': 'movement', 'value': 8, 'animation': 'walk'},
    {'name': 'waiting', 'value': 9, 'animation': 'none'},
    {'name': 'none', 'value': 10, 'animation': 'none'},
    {'name': 'potion', 'value': 11, 'animation': 'cast'}
];
var animationlist = {
    'walk': {
        'start': 8, 'frames': 9},
    'cast': {
        'start': 0, 'frames': 7},
    'shoot': {
        'start': 16, 'frames': 10},
    'stab': {
        'start': 4, 'frames': 8},
    'slash': {
        'start': 12, 'frames': 6},
    'die': {
        'start': 20, 'frames': 6},
};

function phaser_update(step){
    json = step;
    if (nglad == 0 && loadCache)
        nglad = json.glads.length;
}


var game = null;
function load_phaser(){
    if (!game){
        game = new Phaser.Game({
            width: $(document).width(),
            height: $(document).height(),
            renderer: Phaser.WEBGL_MULTI,
            parent: 'canvas-div',
            antialias: true,
            multitexture: true,
            enableDebug: false,
            state: { preload: preload, create: create, update: update, render: render }
        });
        
        return true;
    }
    return false;
}

function preload() {
    game.load.onLoadStart.add(loadStart, this);
    game.load.onFileComplete.add(fileComplete, this);
    game.load.onLoadComplete.add(loadComplete, this);

    for (i=0 ; i < hashes.length ; i++){
        try{
            game.cache.addSpriteSheet('glad'+i, null, hashes[i], 192, 192);
        }
        catch(e){
            console.log(e);
            console.log(hashes);
        }
    }	

    game.load.audio('music', 'res/audio/adventure.mp3');
    game.load.audio('ending', 'res/audio/ending.mp3');
    game.load.audio('victory', 'res/audio/victory.mp3');
    game.load.audio('fireball', 'res/audio/fireball.mp3');
    game.load.audio('explosion', 'res/audio/explosion.mp3');
    game.load.audio('teleport', 'res/audio/teleport.mp3');
    game.load.audio('charge_male', 'res/audio/charge_male.mp3');
    game.load.audio('charge_female', 'res/audio/charge_female.mp3');
    game.load.audio('block', 'res/audio/block.mp3');
    game.load.audio('assassinate', 'res/audio/assassinate.mp3');
    game.load.audio('ambush', 'res/audio/ambush.mp3');
    game.load.audio('ranged', 'res/audio/ranged.mp3');
    game.load.audio('arrow_hit', 'res/audio/arrow_hit.mp3');
    game.load.audio('stun', 'res/audio/stun.mp3');
    game.load.audio('melee', 'res/audio/melee.mp3');
    game.load.audio('lvlup', 'res/audio/lvlup.mp3');
    game.load.audio('heal', 'res/audio/heal.mp3');
    game.load.audio('mana', 'res/audio/mana.mp3');
    game.load.audio('tonic', 'res/audio/tonic.mp3');
    game.load.audio('elixir', 'res/audio/elixir.mp3');
    game.load.audio('death_male', 'res/audio/death_male.mp3');
    game.load.audio('death_female', 'res/audio/death_female.mp3');
    game.load.spritesheet('dummy', 'res/glad.png', 64, 64);
    
    game.load.atlas('atlas_crowd', 'res/atlas_crowd.png', 'res/atlas_crowd.json');
    game.load.atlas('atlas_effects', 'res/atlas_effects.png', 'res/atlas_effects.json');
    game.load.atlas('background', 'res/layers.png', 'res/layers.json');

    game.load.start();
    loadCache = true;
    resize();
    $('#canvas-div canvas').focus();
    if (game.camera)
        game.camera.focusOnXY(screenW * game.camera.scale.x / 2, screenH * game.camera.scale.y / 2);

}

function loadStart(){
    $('#loadbar #status').html("Preparando recursos");
    $('#loadbar #second .bar').width(0);
}


/*
progress = % loaded
totalLoaded = how many files loaded
totalFiles = how many files there is to load
cacheKey = the asset object
success = boolean saying if the assets was successfully loaded
*/
function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles){
    $('#loadbar #status').html("Carregando recursos");
    $('#loadbar #second .bar').width(progress +"%");
    $('#loadbar #main .bar').width(50 + progress/2 +"%");
}

function loadComplete(){
    $('#loadbar #status').html("Tudo pronto");
}

var layers = [];

var sprite = new Array();
var sproj = new Array();
var gladArray = new Array();
var projArray = new Array();
var music, ending, victory;
var clones = new Array();

var poison = (Math.sqrt(2*Math.pow(arenaD/2,2)) / arenaRate);
var gasl = [];
var groupglad, groupgas;
var groupnpc = [];
var bar = {};
var npc;
var audio = {};
var textures;

function create() {

    //textures = game.renderer.setTexturePriority(['atlas_crowd','atlas_effects']);

    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    groupglad = game.add.group();
    groupgas = game.add.group();
    groupnpc.push(game.add.group());
    groupnpc.push(game.add.group());

    groupglad.add(groupgas);
    groupglad.add(groupnpc[0]);
    groupglad.add(groupnpc[1]);

    for (let i=0 ; i<=3 ; i++){
        layers.push(game.add.image(0, 0, 'background', 'layer_'+ i));
        groupglad.add(layers[i]);
    }
    
    music = game.add.audio('music', 0.5, true);
    ending = game.add.audio('ending');
    victory = game.add.audio('victory');

    window.addEventListener("wheel", event => {
        if ($(event.path[0]).parents('#canvas-div').length)
            zoomWheel({deltaY: event.deltaY});
    });

    
    game.input.onDown.add( function(input){
        if (input.button === Phaser.Mouse.LEFT_BUTTON)
            game.input.mouse.drag = true;
    }, this);
    game.input.mouse.drag = false;
    game.input.onUp.add( function(mouse){
        game.input.mouse.drag = false;
    }, this);

    initBars();

    fillPeople();
    
    $.each(npc, function(n,v){
        let pos = getPosArena(v.x, v.y, true);
        v.sprite = {};
        
        if (n.match(/royalguard\d/g) || n.match(/commonguard\d/g) || n.match(/archer\d/g)){
            v.sprite.body = game.add.sprite(pos.x, pos.y, 'atlas_crowd');
            v.sprite.gear = game.add.sprite(pos.x, pos.y, 'atlas_crowd');

            if (n.match(/archer\d/g)){
                var frames = [0,1,2,2,1,0];
                var prefix = {
                    body: 'dummy_grey_' + v.gender + '_',
                    gear: 'archer_' + v.gender + '_'};
                                
                v.sprite.body.animations.add('guard', buildFrames(prefix.body, frames, v.start.body, 2), v.time, false);
                v.sprite.gear.animations.add('guard', buildFrames(prefix.gear, frames, v.start.gear), v.time, false);
                game.time.events.repeat(Phaser.Timer.SECOND * v.interval, 1000, function(){
                    v.sprite.body.animations.play('guard');
                    v.sprite.gear.animations.play('guard');
                }, this);
            }
            else if (n.match(/royalguard\d/g)){
                var frames = [-1,0,1,0];
                var prefix = {
                    body: 'dummy_grey_' + v.gender + '_',
                    gear: 'royal_' + v.gender + '_'};

                v.sprite.body.animations.add('guard', buildFrames(prefix.body, frames, v.start.body, 2), v.time, false);
                v.sprite.gear.animations.add('guard', buildFrames(prefix.gear, frames, v.start.gear), v.time, false);
                game.time.events.repeat(Phaser.Timer.SECOND * v.interval, 1000, function(){
                    v.sprite.body.animations.play('guard');
                    v.sprite.gear.animations.play('guard');
                }, this);
            }
            else if (n.match(/commonguard\d/g)){
                var frames = [0,1];
                var prefix = {
                    body: 'dummy_grey_' + v.gender + '_',
                    gear: 'guard_' + v.gender + '_'};

                v.sprite.body.animations.add('guard', buildFrames(prefix.body, frames, v.start.body, 2), v.time, true);
                v.sprite.gear.animations.add('guard', buildFrames(prefix.gear, frames, v.start.gear, 0, {start: 0, end: 3}), v.time, true);
                v.sprite.body.animations.play('guard');
                v.sprite.gear.animations.play('guard');
            }
            v.sprite.body.animations.play('guard');
            v.sprite.gear.animations.play('guard');
        }
        else if (n == 'king' || n == 'queen'){
            v.sprite.body = game.add.sprite(pos.x, pos.y, 'atlas_crowd');

            var frames = [0,1,0];
            var prefix = {
                body: 'dummy_grey_' + v.gender + '_',
                gear: 'guard_' + v.gender + '_',
                hair: 'hair_'+ v.gender +'_'+ v.hair.style + '_0'};

            v.sprite.body.animations.add('watch', buildFrames(prefix.body, frames, v.start.body, 2), v.time, false);
            v.sprite.body.animations.play('watch');
            game.time.events.repeat(Phaser.Timer.SECOND * v.interval, 1000, function(){
                v.sprite.body.animations.play('watch');
            }, this);

            if (v.color)
                v.sprite.gear = game.add.sprite(pos.x, pos.y, 'atlas_crowd', n + '-blue');
            else
                v.sprite.gear = game.add.sprite(pos.x, pos.y, 'atlas_crowd', n + '-red');

            if (v.hair.style != 'no_hair'){
                v.sprite.hair = game.add.sprite(pos.x, pos.y, 'atlas_crowd', prefix.hair + v.start.hair);
            }
        }
        else{
            v.sprite.body = game.add.sprite(pos.x, pos.y, 'atlas_crowd');

            if (v.hair.style != 'no_hair')
                v.sprite.hair = game.add.sprite(pos.x, pos.y, 'atlas_crowd');

            v.sprite.shirt = game.add.sprite(pos.x, pos.y, 'atlas_crowd');
            v.sprite.pants = game.add.sprite(pos.x, pos.y, 'atlas_crowd');
            v.sprite.shoes = game.add.sprite(pos.x, pos.y, 'atlas_crowd');
        }
        for (let i in v.sprite){
            groupnpc[v.layer-1].add(v.sprite[i]);
            v.sprite[i].scale.setTo(game.camera.scale.x, game.camera.scale.y);
            v.sprite[i].anchor.setTo(0.5, 0.5);

            if (i == 'hair' && v.hair.style != 'no_hair'){
                var prefix = 'hair_'+ v.gender +'_'+ v.hair.style + '_';
                var anim = [0];
                if (v.cheer)
                    anim = v.anim.hair;

                v.sprite[i].animations.add('cheer', buildFrames(prefix, anim, v.start.hair, 2), v.time, true);
                v.sprite[i].tint = v.hair.color;
            }
            else if (i == 'shoes'){
                if (v.gender == 'male')
                    digits = 1;

                prefix = 'shoes_'+ v.gender +'_';
                v.sprite[i].animations.add('cheer', buildFrames(prefix, [0], v.start.shoes, digits), v.time, true);
            }
            else{
                var digits = 2;
                var prefix;
                var frames = [0,1];

                if (i == 'body'){
                    v.sprite[i].tint = v.skin.tint;
                    prefix = 'cheer_'+ v.gender +'_';
                }
                else if (i == 'pants' || i == 'shirt'){
                    v.sprite[i].tint = clothesColor();
                    var n = '';
                    if (i == 'shirt' && v.gender == 'female')
                        n = parseInt(Math.random() * 2 + 1);
                    prefix = 'cheer_'+ i + n +'_'+ v.gender +'_';
                }
                
                v.sprite[i].animations.add('cheer', buildFrames(prefix, frames, v.start.body, digits), v.time, true);
            }

            if (v.cheer){
                v.sprite[i].animations.play('cheer');
            }
        }
    });

    changeCrowd(prefs.crowd);
}

//function created to debug code. pass argument 's' when you want to start measure and 'e' when to end.
//it gives the average time per second the code takes to execute
var mt, ma = null, ta=0, tc=0;
function measureTime(m){
    if (!ma)
        ma = new Date();

    if (m == 's')
        mt = new Date();
    else if (m == 'e'){
        ta += new Date() - mt;
        tc++;
        if (new Date() - ma >= 1000){
            console.log(ta/tc);
            ma = null;
            tc = 0;
            ta = 0;
        }
    }
}

var gasld = 4; //gas layer depth
var gaspl = 25; //gas per layer
function update() {
    if (json.poison){
        poison = parseFloat(json.poison);
        
        var gasadv = Math.sqrt(2*Math.pow(arenaD/2,2)) / arenaRate / poison;

        if (gasadv >= 1 && (gasl.length == 0 || (17-poison) / gasld > gasl.length - 1)){
            var gas = [];
            for (let j = 0 ; j< gaspl ; j++){
                gas.push(game.add.image(0,0, 'atlas_effects', 'gas/gas'));
                gas[j].anchor.setTo(0.5, 0.5);
                gas[j].scale.setTo(gas[j].width / arenaRate * 3); //size = 1p
                gas[j].rotSpeed = Math.random() * 1 - 0.5;
                gas[j].alpha = 0;
                groupgas.add(gas[j]);
            }
            gasl.push(gas);
        }
        for (let i=0 ; i<gasl.length ; i++){
            for (let j=0 ; j<gasl[i].length ; j++){
                var radi = 360 / gasl[i].length * j;
                radi = radi * Math.PI / 180;
                let x = 12.5 + (poison + i*gasld + gasl[i][j].width/2 / arenaRate ) * Math.sin(radi);
                let y = 12.5 + (poison + i*gasld + gasl[i][j].height/2 / arenaRate) * Math.cos(radi);
                gasl[i][j].angle += gasl[i][j].rotSpeed;
                if (gasl[i][j].alpha < 1) 
                    gasl[i][j].alpha += 0.005;
                gasl[i][j].x = arenaX1 + x * arenaRate;
                gasl[i][j].y = arenaY1 + y * arenaRate;
            }
        }
    
    }
    
    if (nglad > 0 && !loadglads) {
        loadglads = true;
        for (i=0 ; i<nglad ; i++){
            //console.log(json.glads[i].x);
            //if (textures.length < game.renderer.maxTextures){
                //game.renderer.currentBatchedTextures.push('glad'+newindex[i]);
            //}

            sprite[i] = game.add.sprite(arenaX1 + parseFloat(json.glads[i].x) * arenaRate, arenaY1 + parseFloat(json.glads[i].y) * arenaRate, 'glad'+newindex[i]);
            sprite[i].anchor.setTo(0.5, 0.5);
            
            createAnimation(i, 'walk');
            createAnimation(i, 'melee');
            createAnimation(i, 'slash');
            createAnimation(i, 'stab');
            createAnimation(i, 'shoot');
            createAnimation(i, 'cast');
            
            sprite[i].animations.add('die', arrayFill(260,265), 10, false);
            
            groupglad.add(sprite[i]);
                        
            gladArray[i] = {
                x: 0,
                y: 0,
                hp: parseFloat(json.glads[i].hp),
                alive: true,
                fade: 0,
                clone: null,
                invisible: false,
                stun: false,
                assassinate: false,
                level: 1,
                block: false,
                charge: false,
                poison: false,
                xp: parseInt(json.glads[i].xp),
                time: false,
                sprites: {},
                dmgfloat: 0
            };

            //var w = arenaX1 + 25 * arenaRate;
            //var h = arenaY1 + 25 * arenaRate;
            //gladArray[i].bars = game.add.bitmapData(w,h);
            //gladArray[i].bars.addToWorld();
        }
        music.play();
        music.volume = prefs.sound.music;
    }
    else if (sprite.length > 0){
        if (!startsim){
            startsim = true;
            $('#fog').remove();
            $('#canvas-container').css({'opacity':1});
            resize();	
            pausesim = false;
        }

        if (json && simtimenow != json.simtime){
            
            for (i=0 ; i<nglad ; i++){
                var x = parseFloat(json.glads[i].x);
                var y = parseFloat(json.glads[i].y);

                var action = parseInt(json.glads[i].action);
                var level = parseInt(json.glads[i].lvl);
                var xp = parseInt(json.glads[i].xp);
                var head = parseFloat(json.glads[i].head);
                var hp = parseFloat(json.glads[i].hp);
                var lockedfor = parseFloat(json.glads[i].lockedfor);

                sprite[i].x = arenaX1 + x * arenaRate;
                sprite[i].y = arenaY1 + y * arenaRate;

                showMessageBaloon(i);
                showHpApBars(i);
                showBreakpoint(i);

                //lvlup
                if (level != gladArray[i].level){
                    gladArray[i].level = level;
                    var lvlup = addSprite(gladArray[i], 'lvlup', sprite[i].x, sprite[i].y);
                    lvlup.anchor.setTo(0.5, 0.35);
                    lvlup.animations.play('lvlup', null, false, true);
                    groupglad.add(lvlup);
                    playAudio('lvlup', prefs.sound.sfx);
                }

                // used potion
                if (actionlist[action].name == 'potion') {
                    gladArray[i].potion = json.glads[i].code.split("-")[1]
                }
                else{
                    gladArray[i].potion = false;
                }

                //took damage
                if (hp != gladArray[i].hp) {
                    //explodiu na cara
                    if (actionlist[action].name == 'fireball'){
                        let pos = json.glads[i].code.split('fireball(')[1].split(')')[0].split(',')
                        let x = parseFloat(pos[0])
                        let y = parseFloat(pos[1])
                        if (Math.sqrt(Math.pow(x - json.glads[i].x, 2) + Math.pow(y - json.glads[i].y, 2)) <= 2){
                            // console.log(Math.sqrt(Math.pow(x - json.glads[i].x) + Math.pow(y - json.glads[i].y)))
                            var fire = addSprite(gladArray[i], 'explode', sprite[i].x, sprite[i].y);
                            fire.anchor.setTo(0.5, 0.5);
                            fire.alpha = 0.5;
                            fire.width = 5 * arenaRate;
                            fire.height = 3 * arenaRate;
                            fire.animations.play('explode', null, false, true);
                            playAudio('explosion', prefs.sound.sfx);
                        }
                    }
                    
                    if (prefs.text){
                        var dmg = gladArray[i].hp - hp;
                        var color = "#ffffff";
                        var floattime = 400;
                        var fill_color = "#000000";

                        if (dmg < 0){
                            fill_color = "#2dbc2d";
                            dmg = -dmg;
                        }
                        else if (json.glads[i].buffs.burn && json.glads[i].buffs.burn.timeleft > 0.1){
                            color = "#d36464";
                            floattime = 100;
                        }
                        else if (gladArray[i].poison)
                            color = "#7ae67a";
                        else if (gladArray[i].block)
                            color = "#9c745a";

                        gladArray[i].dmgfloat += dmg;

                        if (gladArray[i].dmgfloat > 0.01 * json.glads[i].maxhp){
                            new FloatingText(this, {
                                text: gladArray[i].dmgfloat.toFixed(0),
                                animation: 'up',
                                textOptions: {
                                    fontSize: 16,
                                    fill: fill_color,
                                    stroke: color,
                                    strokeThickness: 3
                                },
                                x: sprite[i].x,
                                y: sprite[i].y - 20,
                                timeToLive: floattime // ms
                            });

                            gladArray[i].dmgfloat = 0;
                        }
                    }

                    gladArray[i].hp = hp;

                }
                
                if (hp <= 0){
                    if (gladArray[i].alive){
                        sprite[i].animations.play('die');
                        if (gender[newindex[i]] == "male"){
                            playAudio('death_male', prefs.sound.sfx);
                        }
                        else{
                            playAudio('death_female', prefs.sound.sfx);
                        }
                    }
                    gladArray[i].alive = false;
                }
                // play standard glad animation
                else {
                    gladArray[i].alive = true;

                    var anim = actionlist[action].animation + '-' + getActionDirection(head);
                    if (actionlist[action].name == "movement"){
                        sprite[i].animations.play(anim);
                    }
                    else if (actionlist[action].name == "charge"){
                        if (!gladArray[i].charge){
                            sprite[i].animations.stop();
                            sprite[i].animations.play(anim, 50, true);
                            gladArray[i].charge = true;
                            if (gender[newindex[i]] == "male"){
                                playAudio('charge_male', prefs.sound.sfx);
                            }
                            else{
                                playAudio('charge_female', prefs.sound.sfx);
                            }
                        }
                    }
                    else if (actionlist[action] && actionlist[action].animation != 'none' && gladArray[i].time != json.simtime){
                        var frames = animationlist[actionlist[action].animation].frames;
                        //lockedfor + 0,1 porque quando chega nesse ponto já descontou do turno atual
                        //e multiplica por 2 porque os locked dos ataques são divididos em 2 partes
                        var timelocked = lockedfor + 0.1;
                        if (actionlist[action].name == "ranged" || actionlist[action].name == "melee")
                            timelocked *= 2;
                        var actionspeed = Math.max(10, frames / timelocked);
    
                        //console.log({action: actionspeed, name: json.glads[i].name, lock: lockedfor});

                        sprite[i].animations.stop();
                        sprite[i].animations.play(anim, actionspeed);
                        gladArray[i].time = json.simtime;
                        
                        if (actionlist[action].name == "teleport" && gladArray[i].fade == 0){
                            gladArray[i].fade = 1;
                            gladArray[i].x = sprite[i].x;
                            gladArray[i].y = sprite[i].y;
                            playAudio('teleport', prefs.sound.sfx);
                        }
                        if (actionlist[action].name == "assassinate"){
                            gladArray[i].assassinate = true;
                        }
                        if (actionlist[action].name == "block"){
                            gladArray[i].block = false;
                        }
                        if (actionlist[action].name == "ranged"){
                            playAudio('ranged', prefs.sound.sfx);
                        }
                        if (actionlist[action].name == "melee"){
                            playAudio('melee', prefs.sound.sfx);
                        }
                    }
                }
                
                //ambush
                if (json.glads[i].buffs.invisible.timeleft > 0.1)
                    gladArray[i].invisible = true;
                else
                    gladArray[i].invisible = false;
                
                if (gladArray[i].invisible){
                    if (sprite[i].alpha >= 1)
                        playAudio('ambush', prefs.sound.sfx);
                    if (sprite[i].alpha > 0.3)
                        sprite[i].alpha -= 0.05;
                }
                else if (sprite[i].alpha < 1)
                        sprite[i].alpha += 0.05;
                    
                //fade do teleport
                if (gladArray[i].fade == 1 && (gladArray[i].x != sprite[i].x || gladArray[i].y != sprite[i].y) ){
                    clones.push(game.add.sprite(gladArray[i].x, gladArray[i].y, sprite[i].key, sprite[i].frame));
                    clones[clones.length-1].anchor.setTo(0.5, 0.5);
                    clones[clones.length-1].alpha = 1;
                    sprite[i].alpha = 0;

                    gladArray[i].fade = 2;
                }
                else if (gladArray[i].fade == 2){
                    sprite[i].alpha += 0.05;
                    if (sprite[i].alpha >= 1){
                        sprite[i].alpha = 1;
                        gladArray[i].fade = 0;
                    }
                }

                //clone do teleport
                for (j in clones){
                    clones[j].alpha -= 0.05;
                    if (clones[j].alpha <= 0){
                        clones[j].destroy();
                        clones.splice(j,1);
                    }
                }
                    
                //stun
                if (!gladArray[i].stun && json.glads[i].buffs.stun.timeleft > 0.1 && gladArray[i].alive){
                    gladArray[i].stun = addSprite(gladArray[i], 'stun', sprite[i].x, sprite[i].y);
                    gladArray[i].stun.anchor.setTo(0.5, 1);
                    gladArray[i].stun.scale.setTo(0.6);
                    gladArray[i].stun.animations.play('stun', null, true, false);
                    playAudio('stun', prefs.sound.sfx);
                }
                else if (gladArray[i].stun && (json.glads[i].buffs.stun.timeleft <= 0.1 || !gladArray[i].alive)){
                    gladArray[i].stun.kill();
                    gladArray[i].stun = false;
                }
                
                //block
                if (!gladArray[i].block && json.glads[i].buffs.resist.timeleft > 0.1){
                    gladArray[i].block = true;
                    var shield = addSprite(gladArray[i], 'shield', sprite[i].x, sprite[i].y);
                    shield.anchor.setTo(0.5);
                    groupglad.add(shield);
                    shield.animations.play('shield', null, false, true);
                    shield.alpha = 0.5;
                    playAudio('block', prefs.sound.sfx);
                }
                else if (gladArray[i].block && json.glads[i].buffs.resist.timeleft <= 0.1){
                    gladArray[i].block = false;
                }

                // potion
                if (actionlist[action].name == "potion" && gladArray[i].potion){
                    // console.log(gladArray[i].potion)
                    let name, alpha = 1, scale = 1
                    if (gladArray[i].potion == 'hp'){
                        name = 'heal'
                    }
                    else if (gladArray[i].potion == 'ap'){
                        name = 'mana'
                        alpha = 0.5
                    }
                    else if (gladArray[i].potion == 'high' || gladArray[i].potion == 'low'){
                        name = 'tonic'
                        scale = 0.7
                    }
                    else if (gladArray[i].potion == 'xp'){
                        name = 'elixir'
                    }
                    
                    console.log(name)
                    var potion = addSprite(gladArray[i], name, sprite[i].x, sprite[i].y);
                    potion.anchor.setTo(0.5);
                    potion.scale.setTo(scale);
                    groupglad.add(potion);
                    potion.animations.play(name, null, false, true);
                    potion.alpha = alpha;
                    playAudio(name, prefs.sound.sfx);
                }
                
                //charge
                if (gladArray[i].charge) {
                    if (xp != gladArray[i].xp) {
                        sprite[i].animations.currentAnim.speed = 15;
                        if (stab[newindex[i]] == "0")
                            var anim = 'slash-' + getActionDirection(head);
                        else
                            var anim = 'stab-' + getActionDirection(head);
                        sprite[i].animations.stop();
                        sprite[i].animations.play(anim, 20);
                        playAudio('melee', prefs.sound.sfx);
                    }
                    else if (actionlist[action].name != "charge"){
                        sprite[i].animations.currentAnim.speed = 15;
                        gladArray[i].charge = false;
                    }
                }
                
                //poison
                if (Math.sqrt(Math.pow(12.5 - x, 2) + Math.pow(12.5 - y, 2)) >= poison )
                    gladArray[i].poison = true;
                else
                    gladArray[i].poison = false;
                    
                //aplica os tints
                if (json.glads[i].buffs.burn && json.glads[i].buffs.burn.timeleft > 0.1)
                    sprite[i].tint = 0xFFB072;
                else if (gladArray[i].poison)
                    sprite[i].tint = 0x96FD96;
                else if (gladArray[i].block)
                    sprite[i].tint = 0xFFE533;
                else
                    sprite[i].tint = 0xFFFFFF;
                
                gladArray[i].xp = xp;

                if (timeSlider != Math.floor(json.simtime)){
                    timeSlider = json.simtime;
                    $( "#time" ).slider("value", parseFloat(json.simtime) * 10);
                }
            }
            
            update_ui(json);
        }
        
        debugTimer();
    }
    
    if (simtimenow != json.simtime ){
        var i=0;

        if (json.projectiles && json.projectiles.length > 0) {

            var nproj = json.projectiles.length;
            for (i=0 ; i<nproj ; i++){
                var id = json.projectiles[i].id;
                var type = json.projectiles[i].type;
                var j = findProj(id);
                if (j == -1){
                    var spr;
                    if (json.projectiles[i].type == 0){ //ranged attack
                        spr = newProjectile('arrow');
                    }
                    else if (json.projectiles[i].type == 1){ //fireball
                        spr = newProjectile('fireball');
                        spr.animations.play('fireball');
                        playAudio('fireball', prefs.sound.sfx);
                    }
                    else if (json.projectiles[i].type == 2){ //stun
                        spr = newProjectile('arrow');
                        spr.tint = 0x00FF00;
                    }
                    
                    //console.log(json.simtime +'-'+ json.projectiles[i].owner);
                    if (gladArray[json.projectiles[i].owner] && gladArray[json.projectiles[i].owner].assassinate){
                        gladArray[json.projectiles[i].owner].assassinate = false;
                        spr = newProjectile('arrow');
                        spr.tint = 0xFF0000;
                        playAudio('assassinate', prefs.sound.sfx);
                    }
                                    
                    spr.anchor.setTo(0.5, 0.5);
                    j = sproj.length;
                    sproj.push({'sprite': spr, 'active': true, 'id': id, 'type': type});
                }
                
                sproj[j].sprite.x = arenaX1 + parseFloat(json.projectiles[i].x) * arenaRate;
                sproj[j].sprite.y = arenaY1 + parseFloat(json.projectiles[i].y) * arenaRate;
                sproj[j].sprite.angle = parseFloat(json.projectiles[i].head) + 90;
                sproj[j].active = true;
            }
        }
        
        //calculate projectile hit
        for (let x in sproj){
            if (sproj[x].active === false) {
                if (sproj[x].type == 1){
                    var fire = newProjectile('explode', sproj[x].sprite.x, sproj[x].sprite.y);
                    fire.anchor.setTo(0.5, 0.5);
                    fire.alpha = 0.5;
                    fire.width = 5 * arenaRate;
                    fire.height = 3 * arenaRate;
                    fire.animations.play('explode', null, false, true);
                    playAudio('explosion', prefs.sound.sfx);
                }
                else{
                    playAudio('arrow_hit', prefs.sound.sfx);
                }
                
                sproj[x].sprite.kill();
                sproj.splice(x,1);
            }
            else
                sproj[x].active = false;
        }

        groupglad.sort('y', Phaser.Group.SORT_ASCENDING);
        for (var i=0 ; i<nglad ; i++){
            if (!gladArray[i].alive)
                groupglad.sendToBack(sprite[i]);
        }

        groupglad.sendToBack(layers[0]);
        groupglad.bringToTop(groupgas);
        groupglad.bringToTop(layers[1]);
        groupglad.bringToTop(groupnpc[0]);
        groupglad.bringToTop(layers[2]);
        groupglad.bringToTop(groupnpc[1]);
        groupglad.bringToTop(layers[3]);
    }

    if (game.input.mouse.drag){
        if (game.camera.target){
            $('.ui-glad').removeClass('follow');
            game.camera.unfollow();
            $('#details').remove();
        }
        game.camera.view.y -= game.input.speed.y;
        game.camera.view.x -= game.input.speed.x;
        $('.baloon').remove();
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_ADD) || game.input.keyboard.isDown(Phaser.Keyboard.EQUALS))
        zoomWheel({deltaY: -1});

    if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_SUBTRACT) || game.input.keyboard.isDown(Phaser.Keyboard.UNDERSCORE))
        zoomWheel({deltaY: 1});

    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
        game.camera.view.x -= 10;

    if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
        game.camera.view.x += 10;

    if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
        game.camera.view.y -= 10;

    if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
        game.camera.view.y += 10;

    
    simtimenow = json.simtime;
}

function render() {
}

function findProj(id){
    for (i in sproj){
        if (sproj[i].id == id)
            return i;
    }
    return -1;
}

function arrayFill(s,e){
    a = new Array();
    for(var i=s ; i<=e ; i++)
        a.push(i);
    return a;
}

function getActionDirection(head){
    if (head >= 45 && head <= 135)
        return 'right';
    else if (head > 135 && head < 225)
        return 'down';
    else if (head >= 225 && head <= 315)
        return 'left';
    else
        return 'up';
}

function createAnimation(glad, action){
    var name;
    var sufix = ['-up', '-left', '-down', '-right'];
    if (action == "melee"){
        if (stab[newindex[glad]] == "0")
            name = 'slash';
        else
            name = 'stab';
        animationlist.melee = animationlist[name];
    }
    else
        name = action;
    for (var i=0 ; i<4 ; i++) {
        var start =  (animationlist[name].start + i) * 13;
        var end = start + animationlist[name].frames - 1;
        sprite[glad].animations.add(action + sufix[i], arrayFill(start, end), 15, false);
    }
}

function update_ui(json){
    if (prefs.frames){
        if (prefs.text && !uiVars.showtext){
            uiVars.showtext = true;
            $('.ap-bar .text, .hp-bar .text').removeClass('hidden');
        }
        else if (!prefs.text && uiVars.showtext){
            uiVars.showtext = false;
            $('.ap-bar .text, .hp-bar .text').addClass('hidden');
        }
    
        var nglad = json.glads.length;
        for (i=0 ; i<nglad ; i++){
            var name = json.glads[i].name;
            var STR = json.glads[i].STR;
            var AGI = json.glads[i].AGI;
            var INT = json.glads[i].INT;
            var hp = parseFloat(json.glads[i].hp);
            var maxhp = parseFloat(json.glads[i].maxhp);
            var ap = parseFloat(json.glads[i].ap);
            var maxap = parseFloat(json.glads[i].maxap);
            var lvl = parseInt(json.glads[i].lvl);
            var xp = parseInt(json.glads[i].xp);
            var burn = parseFloat(json.glads[i].buffs.burn.timeleft);
            var resist = parseFloat(json.glads[i].buffs.resist.timeleft);
            var stun = parseFloat(json.glads[i].buffs.stun.timeleft);
            var invisible = parseFloat(json.glads[i].buffs.invisible.timeleft);
            var speed = parseFloat(json.glads[i].buffs.movement.timeleft);
            if (gladArray[i])
                var poison = gladArray[i].poison;
        
            if (!uiVars[i].name){
                uiVars[i].name = name;
                $('.glad-name span').eq(i).html(name);
                $('.glad-portrait').eq(i).append(getSpriteThumb(hashes[newindex[i]],'walk','down'));
            }
            
            if (uiVars[i].STR !== STR){
                uiVars[i].STR = STR;
                $('.glad-str span').eq(i).html(STR);
            }

            if (uiVars[i].AGI !== AGI){
                uiVars[i].AGI = AGI;
                $('.glad-agi span').eq(i).html(AGI);
            }

            if (uiVars[i].INT !== INT){
                uiVars[i].INT = INT;
                $('.glad-int span').eq(i).html(INT);
            }

            if (uiVars[i].lvl != lvl){
                uiVars[i].lvl = lvl;
                $('.lvl-value span').eq(i).html(lvl);
                
                $('.lvl-value').eq(i).addClass('up');
                let j = i;
                setTimeout( function(){
                    $('.lvl-value').eq(j).removeClass('up');
                }, 500);
            }
            
            if (uiVars[i].xp != xp){
                uiVars[i].xp = xp;
                $('.xp-bar .filled').eq(i).height((xp / json.glads[i].tonext * 100) +'%');
            }
            
            if (uiVars[i].hp != hp){
                uiVars[i].hp = hp;
                $('.hp-bar .filled').eq(i).width(hp/maxhp*100 +'%');
                $('.hp-bar .text').eq(i).html(`${hp.toFixed(0)} / ${maxhp}`);
            }
            
            if (hp <= 0){
                uiVars[i].dead = true;
                $('.ui-glad').eq(i).addClass('dead');
            }
            else if (uiVars[i].dead){
                uiVars[i].dead = false;
                $('.ui-glad').eq(i).removeClass('dead');
            }
            
            if (uiVars[i].ap != ap){
                uiVars[i].ap = ap;
                $('.ap-bar .filled').eq(i).width(ap/maxap*100 +'%');
                $('.ap-bar .text').eq(i).html(`${ap.toFixed(0)} / ${maxap}`);
            }
            
            if (burn){
                uiVars[i].burn = true;
                $('.buff-burn').eq(i).addClass('active');
            }
            else if (uiVars[i].burn){
                uiVars[i].burn = false;
                $('.buff-burn').eq(i).removeClass('active');
            }
            
            if (resist){
                uiVars[i].resist = true;
                $('.buff-resist').eq(i).addClass('active');
            }
            else if (uiVars[i].resist){
                uiVars[i].resist = false;
                $('.buff-resist').eq(i).removeClass('active');
            }
            
            if (stun){
                uiVars[i].stun = true;
                $('.buff-stun').eq(i).addClass('active');
            }
            else if (uiVars[i].stun){
                uiVars[i].stun = false;
                $('.buff-stun').eq(i).removeClass('active');
            }

            if (invisible){
                uiVars[i].invisible = true;
                $('.buff-invisible').eq(i).addClass('active');
            }
            else if (uiVars[i].invisible){
                uiVars[i].invisible = false;
                $('.buff-invisible').eq(i).removeClass('active');
            }

            if (speed){
                uiVars[i].speed = true;
                $('.buff-speed').eq(i).addClass('active');
            }
            else if (uiVars[i].speed){
                uiVars[i].speed = false;
                $('.buff-speed').eq(i).removeClass('active');
            }

            if (poison){
                uiVars[i].poison = true;
                $('.buff-poison').eq(i).addClass('active');
            }
            else if (uiVars[i].poison){
                uiVars[i].poison = false;
                $('.buff-poison').eq(i).removeClass('active');
            }

            if ($('.ui-glad.follow').length && i == $('.ui-glad').index($('.follow'))){
                updateDetailedWindow()
            }
    
        }        
    }
}

var oldTime = null;
var avgFPS = 0, contFPS = 0;
var avgFPS5 = [];
function debugTimer(){
    if (prefs.fps){
        if (!oldTime)
            oldTime = new Date();
        else{
            var newTime = new Date();
            avgFPS += newTime - oldTime;
            contFPS++;
            oldTime = newTime;
        }
        if (!$('#fps').length){
            $('#canvas-container').append("<div id='fps'></fps>");
            intFPS();
        }
        function intFPS(){
            setTimeout( function() {
                if (contFPS > 0){
                    avgFPS = 1000/(avgFPS/contFPS);
                    contFPS = 0;

                    //calculate average FPS in last 5 seconds
                    avgFPS5.push(avgFPS);
                    if (avgFPS5.length > 5)
                        avgFPS5.splice(0,1);
                    avgFPS = 0;
                    for (let i in avgFPS5)
                        avgFPS += avgFPS5[i];
                    avgFPS /= avgFPS5.length;

                    $('#fps').html("FPS: "+ parseFloat(avgFPS).toFixed(1));
                }
                
                if ($('#fps').length)
                    intFPS();
                else{
                    avgFPS5 = [];
                    avgFPS = 0;
                    contFPS = 0;
                }
            }, 1000);
        }
    }
    else if ($('#fps').length){
        $('#fps').remove();
    }
}

$(window).keydown(function(event) {
    if(event.keyCode == Phaser.Keyboard.S){
        $('#sound').click();
    }

    if(event.keyCode == Phaser.Keyboard.F){
        prefs.fps = (prefs.fps + 1) % 2;
    
        $.post("back_play.php", {
            action: "SET_PREF",
            show_fps: (prefs.fps == 1)
        });
    }

    if(event.keyCode == Phaser.Keyboard.B){
        prefs.bars = (prefs.bars + 1) % 2;
    
        $.post("back_play.php", {
            action: "SET_PREF",
            show_bars: (prefs.bars == 1)
        });
    }

    if(event.keyCode == Phaser.Keyboard.M){
        if (prefs.frames){
            $('#ui-container').fadeOut();
            prefs.frames = false;
        }
        else{
            $('#ui-container').fadeIn();
            prefs.frames = true;
        }

        $.post("back_play.php", {
            action: "SET_PREF",
            show_frames: prefs.frames
        });
    }

    if(event.keyCode == Phaser.Keyboard.T){
        prefs.text = (prefs.text + 1) % 2;

        $.post("back_play.php", {
            action: "SET_PREF",
            show_text: (prefs.text == 1)
        });
    }

    if(event.keyCode == Phaser.Keyboard.SPACEBAR)
        $('#pause').click();

    if(event.keyCode == Phaser.Keyboard.A)
        $('#back-step').click();

    if(event.keyCode == Phaser.Keyboard.D)
        $('#fowd-step').click();

    if(event.keyCode >= Phaser.Keyboard.ONE && event.keyCode <= Phaser.Keyboard.FIVE){
        var i = event.keyCode - Phaser.Keyboard.ONE;
        $('.ui-glad').eq(i).click();
    }

});

function getGladPositionOnCanvas(gladid){
    var ph = game.camera.scale.y * tileD;
    var pw = game.camera.scale.x * tileD;
    
    //var x = pw*(arenaX1/tileD) + pw * parseFloat(25);
    var x = pw * ((arenaX1/tileD) + parseFloat(json.glads[gladid].x)/25*26);
    var y = ph * ((arenaY1/tileD) + parseFloat(json.glads[gladid].y)/25*26);
    //console.log(json.glads[gladid].y);
    var ct = $('#canvas-div canvas').position().top - game.camera.view.y;
    var cl = $('#canvas-div canvas').position().left - game.camera.view.x;
    return {x: x+cl, y: y+ct};
}

function showMessageBaloon(gladid){
    var message = json.glads[gladid].message;

    if (prefs.speech && message != "" && json.glads[gladid].hp > 0){
        var gpos = getGladPositionOnCanvas(gladid);

        if ($('.baloon.glad-'+ gladid).length)
            $('.baloon.glad-'+ gladid).html(message);
        else
            $('#canvas-div').append("<div class='baloon glad-"+ gladid +"'>"+ message +"</div>");

        var baloon = $('.baloon.glad-'+ gladid);
        var x = gpos.x + 15 * game.camera.scale.x;
        var y = gpos.y - 15 * game.camera.scale.y - baloon.outerHeight();
        baloon.css({'top': y, 'left': x});
        if (baloon.width() < 200 && baloon.height() >= 50){
            baloon.css({'left': x-230});
            baloon.addClass('left');
        }
        else if (baloon.hasClass('left'))
            baloon.removeClass('left');
            
        gladArray[gladid].baloon = true;
    }
    else if (gladArray[gladid].baloon){
        $('.baloon.glad-'+ gladid).fadeOut( function(){
            $(this).remove();
            gladArray[gladid].baloon = null;
        });
    }
    
}

function showBreakpoint(gladid){
    if (json.glads[gladid].breakpoint && json.glads[gladid].hp > 0){
        if (!pausesim)
            $('#pause').click();

        var gpos = getGladPositionOnCanvas(gladid);
        var bp = json.glads[gladid].breakpoint;

        if ($(`.breakpoint.glad-${gladid}`).length)
            $('.breakpoint.glad-'+ gladid).remove();
        $('#canvas-div').append(`<div class='breakpoint glad-${gladid}' title='Expandir breakpoint'>${bp}</div>`);

        var baloon = $('.breakpoint.glad-'+ gladid);
        baloon.hide().fadeIn();

        var x = gpos.x - 7.5;
        var y = gpos.y - 25 * game.camera.scale.y - baloon.outerHeight();
        baloon.css({'top': y, 'left': x});
        if (baloon.width() < 200 && baloon.height() >= 50){
            baloon.css({'left': x-230});
            baloon.addClass('left');
        }
        else if (baloon.hasClass('left'))
            baloon.removeClass('left');
            
        gladArray[gladid].breakpoint = true;
        
        baloon.click( () => {
            if (!baloon.hasClass('expanded'))
                baloon.addClass('expanded').removeAttr('title');
        });
    }
    else if (gladArray[gladid].breakpoint && !pausesim){
        gladArray[gladid].breakpoint = false;
        $('.breakpoint.glad-'+ gladid).fadeOut(function(){
            $(this).remove();
        });
    }
}

function initBars(){
    var graphics = {};
    graphics.back = game.add.graphics(0,0);
    graphics.back.beginFill(0x000000);
    graphics.back.drawRect(-100,0,30,9);

    graphics.hp = game.add.graphics(0,0);
    graphics.hp.beginFill(0xff0000);
    graphics.hp.drawRect(-100,0,30,5);
    
    graphics.ap = game.add.graphics(0,0);
    graphics.ap.beginFill(0x0000ff);
    graphics.ap.drawRect(-100,0,30,4);

    bar.back = graphics.back.generateTexture();
    bar.back.alpha = 0.15;
    bar.hp = graphics.hp.generateTexture();
    bar.hp.alpha = 0.4;
    bar.ap = graphics.ap.generateTexture();
    bar.ap.alpha = 0.4;
}

function showHpApBars(gladid){
    if (prefs.bars){
        if (!gladArray[gladid].bars){
            var b = {};
            b.back = game.add.sprite(0,0, bar.back);
            b.back.alpha = 0.15;
            b.hp = game.add.sprite(0,0, bar.hp);
            b.hp.alpha = 0.4;
            b.ap = game.add.sprite(0,0, bar.ap);
            b.ap.alpha = 0.4;

            gladArray[gladid].bars = b;
        }
    
        if (json.glads[gladid].hp > 0){
            var x = arenaX1 + json.glads[gladid].x * arenaRate;
            var y = arenaY1 + json.glads[gladid].y * arenaRate;
            var hp = parseFloat(json.glads[gladid].hp);
            var maxhp = parseFloat(json.glads[gladid].maxhp);
            var ap = parseFloat(json.glads[gladid].ap);
            var maxap = parseFloat(json.glads[gladid].maxap);
            var barsize = 30;

            gladArray[gladid].bars.back.x = x + -barsize/2;
            gladArray[gladid].bars.back.y = y + -35;
            gladArray[gladid].bars.back.width = barsize;
            gladArray[gladid].bars.back.height = 9;
    
            gladArray[gladid].bars.hp.x = x + -barsize/2;
            gladArray[gladid].bars.hp.y = y + -35;
            gladArray[gladid].bars.hp.width = hp/maxhp * barsize;
            gladArray[gladid].bars.hp.height = 5;

            gladArray[gladid].bars.ap.x = x + -barsize/2;
            gladArray[gladid].bars.ap.y = y + -30;
            gladArray[gladid].bars.ap.width = ap/maxap * barsize;
            gladArray[gladid].bars.ap.height = 4;

            if (!gladArray[gladid].bars.back.alive){
                gladArray[gladid].bars.back.revive();
                gladArray[gladid].bars.hp.revive();
                gladArray[gladid].bars.ap.revive();
            }
        }
        else{
            gladArray[gladid].bars.back.kill();
            gladArray[gladid].bars.hp.kill();
            gladArray[gladid].bars.ap.kill();
        }
    }
    else if (gladArray[gladid].bars && gladArray[gladid].bars.back.alive){
        gladArray[gladid].bars.back.kill();
        gladArray[gladid].bars.hp.kill();
        gladArray[gladid].bars.ap.kill();
    }


    
}

function zoomWheel(wheel){
    var scaleValue = 0.05;
    var delta = 1 - wheel.deltaY / Math.abs(wheel.deltaY) * scaleValue;
    var canvasW = screenW * (game.camera.scale.x * delta);
    var canvasH = screenH * (game.camera.scale.y * delta);

    var point = {
        x: (game.input.mouse.input.x + game.camera.x) / game.camera.scale.x,
        y: (game.input.mouse.input.y + game.camera.y) / game.camera.scale.y,
    }

    var bind = null;
    if ($(window).width() > $(window).height()){
        if (canvasH <= $(window).height())
            bind = "height";
        else
            bind = "none";
    }
    else{
        if (canvasW <= $(window).width())
            bind = "width";
        else
            bind = "none";
    }

    if (bind == "width"){
        canvasW = $(window).width();
        canvasH = $(window).width() * screenH/screenW;
        game.camera.scale.x = $(window).width() / screenW;
        game.camera.scale.y = $(window).width() / screenW;
    }
    else if (bind == "height"){
        canvasH = $(window).height();
        canvasW = $(window).height() * screenW/screenH;
        game.camera.scale.x = $(window).height() / screenH;
        game.camera.scale.y = $(window).height() / screenH;
    }
    else{
        game.camera.scale.x *= delta;
        game.camera.scale.y *= delta;
    }

    if (canvasW > $(window).width())
        canvasW = $(window).width();
    if (canvasH > $(window).height())
        canvasH = $(window).height();

    game.scale.setGameSize(canvasW, canvasH);
    game.camera.bounds.width = screenW;
    game.camera.bounds.height = screenH;

    if (bind == "none"){
        var mx = game.input.mouse.input.x;
        var my = game.input.mouse.input.y;
        var sx = game.camera.scale.x;
        var sy = game.camera.scale.y;
        var cx = game.camera.x;
        var cy = game.camera.y;

        game.camera.x = point.x * sx - mx;
        game.camera.y = point.y * sy - my;
    }
    $('.baloon').remove();
}

function getPosArena(x, y, absolute=false){
    x = (x + 0.5) * tileD;
    y = (y + 0.5) * tileD;
    if (!absolute){
        x += arenaX1;
        y += arenaY1;
    }

    return {x: x, y: y};
}

function fillPeople(){

    var realmColor = Math.floor(Math.random() * 2);

    npc = {
        king: 			{x: 20, y: 7.3, start: {body: 0, hair: 2}, heading: 'down', gender: 'male', color: realmColor, time: 5, interval: (Math.random() * 2 + 3)},
        queen:			{x: 21, y: 7.3, start: {body: 0, hair: 4}, heading: 'down', gender: 'female', color: realmColor, time: 5, interval: (Math.random() * 2 + 3)},
        counselor1:		{x: 19, y: 6.7, start: {body: 4}, heading: 'down', gender: 'male'},
        counselor2:		{x: 22, y: 6.7, start: {body: 4}, heading: 'down', gender: 'male'},
        royalguard1:	{x: 16, y: 4, start: {gear: 2, body: 4}, heading: 'down', time: Math.random() * 0.4 + 0.6, interval: (Math.random() * 6 + 8)},
        royalguard2:	{x: 25, y: 4, start: {gear: 2, body: 4}, heading: 'down', time: Math.random() * 0.4 + 0.6, interval: (Math.random() * 6 + 8)},
        archer1:		{x: 4, y: 3, start: {gear: 3, body: 9}, heading: 'down', time: 8, interval: (Math.random() * 2 + 7)},
        archer2:		{x: 39, y: 1, start: {gear: 3, body: 9}, heading: 'down', time: 8, interval: (Math.random() * 2 + 7)},
        archer3:		{x: 21, y: 39, start: {gear: 0, body: 6}, heading: 'up', time: 8, interval: (Math.random() * 2 + 7)},
        commonguard1:	{x: 2, y: 9, start: {gear: 2, body: 4}, heading: 'down', time: Math.random() * 0.1 + 0.1},
        commonguard2:	{x: 39, y: 9, start: {gear: 1, body: 3}, heading: 'left', time: Math.random() * 0.1 + 0.1},
        commonguard3:	{x: 2, y: 40, start: {gear: 3, body: 5}, heading: 'right', time: Math.random() * 0.1 + 0.1},
        commonguard4:	{x: 39, y: 40, start: {gear: 0, body: 2}, heading: 'up', time: Math.random() * 0.1 + 0.1},
    };	

    var gender = [{name: 'male', anims: 3, prob: 0.7}, {name: 'female', anims: 2, prob: 0.3}];

    for (let i in npc){
        npc[i].layer = 1;
        if (!npc[i].skin)
            npc[i].skin = skinColor(i);
        if (!npc[i].gender)
            npc[i].gender = gender[weightedRoll([gender[0].prob, gender[1].prob])].name;
        npc[i].hair = getHair(npc[i].skin.name, npc[i].gender);
    }

    var factor = 1;
    
    arenaSpaces = [
        //left top
        {x: 2.4, y: 10.1, axis: 1, capacity: 29, fill: 0.3, heading: 'right', layer: 1},
        {x: 3.4, y: 10.4, axis: 1, capacity: 29, fill: 0.4, heading: 'right', layer: 1},

        //left bottom
        {x: 5.4, y: 11, axis: 1, capacity: 29, fill: 0.5, heading: 'right', layer: 1},
        {x: 6.4, y: 11.3, axis: 1, capacity: 28, fill: 0.6, heading: 'right', layer: 1},

        //right bottom
        {x: 34.6, y: 11.3, axis: 1, capacity: 28, fill: 0.6, heading: 'left', layer: 1},
        {x: 35.6, y: 11, axis: 1, capacity: 29, fill: 0.5, heading: 'left', layer: 1},

        //right top
        {x: 37.6, y: 11.5, axis: 1, capacity: 29, fill: 0.4, heading: 'left', layer: 1},
        {x: 38.6, y: 11.2, axis: 1, capacity: 29, fill: 0.3, heading: 'left', layer: 1},


        //top top left
        {x: 8, y: 5, axis: 0, capacity: 6, fill: 0.7, heading: 'down', layer: 1},
        {x: 8.1, y: 5.5, axis: 0, capacity: 7, fill: 0.8, heading: 'down', layer: 2},

        //top bottom left
        {x: 8, y: 9, axis: 0, capacity: 8, fill: 0.5, heading: 'down', layer: 1},
        {x: 8.1, y: 9.5, axis: 0, capacity: 8, fill: 0.6, heading: 'down', layer: 2},

        //top top right
        {x: 28, y: 5, axis: 0, capacity: 6, fill: 0.7, heading: 'down', layer: 1},
        {x: 26.9, y: 5.5, axis: 0, capacity: 7, fill: 0.8, heading: 'down', layer: 2},

        //top bottom right
        {x: 26, y: 9, axis: 0, capacity: 8, fill: 0.5, heading: 'down', layer: 1},
        {x: 25.9, y: 9.5, axis: 0, capacity: 8, fill: 0.6, heading: 'down', layer: 2},


        //bottom botom left
        {x: 7, y: 39.5, axis: 0, capacity: 10, fill: 0.6, heading: 'up', layer: 1},

        //bottom top left
        {x: 5, y: 40.5, axis: 0, capacity: 12, fill: 0.4, heading: 'up', layer: 2},

        //bottom bottom right
        {x: 25, y: 39.5, axis: 0, capacity: 10, fill: 0.6, heading: 'up', layer: 1},

        //bottom top right
        {x: 25, y: 40.5, axis: 0, capacity: 12, fill: 0.4, heading: 'up', layer: 2},
    ];

    var headArray = {up: [0, 8, 16], left: [2, 10, 18], down: [4, 12, 20], right: [6, 14, 22]};

    var shoesanim = {
        male: {up: 0, left: 3, down: 1, right: 4},
        female: {up: 0, left: 2, down: 4, right: 6}
    };

    var hairinfo = {
        start: {
            male: [
                {up: 0, left: 1, down: 2, right: 3},
                {up: 0, left: 1, down: 2, right: 3},
                {up: 4, left: 6, down: 8, right: 10}],
            female: [
                {up: 0, left: 2, down: 4, right: 6},
                {up: 8, left: 9, down: 10, right: 11}]
        },
        anim: {
            male: [[0,0], [0,0], [0,1]],
            female: [[0,1], [0,0]]
        }
    };

    var n = 0;
    for (let j in arenaSpaces){
        for (let i=0 ; i<arenaSpaces[j].capacity ; i++){
            if (Math.random() < arenaSpaces[j].fill * factor){
                var xinc = 0, yinc = 0;
                if (arenaSpaces[j].axis == 1)
                    yinc = i;
                else
                    xinc = i;

                var skin = skinColor();
                var genderroll = gender[weightedRoll([gender[0].prob, gender[1].prob])];
                var animroll = Math.floor(Math.random() * genderroll.anims);
                npc['people'+n] = {
                    x: arenaSpaces[j].x + xinc,
                    y: arenaSpaces[j].y + yinc,
                    heading: arenaSpaces[j].heading,
                    time: Math.random()*6 + 2,
                    layer: arenaSpaces[j].layer,
                    skin: skin,
                    gender: genderroll.name,
                    hair: getHair(skin.name, genderroll.name),
                    anims: genderroll.anims,
                    start: {
                        body: headArray[arenaSpaces[j].heading][animroll],
                        shoes: shoesanim[genderroll.name][arenaSpaces[j].heading],
                        hair: hairinfo.start[genderroll.name][animroll][arenaSpaces[j].heading]},
                    cheer: true,
                    anim: {
                        hair: hairinfo.anim[genderroll.name][animroll]}
                };
                n++;
            }
        }
    }
}

function clothesColor(){
    var r = 0, g = 0, b = 0, v = 0;
    //pure color
    let s = Math.random();
    if (s < 0.15){
        v = Math.round(Math.random() * 200 + 50 ).toString(16);
        r = v;
        g = v;
        b = v;
    }
    else{
        if (s < 0.5){
            let c = Math.random();
            if (c < 0.4)
                r = 230;
            else if (c < 0.6)
                g = 180;
            else
                b = 200;
        }
        else{
            r = 150;
            g = 150;
            b = 150;
        }

        r = Math.round(Math.random() * r).toString(16);
        g = Math.round(Math.random() * g).toString(16);
        b = Math.round(Math.random() * b).toString(16);
    }


    if (r.length < 2)
        r = "0" + r;
    if (g.length < 2)
        g = "0" + g;
    if (b.length < 2)
        b = "0" + b;

    var color = '0x' + r + g + b;
    //console.log(color);
    return color;
}

function getHair(skin, gender){
    var r = 0, g = 0, b = 0, v = 0;

    var chances = {
        color: {
            light: [0.1, 0.25],
            black: [0, 0],
            tanned: [0.05, 0.15],
            dark: [0, 0.05],
            darkelf: [0.2, 0.4],
            red_orc: [0.1, 0.1]
        },
        style: {
            male: {
                light: [0.25, 0.3, 0.1, 0.05, 0.3, 0.1],
                black: [0.05, 0.05, 0.2, 0.4, 0.1, 0.4],
                tanned: [0.35, 0.2, 0.1, 0.05, 0.3, 0.1],
                dark: [0.15, 0.1, 0.2, 0.3, 0.25, 0.3],
                darkelf: [0.3, 0.1, 0, 0, 0, 0.8],
                red_orc: [0.15, 0, 0.3, 0.05, 0.1, 0.5]
            },
            female: {
                light: [0.3, 0.05, 0.3, 0.3, 0.2, 0],
                black: [0.1, 0.6, 0.15, 0.3, 0.3, 0.02],
                tanned: [0.3, 0.2, 0.3, 0.3, 0.2, 0.01],
                dark: [0.2, 0.3, 0.2, 0.2, 0.3, 0.02],
                darkelf: [0.1, 0, 0.1, 0.4, 0.3, 0.2],
                red_orc: [0.1, 0.05, 0.1, 0.2, 0.3, 0.2]
            }
        }
    }

    var s = Math.random();
    //redhead
    if (s < chances.color[skin][0]){
        r = Math.random() * 90 + 110;
        g = Math.random() * 55 + 70;
        b = Math.random() * 25 + 55;
    }
    //blonde
    else if (s < chances.color[skin][1] + chances.color[skin][0]){
        r = Math.random() * 70 + 160;
        g = r * 0.8;
    }
    //brunette - black
    else{
        r = Math.random() * 70 + 30;
        g = r * 0.75;
        b = Math.random() * 30 + 20;
    }
    r = Math.round(r).toString(16);
    g = Math.round(g).toString(16);
    b = Math.round(b).toString(16);

    if (r.length < 2)
        r = "0" + r;
    if (g.length < 2)
        g = "0" + g;
    if (b.length < 2)
        b = "0" + b;

    var color = '0x' + r + g + b;

    var hairstyle = {
        male: ['ponytail', 'parted', 'mohawk', 'jewfro', 'bedhead', 'no_hair'],
        female: ['long', 'jewfro', 'loose', 'longknot', 'pixie', 'no_hair']
    }

    var h = weightedRoll(chances.style[gender][skin]);
    var style = hairstyle[gender][h];

    //console.log(color);
    return {color: color, style: style};
}

function skinColor(name){
    var skins = {
        light: {chance: 0.35, tint: '0xfdd5b7'},
        black: {chance: 0.1, tint: '0x61382d'},
        tanned: {chance: 0.25, tint: '0xfdd082'},
        dark: {chance: 0.2, tint: '0xba8454'},
        darkelf: {chance: 0.05, tint: '0xaeb3ca'},
        red_orc: {chance: 0.05, tint: '0x568b33'},
    }

    if (name == 'king' || name == 'queen'){
        skins.darkelf.chance = 0;
        skins.red_orc.chance = 0;
        skins.light.chance = 0.4;
        skins.tanned.chance = 0.3;
    }

    var s = Math.random();
    for (let i in skins){
        if (s < skins[i].chance)
            return {name: i, tint: skins[i].tint};
        else
            s -= skins[i].chance;
    }
}

function weightedRoll(probs){
    var sum = 0;
    for (let i in probs)
        sum += probs[i];
    for (let i in probs)
        probs[i] = probs[i] / sum;

    var roll = Math.random();
    for (let i in probs){
        if (roll < probs[i])
            return i;
        else
            roll -= probs[i];
    }
    return -1;
}

function addSprite(glad, name, x, y){
    var anim = {
        lvlup: {key: 'level', frames: 20, frameRate: 15, loop: false},
        explode: {key: 'explosion', frames: 12, frameRate: 15, loop: true},
        stun: {key: 'stun', frames: 6, frameRate: 15, loop: true},
        shield: {key: 'shield', frames: 20, frameRate: 15, loop: false},
        mana: {key: 'mana', frames: 25, frameRate: 15, loop: false},
        heal: {key: 'heal', frames: 25, frameRate: 15, loop: false},
        tonic: {key: 'tonic', frames: 35, frameRate: 15, loop: false},
        elixir: {key: 'elixir', frames: 25, frameRate: 15, loop: false}
    };


    if (glad.sprites[name]){
        glad.sprites[name].x = x;
        glad.sprites[name].y = y;
        glad.sprites[name].revive();
    }
    else{
        let nz = anim[name].frames >= 10 ? 2 : 1
        glad.sprites[name] = game.add.sprite(x, y, 'atlas_effects');
        var frames = Phaser.Animation.generateFrameNames(anim[name].key +'/', 0, anim[name].frames-1, '', nz)
        glad.sprites[name].animations.add(name, frames, anim[name].frameRate, anim[name].loop);
    }

    return glad.sprites[name];

}

projSprites = {arrow: [], fireball: [], explode: []};
function newProjectile(type, x, y){
    var newi = null
    for (let i in projSprites[type]){
        if (!projSprites[type][i].alive){
            newi = i;
            break;
        }
    }

    if (type != 'explode'){
        x = 0;
        y = 0;
    }

    if (newi){
        projSprites[type][newi].x = x;
        projSprites[type][newi].y = y;
        projSprites[type][newi].tint = 0xFFFFFF;
        projSprites[type][newi].revive();
    }
    else{
        newi = projSprites[type].length;
        if (type == 'arrow')
            projSprites[type].push(game.add.image(x, y, 'atlas_effects', 'arrow/arrow'));
        else{
            projSprites[type].push(game.add.sprite(x, y, 'atlas_effects'));

            if (type == 'fireball'){
                var frames = Phaser.Animation.generateFrameNames('fireball/', 0, 7, '', 2);
                projSprites[type][newi].animations.add('fireball', frames, 15, true);
            }
            if (type == 'explode'){
                var frames = Phaser.Animation.generateFrameNames('explosion/', 0, 11, '', 2);
                projSprites[type][newi].animations.add('explode', frames, 15, true);
            }
        }
    }

    return projSprites[type][newi];
}

function playAudio(marker, volume){
    if (!audio[marker])
        audio[marker] = [];

    var newi = null;
    for (let i in audio[marker]){
        if (!audio[marker][i].isPlaying){
            newi = i;
            break;
        }
    }

    if (newi){
        audio[marker][newi].volume = volume;
        audio[marker][newi].play()
    }
    else
        audio[marker].push(game.add.audio(marker, volume).play());
}

function buildFrames(prefix, frames, start, digits, loop){
    if (!start)
        start = 0;
    if (!digits)
        digits = 0;

    var strings = [];
    for (let i in frames){
        let p = frames[i] + start;
        if (loop && p > loop.end)
            p = loop.start;
        let n = '0000000'.slice(Math.log10(Math.max(1, p))+1, digits) + p;
        strings.push(prefix + n);
    }

    return strings;

}