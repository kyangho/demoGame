var state = "ACTIVE";

export default class Light extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.scene.add.existing(this);
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        this.collider = Bodies.circle(this.x, this.y, 0, {
            isSensor: true,
            label: "",
        });
        const compoundBody = Body.create({
            parts: [this.collider],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
    }

    preload(scene) {
        scene.load.image("mask", "assets/images/mask1.png");
    }

    create(scene) {
        //init light x, y

        this.setScale(2, 2);
        //change sprite cua mask

        this.scene.tweens.add({
            targets: this,
            alpha: 0.1,
            ease: "Linear",
            yoyo: true,
            repeat: -1,
            duration: 1000,
        });
        this.light = this.scene.lights.addLight(97, 100, 100).setIntensity(1);
        this.setDepth(20);
        //change light
        this.scene.tweens.add({
            targets: this.light,
            radius: 70,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
            duration: 1000,
        });
        this.light.tint = 0xffffff;

        this.lightMove = this.scene.tweens.add({
            targets: this.light,
            ease: "Linear",
            repeat: -1,
            duration: 80,
        });
    }

    update(x, y) {
        if (state == "DISABLE") {
            return;
        }
        this.lightMove = this.scene.tweens.add({
            targets: this.light,
            x: x,
            y: y,
            ease: "Linear",
            duration: 200,
        });
    }

    turnOff() {
        this.light.setVisible(false);
        this.setActive(false);
        this.setVisible(false);
        state = "ACTIVE";
    }

    turnOn() {
        this.light.setVisible(true);
        this.setActive(true);
        this.setVisible(true);
        state = "DISABLE";
    }
}
