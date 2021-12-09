var spawnX;
var spawnY;

var offsetY = 100;
var maxspeed = 10;

var reviveTime = 2000;
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

        this.setIgnoreGravity(true)
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
            frames: this.anims.generateFrameNumbers("player_death_anims", {
                start: 91,
                end: 97,
            }),
            frameRate: 5,
            repeat: 0,
        });
        this.anims.create({
            key: "player_hurt_anims",
            frames: this.anims.generateFrameNumbers("player_hurt_anims", {
                start: 78,
                end: 81,
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

        if(this.state == "dead" || this.state == "wait"){
        }else{
            this.movement(input);
            this.rolling(input);
            this.attack(input)
        }
    }
//================================================ANOTHER FUNCTION==================================================================
    dead() {
        this.state = "dead";
        this.scene.sound.play("deathSound");
        this.anims.play("player_death_anims", true).once("animationcomplete", () => {
            this.setVisible(false);
            this.setActive(false);
            this.revivalPlayer();
        })

    }
    deadBounce() {
        this.state = "dead";
        this.scene.sound.play("deathSound");

        var originPlayer = this;

        this.anims.play("player_hurt_anims");
        this.anims.pause(this.anims.currentAnim.frames[3]);

        this.deactiveBody()
        var bouceTween = this.scene.tweens.add({
            targets: this,
            props:{
                x: {
                    value: this.x + 100,
                    duration: 1000,
                    ease: "Linear",
                },
                y: {
                    value: this.scene.renderer.height / 2,
                    duration: 1000,
                    ease: "Linear", 
                },
                scale: {
                    value: 14,
                    duration: 1000,
                    ease: "Linear"
                },
                angle: {
                    value: 360 * 10,
                    duration: 1000,
                    ease: "Sine"
                }
            }
        }).once("complete", () => {
            this.scene.cameras.main.stopFollow();
            this.scene.tweens.add({
                targets: this,
                y: this.scene.cameras.main.height + this.height * 5,
                duration: 2000,
                ease: "Linear"
            }).once("complete", () => {
                this.setActive(false);
                this.setVisible(false);
                this.scale = bouceTween.data[2].start;
                this.revivalPlayer();
            })
        })
    }

    deadByLam(){
        var offsetX = 20;
        var offsetY = -20
        if (this.state == "dead"){
            return;
        }
        this.state = "dead";

        this.anims.play("player_hurt_anims");
        this.anims.pause(this.anims.currentAnim.frames[3]);
        this.deactiveBody();
        var sound = this.scene.sound.add("headache");
        var video = this.scene.add.video(this.x, this.y + offsetY, "aLam_video").setScale(0.3, 0.3).play(true);
        var video_bg = this.scene.add.video(this.scene.cameras.main.x + this.scene.cameras.main.width / 2
                                          , this.scene.cameras.main.y + this.scene.cameras.main.height / 2
                                          , "highBackground").setScale(3, 3).play().setVolume(0).setDepth(30).setAlpha(0.05);
        var flipX = 1 * 2;
        var randomNumber = 30;
        var lamTweenX = this.x;
        var lamTweenFlipX = 1;
        var lamTween = this.scene.tweens.add({
            targets: video,
            x: video.x + randomNumber * flipX,
            y: video.y + Math.floor(Math.random() * randomNumber * flipX),
            ease: "Linear",
            loop: 5,
            duration: 1000,
            onLoop: () => {
                lamTweenFlipX = -lamTweenFlipX;
                lamTween.data[0].end = lamTween.data[0].start + randomNumber * lamTweenFlipX;
                lamTween.data[1].end = video.y + Math.floor(Math.random() * randomNumber) * lamTweenFlipX;
            }
        })

        this.scene.time.delayedCall(4000, () => {
            var tween = this.scene.tweens.add({
                targets: this,
                x: this.x + flipX,
                repeat: -1,
                duration: 50,
                onRepeat: () => {
                    flipX = -flipX;
                    tween.data[0].end = this.x + flipX;
                }
            })
            sound.play();
            sound.once("complete", () => {
                this.scene.sound.play("balloonDeflating");
                this.scene.tweens.add({
                    targets: this,
                    y: this.y - this.scene.cameras.main.height,
                    ease: "Linear",
                    duration: 1000
                }).once("complete", () => {
                    this.scene.sound.play("balloonPop");
                    this.setActive(false);
                    this.setVisible(false);
                    this.revivalPlayer();
                    video.destroy();
                    video_bg.destroy();
                    tween.remove();
                })
            })
        })
    }

    deadByCheemsBonk(){
        if (this.state == "dead"){
            return;
        }
        this.state = "dead";
        this.anims.play("player_idle_anims");
        this.anims.pause(this.anims.currentAnim.frames[2]);
        this.setActive(false);
        this.deactiveBody();
        var offsetY = -30;
        var offsetX = -120;
        var angle = 45;

        var cheems = {
            image: this.scene.add.image(this.x + offsetX, this.y + offsetY, "cheemsBonk_image").setOrigin(0.2, 0.8).setDepth(100),
            sound: this.scene.sound.add("cheemsBonk_audio"),
        };
        if (this.x < 200){
            cheems.image.setFlipX(true);
            angle = -angle;
            cheems.image.setOrigin(0.8, 0.8)
            cheems.image.setX(this.x + cheems.image.width + offsetX / 2)
        }
        cheems.sound.play();
        this.scene.time.delayedCall(900, () => {
            this.scene.tweens.add({
                targets: cheems.image,
                angle: angle,
                duration: 100,
            }).once("complete", () => {
                this.setScale(1, 0.4);
                this.scene.tweens.add({
                    targets: cheems.image,
                    angle: 0,
                    duration: 1000,
                }).once("complete", () => {
                    this.setVisible(false);
                    this.setScale(1, 1);
                    cheems.image.destroy();
                    cheems.sound.destroy();
                    this.revivalPlayer();
                })
            })
        })
    }

    deadBySimp(){
        if (this.state == "dead"){
            return;
        }
        this.state = "dead";
        this.anims.play("player_idle_anims");
        this.anims.pause(this.anims.currentAnim.frames[2]);
        this.deactiveBody();

        this.setFlipX(false);
        var heart = this.scene.add.image(this.x, this.y + 6, "heart").setScale(0.5).setDepth(100);
        var chold = this.scene.add.video(this.x + 90, this.y, "chold").setScale(0.4).setDepth(90).play();

        var heartOffset = {
            x: 10,
            y: -6,
        }

        if (this.x > 800){
            heartOffset.x = -heartOffset.x;
            chold.x = this.x - 90;
        }
        this.scene.tweens.add({
            targets: heart,
            x: heart.x + heartOffset.x,
            y: heart.y + heartOffset.y,
            scaleX: 0.3,
            scaleY: 1,
            ease: "Sine.easeOut",
            duration: 500,
            loop: 5,
            yoyo: true,
        }).once("complete", () => {
            this.scene.tweens.add({
                targets: heart,
                x: heart.x + heartOffset.x,
                y: heart.y + heartOffset.y,
                scaleX: 0.3,
                scaleY: 1,
                ease: "Sine.easeOut",
                duration: 200,
                loop: 7,
                yoyo: true,
            }).once("complete", () => {
                this.scene.sound.play("balloonPop");
                heart.destroy();
                this.anims.resume();
                this.anims.play("player_death_anims", true).once("animationcomplete", () => {
                    this.setVisible(false);
                    this.setActive(false);
                    this.revivalPlayer();
                    chold.destroy();
                })
            })
        })
    }

    deadByChimo(){
        if (this.state == "dead"){
            return;
        }
        this.state = "dead";
        this.anims.play("player_hurt_anims");
        this.anims.pause(this.anims.currentAnim.frames[3]);
        this.deactiveBody();
        this.setFlipX(false);
        var chimo = this.scene.add.video(this.x, this.y, "hieuchimo").setOrigin(0.85, 0.80).setScale(0.4).setDepth(19).play();

        var playerOffset = {
            x: 23,
            y: -10,
        }
        this.scene.time.delayedCall(3760, () => {
            var chimoTween = this.scene.tweens.add({
                targets: this,
                x: this.x + playerOffset.x,
                y: this.y + playerOffset.y,
                ease: "Power2",
                duration: 150,
                yoyo: true,
                loop: 21,
            })
            chimo.once("complete", () => {
                chimoTween.remove();
                chimo.destroy();
                this.anims.play("player_death_anims", true).once("animationcomplete", () => {
                    this.setVisible(false);
                    this.setActive(false);
                    this.revivalPlayer();
                })
            })
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

    deactiveBody(){
        this.body.isSleeping = true;
        this.body.isSensor = true;
    }

    activeBody(){
        this.body.isSleeping = false;
        this.body.isSensor = false;
    }

    revivalPlayer(){
        if (this.state == "revival"){
            return;
        }
        this.scene.scene.restart();
        this.scene.time.addEvent({
            delay: reviveTime,
            callback: () => {
                this.state = "revival";
                this.setVisible(true);
                this.setActive(true);
                this.activeBody();  
                this.scene.cameras.main.startFollow(this, false, 0.05, 0.05);
                this.state = "idle";
                this.x = spawnX;
                this.y = spawnY;
                this.scene.sound.play("revivalSound", {
                    volume: 0.5,
                });
            },
        });
    }

    setState(state){
        this.state = state;
    }
}
