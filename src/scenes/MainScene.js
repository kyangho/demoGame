import Lantern from "../components/Lantern.js";
import NPC from "../components/NPC.js";
import Player from "../components/Player.js";
import DataController from "../controller/DataController.js";
import InputController from "../controller/InputController.js";

//Get controller
var inputController;

//
var point = 0;
var score_text;

//init variable map and layer
var map;
var items;
var background;
var midground;
var coin;
var trapLayer;

//DayLight Variable
var skyState;

//depth layer
const depthLayer = {
    background: 0,
    midground: 10,
    trapLayer: 1,
    player: 20, 
}

//tweens
var cameraTween;
export default class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MAINSCENE",
        });
    }

    preload() { 
        Player.preload(this);

        this.load.image("tiles", "assets/images/RPG Nature Tileset.png");
        // this.load.tilemapTiledJSON("map", "assets/map_1.json");
        this.load.tilemapTiledJSON("map", "assets/images/map.json");

        this.load.image("coin", "assets/images/Liem si.png");
        this.load.image("mask", "assets/images/mask1.png");
        this.load.spritesheet(
            "lantern",
            "assets/images/Lantern Spritesheet.png",
            {
                frameWidth: 32,
                frameHeight: 32,
                startFrame: 0,
                endFrame: 6,
            }
        );
        this.load.pack("player-asset", "assets/Player Asset.json");
        this.load.audio("background_sound", "assets/Mad_Hatter_Tea_Party.mp3");
        this.load.audio("collect_coin_sound", "assets/couin.mp3");
        this.load.audio(
            "death_sound",
            "assets/lego-yoda-death-sound-effect.mp3",
        );
        this.load.audio(
            "revive_sound",
            "assets/gta-san-andreas-ah-shit-here-we-go-again.mp3",
        );

        //load font
        this.load.bitmapFont('big_font', 'assets/font/big_font.png', 'assets/font/big_font.xml');
    }
    create() {
    //load font
        // this.add.bitmapText(100, 100, 'big_font', 'Z123456789').setDepth(100);
    //Load data
        var dataController = new DataController(this);
        skyState = dataController.sceneData.skyState;
        
    //Load map
        this.loadMap();
    
    //Cameras
        this.cameras.main.setScene(this);
        this.cameras.main.setBounds(0, 0,map.widthInPixels, map.heightInPixels, true);

    //Get input
        inputController = new InputController(this);
        this.inputKeys = inputController.getInputKeysDown();

    //load npc
        this.loadObjectNPC();
        
    //Init player
        this.player = new Player({
            scene: this,
            x: 97,
            y: 100,
        });
        this.player.inputKeys = this.inputKeys;

    //text score
        score_text = this.add.text(10, 10, "Liêm sỉ: " + point, {
            fontFamily: "MainFont"
        }).setShadowFill(true).setResolution(4);

    //check Collision
        this.checkCollision();
    //init Lantern
        this.lantern = new Lantern({
            scene: this,
            x: this.player.x,
            y: this.player.y,
            key: "lantern",
        });
        this.lantern.create(this.scene);
        this.lantern.setPipeline("Light2D");
        //Day night system
        this.skyState = skyState.night;
        this.lights.ambientColor = skyState.night;

    //Create tweens Timeline
        var timeline = dataController.sceneData.createTimelineSkyState();

    //Last config
        this.lights.enable();

        //set depth
        background.setDepth(depthLayer.background);
        midground.setDepth(depthLayer.midground);
        trapLayer.setDepth(depthLayer.trapLayer);
        this.player.setDepth(depthLayer.player);

        //Set pipiline "Light 2D"
        background.setPipeline("Light2D");
        this.player.setPipeline("Light2D");
        trapLayer.setPipeline("Light2D");
        coin.setPipeline("Light2D");
        midground.setPipeline("Light2D");

        this.swapDepth();

        //Const category collision
        const CATEGORY_PLAYER = 0b0001
        const CATEGORY_MIDGROUND = 0b0010

        this.player.setCollisionCategory(CATEGORY_PLAYER);
        this.player.setOnCollideWith(CATEGORY_MIDGROUND);

        // midground.setCollisionCategory(CATEGORY_MIDGROUND);
        // midground.setOnCollideWith(CATEGORY_PLAYER);

        this.player.collisionFilter = { group: CATEGORY_MIDGROUND }
        
        this.input.on('pointerdown', function (pointer) {
            console.log("mouse: " + pointer.x + ' ' + pointer.y);
        }, this);
        
    }

    update(time, delta) {
        this.inputKeys = inputController.getInputKeysDown();
        this.player.update();
        this.lantern.update(this.player.x, this.player.y);
        
        cameraTween = this.tweens.add({
            targets: this.cameras.main,
            // scrollX: this.player.x - this.scale.gameSize.width / 2,
            scrollX: (target, targetKey, value, targetIndex, totalTargets, tween) => { 
                return this.player.x - this.scale.gameSize.width / 2;   
            },
            scrollY: (target, targetKey, value, targetIndex, totalTargets, tween) => { 
                return this.player.y - this.scale.gameSize.height / 2;   
            },
            ease: "Linear",
            duration: 500,
        });

    }


//================================================ANOTHER FUNCTION==================================================================
    loadMap(){
        //
            // var answer = this.add.image(23, 23, "image");
            // answer.setInteractive().on("pointerdown", () => {
            //     console.log("correct answer");
            // })
            this.add.text(30, 30, "text").setText
        //create map
        map = this.make.tilemap({ key: "map" });

        //get tileset ground
        const tileset = map.addTilesetImage(
            "RPG Nature Tileset",
            "tiles",
            32,
            32,
            0,
            0
        );
        //var collide object
        var collidesObject = map.getObjectLayer("collides");
        collidesObject.objects.forEach(object => {
            
            var body = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                isSensor: false,
                isStatic: true,
            })
        })
        //get tileset items
        items = map.addTilesetImage("Liem si", "coin", 32, 32, 0, 0);
        
        //create layer 1
        background = map.createLayer("background", tileset, 0, 0);
        this.matter.world.convertTilemapLayer(background);

        //create layer 2
        midground = map.createLayer("midground", tileset, 0, 0);
        midground.setCollisionByProperty({ collides: true });
        midground.setCollisionBetween(21, 24, true);
        midground.setCollisionByProperty()
        this.matter.world.convertTilemapLayer(midground);
        //set label is "midground" for tile in trap layer
        midground.forEachTile(function (tile) {
            if (tile.collideDown) {
                
                tile.physics.matterBody.setCollisionGroup(0b0010);
                // tile.physics.matterBody.collisionFilter.category = 0b0010;
                tile.physics.matterBody.body.label = "midground";
            }
        });

        //create trap layer
        trapLayer = map.createLayer("trapsLayer", tileset, 0, 0);
        trapLayer.setCollisionByProperty({ collides: true });
        trapLayer.setCollisionBetween(2, 6, true);
        this.matter.world.convertTilemapLayer(trapLayer);

        //set label is "trap" for tile in trap layer
        trapLayer.forEachTile(function (tile) {
            if (tile.collideDown) {
                tile.physics.matterBody.body.label = "trap";
                tile.physics.matterBody.body.isSensor = true;
            }
        });
        trapLayer.setOrigin(0);

        //create items layer
        coin = map.createLayer("itemsLayer", items, 0, 0);
        coin.setCollisionByProperty({ collides: true });
        coin.setCollisionBetween(0, 10000, true);
        this.matter.world.convertTilemapLayer(coin);

        //set label is "coin" for coin tile in items layer
        coin.forEachTile(function (tile) {
            if (tile.collideDown) {
                tile.physics.matterBody.body.label = "coin";
                tile.physics.matterBody.body.isSensor = true;
            }
        });

    }

    loadObjectNPC(){
        var npcs = map.getObjectLayer("npc");
        var npc_grammar;
        npcs.objects.forEach(object => {
            if (object.name = "npc_grammar"){
                npc_grammar = new NPC({
                    scene: this,
                    x: object.x + object.width / 2,
                    y: object.y + object.height / 2,
                })
            }
        })
    }

    checkCollision(){
    //Check collision with coin
        this.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
            var p;
            var tmp = bodyA;
            bodyA = bodyA.label == "coin" ? bodyA : bodyB;
            bodyB = bodyB.label == "playerCollider" ? bodyB : tmp;
            if (bodyA.label == "coin" && bodyB.label == "playerCollider") {
                point++;
                score_text.text = "Liêm sỉ: " + point;
                this.sound.play("collect_coin_sound");
                p = map.worldToTileXY(bodyA.position.x, bodyA.position.y, true);
                map.getTileAt(p.x, p.y, true, coin).physics.matterBody.destroy();
                map.removeTileAt(p.x, p.y, true, false, coin);
            }
        });
    
    //Check conllision player with trap
        this.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
            if (
                (bodyA.label == "trap" && bodyB.label == "playerCollider") ||
                (bodyB.label == "trap" && bodyA.label == "playerCollider")
            ) {
                this.player.dead();
                this.sound.play("death_sound");
            }
        });
    }

    swapDepth(){
        this.matter.world.on("collisionactive", (event, bodyA, bodyB) => {
            event.pairs.forEach(pair => {
                if (pair.bodyA.label == "midground" && pair.bodyB.label == "playerSensor"
                ||  pair.bodyA.label == "playerSensor" && pair.bodyB.label == "midground"){
                    var offsetY = 3;
                    if (pair.bodyA.position.y > pair.bodyB.position.y + offsetY){
                        this.player.setDepth(depthLayer.background);
                    }else if(pair.bodyA.position.y < pair.bodyB.position.y + offsetY){
                        this.player.setDepth(depthLayer.player);
                    }
                }
            });
        });
        // midground.forEachTile(function (tile) {
        //     var offsetY = 2;
        //     if (tile.collideDown) {
        //         this.matter.overlap(this.player, this.player, () => {
        //             if (this.player.y > tile.y + offsetY){
        //                 this.player.setDepth(depthLayer.background);
        //             }else if(this.player.y < tile.y + offsetY){
        //                 this.player.setDepth(depthLayer.player);
        //             }
        //         })
        //     }
        // });
    }

    getRootBody (body)
    {
        if (body.parent === body) { return body; }
        while (body.parent !== body)
        {
            body = body.parent;
        }
        return body;
    }

    
}
