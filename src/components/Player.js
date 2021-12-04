var spawnX;
var spawnY;

var offsetY = 100;
var maxspeed = 10;
export default class Player extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.scene.add.existing(this);

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        this.playerCollider = Bodies.circle(this.x, this.y + 10, 6, {
            isSensor: false,
            label: "playerCollider",
        });
        this.playerSensor = Bodies.circle(this.x, this.y, 24, {
            isSensor: true,
            label: "playerSensor",
        });
        const compoundBody = Body.create({
            parts: [this.playerCollider, this.playerSensor],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
        this.setCollisionCategory(2);
        spawnX = this.x;
        spawnY = this.y;

        this.speed = 1.7;
        this.hspd = 0;
        this.vspd = 0;
        this.accel = 0.5;
        this.kindOfAttack = "1";
        this.state = "idle";

        this.delayAttack = false;
        this.delayRolling = false;
        this.delayShoot = false;

        this.up = 0;
        this.right = 0;

        this.create();
        this.setOrigin(0.5, 0.5)
    }

    static preload(scene) {
       
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
        this.anims.create({
            key: "player_run_anims",
            frames: this.anims.generateFrameNumbers("player_run_anims", {
                start: 13,
                end: 20,
            }),
            frameRate: 8,
            repeat: -1,
        });
        this.attack_up = this.anims.create({
            key: "player_attack_1_anims",
            frames: this.anims.generateFrameNumbers("player_attack_up_anims", {
                start: 26,
                end: 35,
            }),
            frameRate: 20,
            repeat: 0,
        });
        this.anims.create({
            key: "player_attack_2_anims",
            frames: this.anims.generateFrameNumbers("player_attack_down_anims", {
                start: 39,
                end: 48,
            }),
            frameRate: 20,
            repeat: 0,
        });
        this.anims.create({
            key: "player_attack_3_anims",
            frames: this.anims.generateFrameNumbers("player_attack_straight_anims", {
                start: 52,
                end: 61,
            }),
            frameRate: 20,
            repeat: 0,
        });
        this.anims.create({
            key: "player_rolling_anims",
            frames: this.anims.generateFrameNumbers("player_rolling_anims", {
                start: 156,
                end: 160,
            }),
            frameRate: 6,
            repeat: 0,
        });
        this.anims.create({
            key: "player_shoot_anims",
            frames: this.anims.generateFrameNumbers("player_shoot_anims", {
                start: 117,
                end: 124,
            }),
            frameRate: 13,
            repeat: 0,
        });
        this.anims.create({
            key: "player_death_anims",
            frames: this.anims.generateFrameNumbers("player_shoot_anims", {
                start: 91,
                end: 97,
            }),
            frameRate: 5,
            repeat: 0,
        });
    }
    get velocity() {
        return this.body.velocity;
    }

    update(time, delta) {
        let input = {
            left:
                this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT).isDown ||
                this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown,
            right:
                this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT).isDown ||
                this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown,
            down:
                this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN).isDown ||
                this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown,
            up:
                this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP).isDown ||
                this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown,
            left_mouse: this.scene.input.activePointer.leftButtonDown(),
            right_mouse: this.scene.input.activePointer.rightButtonDown(),
            shift: this.scene.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.SHIFT
            ).isDown,
        };
        if(this.state != "dead"){
            this.movement(input);
            this.rolling(input);
            this.attack(input)
        }
    }
//================================================ANOTHER FUNCTION==================================================================
    dead() {
        this.state = "dead";
        this.anims.play("player_death_anims", true).once("animationcomplete", () => {
            this.setVisible(false);
            this.setActive(false);
            this.scene.time.addEvent({
                delay: 5000,
                callback: () => {
                    this.setVisible(true);
                    this.setActive(true);
                    this.state = "idle";
                    this.x = spawnX;
                    this.y = spawnY;
                    this.scene.sound.play("revive_sound", {
                        volume: 0.5,
                    });
                },
            });
        })

    }
    attack(input) {
        if (this.delayAttack) return;
        if (this.delayShoot) return;
        if (input.left_mouse) {
            this.flipByMouse();
            this.state = "attack";
            this.hspd = 0;
            this.vspd = 0;
            this.delayAttack = true;
            this.play("player_attack_" + this.kindOfAttack + "_anims", true).once(
                Phaser.Animations.Events.ANIMATION_COMPLETE,
                () => {
                    this.delayAttack = false;
                    this.state = "idle";
                    this.removeListener(
                        Phaser.Animations.Events.ANIMATION_COMPLETE
                    );
                    if (
                        parseInt(this.kindOfAttack) >= 1 &&
                        parseInt(this.kindOfAttack) <= 3
                    ) {
                        this.kindOfAttack = parseInt(this.kindOfAttack) + 1;
                    }
                    if (parseInt(this.kindOfAttack) > 3) {
                        this.kindOfAttack = "1";
                    }
                }
            );
        }
    }

    shoot(input) {
        if (this.delayAttack) return;
        if (this.delayShoot) return;

        if (input.right_mouse) {
            this.flipByMouse();
            this.state = "shoot";
            this.delayShoot = true;

            this.play("player_shoot_anims", true).once(
                Phaser.Animations.Events.ANIMATION_COMPLETE,
                () => {
                    this.delayShoot = false;
                    this.state = "idle";
                    this.arrow("FB001");
                    this.removeListener(
                        Phaser.Animations.Events.ANIMATION_COMPLETE
                    );
                    if (
                        parseInt(this.kindOfAttack) >= 1 &&
                        parseInt(this.kindOfAttack) <= 3
                    ) {
                        this.kindOfAttack = parseInt(this.kindOfAttack) + 1;
                    }
                    if (parseInt(this.kindOfAttack) > 3) {
                        this.kindOfAttack = "1";
                    }
                }
            );
        }
    }

    arrow(texture) {
        var dirX = this.scene.input.mousePointer.worldX - this.x;
        var dirY = this.scene.input.mousePointer.worldY - this.y;
        this.bullet.setDepth(2);

        this.bullet.fireBullet(
            this.x,
            this.y + this.body.halfWidth,
            this.scene.input.mousePointer.worldX,
            this.scene.input.mousePointer.worldY
        );
    }

    flipByMouse() {
        if (this.scene.input.mousePointer.worldX - this.x < 0)
            this.setFlipX(true);
        else if (this.scene.input.mousePointer.worldX - this.x > 0)
            this.setFlipX(false);
    }

    movement(inputKeys) {
        if (this.state == "attack" || this.state == "shoot") {
            return;
        }
        if (this.state == "rolling") {
            return;
        }
        if (this.state == "dead"){
            return;
        }
        this.state = "run"
        var x = (inputKeys.right - inputKeys.left) * this.speed;
        var y = (inputKeys.up - inputKeys.down) * this.speed;
        this.up = inputKeys.up - inputKeys.down;
        this.hspd = this.approach(this.hspd, x, this.accel);
        this.vspd = this.approach(this.vspd, y, this.accel);
        if (this.hspd > 0) {
            this.setFlipX(false);
            this.play("player_run_anims", true);
        } else if (this.hspd < 0) {
            this.setFlipX(true);
            this.play("player_run_anims", true);
        } else if (this.hspd == 0 && this.vspd != 0) {
            this.play("player_run_anims", true);
        }
        if (this.hspd == 0 && this.vspd == 0) {
            this.play("player_idle_anims", true);
            this.state = "idle"
        }
        this.x += this.hspd;
        this.y -= this.vspd;
    }

    rolling(input) {
        if (this.delayRolling) return;
        if (this.state != "rolling" && input.shift) {
            this.right = input.right - input.left;
        }
        if (input.shift || this.state == "rolling") {
            var y = this.up * this.speed * 1.4;
            if (this.right == 0 && this.up == 0)
                var x = (this.flipX ? -1 : 1) * this.speed * 1.4;
            else var x = this.right * this.speed * 1.4;
            this.state = "rolling";
            this.hspd = this.approach(this.hspd, x, 1);
            this.vspd = this.approach(this.vspd, y, 1);

            this.body.x += this.hspd;
            this.body.y -= this.vspd;

            this.play("player_rolling_anims", true).once(
                Phaser.Animations.Events.ANIMATION_COMPLETE,
                () => {
                    this.hspd = 0;
                    this.vspd = 0;

                    this.delayRolling = true;
                    this.state = "idle";
                    this.removeListener(
                        Phaser.Animations.Events.ANIMATION_COMPLETE
                    );
                    this.scene.time.delayedCall(1000, () => {
                        this.delayRolling = false;
                    });
                }
            );
        }
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
