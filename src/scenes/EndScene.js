export default class EndScene extends Phaser.Scene{
    constructor(){
        super({
            key: "ENDSCENE"
        })
    }

    preload(){
        this.load.image("end", "assets/images/end.png");
    }

    create(){
        this.add.image(this.renderer.width / 2, this.renderer.height / 2, "end");

        this.time.delayedCall(10000, () => {
            this.scene.start("MENUSCENE");
        })
    }
}