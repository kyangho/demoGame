export default class TestScene extends Phaser.Scene {
    constructor() {
        super({
            key: "TESTSCENE",
        });
    }

    preload() {}
    create() {
        var swordOffset = 30;
        var body = this.add.rectangle(100, 100, 50, 50, 0x000000);
        var sword = this.add
            .rectangle(
                body.x + body.width / 2 + swordOffset,
                body.y,
                10,
                100,
                0x333333
            )
            .setOrigin(1, 1);
        var attack = this.tweens.createTimeline();

        const a = attack.add({
            targets: [body, sword],
            x: function (target, targetKey, value, targetIndex, totalTargets, tween){
                return value + 100;
            },
            ease: "Linear",
            duration: 400,
        });
        // attack.add({
        //     targets: body,
        //     x: body.x + 100,
        //     ease: "Linear",
        //     duration: 400,
        // });
        attack.add({
            targets: sword,
            angle: 90,
            yoyo: true,
            duration: 300
        });
        attack.play();
    }
}
