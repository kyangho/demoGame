import Light from "../light/Light.js";

var offsetY = -25;
var state = "ACTIVE";
export default class Lantern extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame, key } = data;
        super(scene.matter.world, x, y, texture, frame);
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        this.collider = Bodies.circle(this.x, this.y + 4, 6, {
            isSensor: true,
            label: "collider",
        });
        const compoundBody = Body.create({
            parts: [this.collider],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.scene.add.existing(this);
    }

    preload(scene) {}

    create(scene) {
        this.anims.create({
            key: "lanternAnims",
            frames: this.anims.generateFrameNumbers("lantern"),
            frameRate: 10,
            repeat: -1,
        });
        this.spotLight = new Light({
            scene: this.scene,
            x: this.x,
            y: this.y,
        });
        this.spotLight.create(this.scene);
        this.anims.play("lanternAnims", true);

        this.setScale(0.7, 0.7);
    }

    update(x, y) {
        if (state == "DISABLE") {
            return;
        }
        this.y = this.y;
        this.scene.tweens.add({
            targets: this,
            x: x,
            y: y,
            ease: "Linear",
            duration: 200,
        });
        this.spotLight.update(x, y);
    }

    hide() {
        this.setActive(false);
        this.setVisible(false);
        state = "DISABLE";
    }

    unHide() {
        this.setActive(true);
        this.setVisible(true);
        state = "ACTIVE";
    }

    turnOff(){
        this.spotLight.turnOff();
    }

    turnOn(){
        this.spotLight.turnOn();
    }

}
