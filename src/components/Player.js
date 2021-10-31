import Arrows from "./Arrows.js";
export default class Player extends Phaser.GameObjects.Sprite {
    /**
     * 
     * @param {Phaser.Scene} scene 
     */
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.body.setCollideWorldBounds(true);
        this.setScale(3);

        this.speed = 5;
        this.hspd = 0;
        this.vspd = 0;
        this.accel = 0.2;
        this.kindOfAttack = '1';
        this.state = 'idle';

        this.delayAttack = false;
        this.delayRolling = false;
        this.delayShoot = false;

        this.up = 0;
        this.right = 0;

        var rect = new Phaser.Geom.Rectangle(config.x, config.y, 400, 400)
        this.body.setSize(12, 16);
        this.body.setOffset(this.width / 2 - 8, this.height / 2 - 2)
        this.setDepth(1)
    }
    create(x, y) {
        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers('player_idle'),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers('player_run', { start: 13, end: 20 }),
            frameRate: 8,
            repeat: -1
        });
        this.attack_up = this.anims.create({
            key: "attack-1",
            frames: this.anims.generateFrameNumbers('player_attack_up', { start: 26, end: 35 }),
            frameRate: 20,
            repeat: 0
        });
        this.anims.create({
            key: "attack-2",
            frames: this.anims.generateFrameNumbers('player_attack_down', { start: 39, end: 48 }),
            frameRate: 20,
            repeat: 0
        });
        this.anims.create({
            key: "attack-3",
            frames: this.anims.generateFrameNumbers('player_attack_straight', { start: 52, end: 61 }),
            frameRate: 20,
            repeat: 0
        });
        this.anims.create({
            key: "rolling",
            frames: this.anims.generateFrameNumbers('player_rolling', { start: 156, end: 160 }),
            frameRate: 6,
            repeat: 0
        });
        this.anims.create({
            key: "shoot",
            frames: this.anims.generateFrameNumbers('player_shoot', { start: 117, end: 124 }),
            frameRate: 13,
            repeat: 0
        });

        this.shadow = this.scene.add.image(this.x - 5, this.y + this.height + 10, 'shadow').setAlpha(0.3, 0.3, 0.3, 0.3).setBlendMode("MULTIPLY").setDepth(0);
        this.bullet = new Arrows(this.scene, 'arrow_fire');
    }
    update(keys, time, delta) {
        let input = {
            left: keys.left.isDown || this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown,
            right: keys.right.isDown || this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown,
            down: keys.down.isDown || this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown,
            up: keys.up.isDown || this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown,
            left_mouse: this.scene.input.activePointer.leftButtonDown(),
            right_mouse: this.scene.input.activePointer.rightButtonDown(),
            shift: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT).isDown
        };
        this.movement(input);
        this.attack(input);
        this.shoot(input);
        this.rolling(input);
        this.shadowFollow(this.body.x, this.body.y);
    }




    attack(input) {
        if (this.delayAttack) return;
        if (this.delayShoot) return;
        if (input.left_mouse) {
            this.flipByMouse();
            this.state = 'attack';
            this.hspd = 0;
            this.vspd = 0;
            this.delayAttack = true;
            this.play(this.state + '-' + this.kindOfAttack, true).once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.delayAttack = false;
                this.state = 'idle';
                this.removeListener(Phaser.Animations.Events.ANIMATION_COMPLETE);
                if (parseInt(this.kindOfAttack) >= 1 && parseInt(this.kindOfAttack) <= 3) {
                    this.kindOfAttack = parseInt(this.kindOfAttack) + 1;
                }
                if (parseInt(this.kindOfAttack) > 3) {
                    this.kindOfAttack = '1';
                }
            })

        }
    }

    shoot(input) {
        if (this.delayAttack) return;
        if (this.delayShoot) return;

        if (input.right_mouse) {
            this.flipByMouse();
            this.state = 'shoot';
            this.delayShoot = true;

            this.play('shoot', true).once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.delayShoot = false;
                this.state = 'idle';
                this.arrow('FB001');
                this.removeListener(Phaser.Animations.Events.ANIMATION_COMPLETE);
                if (parseInt(this.kindOfAttack) >= 1 && parseInt(this.kindOfAttack) <= 3) {
                    this.kindOfAttack = parseInt(this.kindOfAttack) + 1;
                }
                if (parseInt(this.kindOfAttack) > 3) {
                    this.kindOfAttack = '1';
                }
            })

        }
    }

    arrow(texture) {
        var dirX = this.scene.input.mousePointer.worldX - this.x;
        var dirY = this.scene.input.mousePointer.worldY - this.y;
        this.bullet.setDepth(2);
        
        this.bullet.fireBullet(this.x, this.y + this.body.halfWidth, this.scene.input.mousePointer.worldX, this.scene.input.mousePointer.worldY);
    }

    flipByMouse() {
        if (this.scene.input.mousePointer.worldX - this.x < 0)
            this.setFlipX(true);
        else if (this.scene.input.mousePointer.worldX - this.x > 0)
            this.setFlipX(false);
    }

    movement(input) {
        if (this.state == 'attack' || this.state == 'shoot') {
            return;
        }
        if (this.state == 'rolling') {
            return;
        }
        var x = (input.right - input.left) * this.speed;
        var y = (input.up - input.down) * this.speed;
        this.up = input.up - input.down
        this.hspd = this.approach(this.hspd, x, this.accel);
        this.vspd = this.approach(this.vspd, y, this.accel);
        if (this.hspd > 0) {
            this.setFlipX(false);
            this.play('run', true);
        } else if (this.hspd < 0) {
            this.setFlipX(true);
            this.play('run', true);
        } else if (this.hspd == 0 && this.vspd != 0) {
            this.play('run', true);
        }
        if (this.hspd == 0 && this.vspd == 0) {
            this.play('idle', true);
        }
        this.body.x += this.hspd;
        this.body.y -= this.vspd;

    }

    rolling(input) {
        if (this.delayRolling) return;
        if (this.state != 'rolling' && input.shift) {
            this.right = input.right - input.left;
        }
        if (input.shift || this.state == 'rolling') {

            var y = (this.up) * this.speed * 1.4;
            if (this.right == 0 && this.up == 0)
                var x = (this.flipX ? -1 : 1) * this.speed * 1.4;
            else
                var x = (this.right) * this.speed * 1.4;
            this.state = 'rolling';
            this.hspd = this.approach(this.hspd, x, 1);
            this.vspd = this.approach(this.vspd, y, 1);

            this.body.x += this.hspd;
            this.body.y -= this.vspd;

            this.play('rolling', true).once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.hspd = 0;
                this.vspd = 0;

                this.delayRolling = true;
                this.state = 'idle';
                this.removeListener(Phaser.Animations.Events.ANIMATION_COMPLETE);
                this.scene.time.delayedCall(1000, () => {
                    this.delayRolling = false;
                })
            })
        }
    }

    shadowFollow(x, y) {
        // this.shadow.x = x + this.width * 1.5 + (this.flipX ? 1 : -1) * 5;
        // this.shadow.y = y + this.height * 3;
        this.shadow.x = x + this.height / 1.5 + (this.flipX ? 1 : -1) * 5;
        this.shadow.y = y + this.width + this.body.offset.y;
    }
    approach(a, b, amount) {
        if (a < b) {
            a += amount;
            if (a > b) {
                return b;
            }
        } else {
            a -= amount;
            if (a < b) {
                return b;
            }
        }
        return a;
    }

}