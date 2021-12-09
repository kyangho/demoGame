export default class NPC extends Phaser.Physics.Matter.Sprite{
    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.scene.add.existing(this);

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        this.playerCollider = Bodies.circle(this.x, this.y + 10, 6, {
            isSensor: false,
            label: "npcCollider",
        });
        this.playerSensor = Bodies.circle(this.x, this.y, 24, {
            isSensor: true,
            label: "npcSensor",
        });
        const compoundBody = Body.create({
            parts: [this.playerCollider, this.playerSensor],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
        this.setCollisionCategory(2);
        this.spawnX = this.x;
        this.spawnY = this.y;

        this.create();
        this.setOrigin(0.5, 0.5)
        this.isStatic = true;
        this.setStatic(true);
        this.playAfterDelay("player_idle_anims", 1000)
        this.play("player_idle_anims", true);

        this.isPressE = false;

        var buttonInteractive = this.scene.add.bitmapText(this.x, this.y, 'bigFont', 'E').setDepth(100).setOrigin(0.5 ,0.5).setScale(0.5).setVisible(false);
        this.scene.matter.world.on("collisionactive", (event, bodyA, bodyB) => {
            event.pairs.forEach(pair => {
                if (pair.bodyA.label == "npcSensor" && pair.bodyB.label == "playerSensor"
                ||  pair.bodyA.label == "playerSensor" && pair.bodyB.label == "npcSensor"){
                    if (this.scene.input.keyboard.addKey("E").isDown){
                        this.isPressE = true;
                        // this.scene.scene.switch("MATHSCENE");
                        // this.scene.scene.stop("MATHSCENE")
                        // this.scene.scene.resume("MATHSCENE")
                        // this.scene.scene.resume("MATHSCENE")
                        // this.scene.scene.remove("MATHSCENE")
                    }
                    if (this.scene.input.keyboard.addKey("E").isUp){
                        if(this.isPressE){
                            // this.scene.restartScene("MATHSCENE");
                            this.isPressE = false;
                            // this.scene.scene.stop("MATHSCENE")
                            this.scene.scene.launch("MATHSCENE")
                        }
                    }
                    var tmp = pair.bodyA;
                    pair.bodyA = pair.bodyA.label == "npcSensor" ? pair.bodyA : pair.bodyB;
                    pair.bodyB = pair.bodyB.label == "playerSensor" ? pair.bodyB : tmp;
                    if ((pair.bodyA.position.x - pair.bodyB.position.x) > 0){
                        this.setFlipX(true);
                    }else{
                        this.setFlipX(false);
                    }
                    buttonInteractive.setVisible(true) ;
                }
            });
        });
        this.scene.matter.world.on("collisionend", (event, bodyA, bodyB) => {
            event.pairs.forEach(pair => {
                if (pair.bodyA.label == "npcSensor" && pair.bodyB.label == "playerSensor"
                ||  pair.bodyA.label == "playerSensor" && pair.bodyB.label == "npcSensor"){
                    this.setFlipX(true);
                    buttonInteractive.setVisible(false)
                    this.isPressE = false;
                }
            });
        });
        this.setInteractive().on('pointerdown', function(pointer, localX, localY, event){
        });

    }

    create(){
        this.anims.create({
            key: "player_idle_anims",
            frames: this.anims.generateFrameNumbers("player_idle_anims",{
                start: 0,
                end: 12,
            }),
            frameRate: 8,
            repeat: -1,
        });
    }

}