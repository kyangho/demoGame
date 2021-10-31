// import { Sound } from "./lib/phaser";
// 

var vector;

class Arrow extends Phaser.Physics.Arcade.Sprite {
    #vector;
    #fx;
    constructor(scene, x, y) {
        super(scene, x, y, 'FB001');
        // this.#fx = new Phaser.Sound.BaseSound(this.scene, 'pew');
        //    this.#fx = this.scene.sound.add('meo');
    }

    create() {
    }

    fire(x1, y1, x2, y2) {
        //    this.#fx.play();
        // this.create();
        // this.anims.play('arrow_fire', true);
        this.body.reset(x1, y1);
        this.setActive(true);
        this.setVisible(true);
        this.setScale(1, 1);
        //    this.setAngularVelocity(400);
        var rad = Phaser.Math.Angle.Between(x1, y1, x2, y2);
        this.rotation = Phaser.Math.RadToDeg(rad);
        this.setAngle(Phaser.Math.RadToDeg(rad))
        this.#vector = new Phaser.Math.Vector2(x2 - x1, y2 - y1);
        this.#vector.normalize();
        // vector.lerp({x1, y1}, 0.5);

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.body.setVelocity(this.#vector.x * 450, this.#vector.y * 450);
        if (this.y <= 0 || this.x <= 0 || this.y >= 2000 || this.x >= 2000) {
            this.setActive(false);
            this.setVisible(false);
            this.destroy(true);
            
        }
        

    }
}

export default class Arrows extends Phaser.Physics.Arcade.Group {
    constructor(scene, texture) {
        super(scene.physics.world, scene);
        
        this.bullets = this.createMultiple({
            key: 'arrow',
            frame: 'arrow_fire',
            active: false,
            visible: false,
            classType: Arrow
        });

    }
    fireBullet(x1, y1, x2, y2) {
        let bullet = this.getFirstDead(true);

        if (bullet) {
            bullet.create()
            bullet.fire(x1, y1, x2, y2);
            
        }
        this.playAnimation('arrow_fire')
        // var bullet = bullets.getFirstDead();

        // bullet.reset(sprite.x - 8, sprite.y - 8);
    }
}