var text;
var textPointer;
var offsetY = 150;
export default class Sharing extends Phaser.Scene{
    constructor(){
        super({
            key: "Sharing",
        });
    }

    preload(){

    }

    create(){
        text = this.add.text(20, 20, "Time: ", {
            fontSize: 20,
            color: "#000",
            fontStyle: "bold"
        });

        var rectangle = this.add.rectangle(100, 100, 100, 30, 0x00000, 1)
        

















        textPointer = this.add.text(20, 150, "Pointer down: false", {color: "#000",});
        this.input.on("pointerdown", () => {
            textPointer.setText("Pointer down: true");
        })
        this.input.on("pointerup", () => {
            textPointer.setText("Pointer down: false");
        })



























        this.events.on("earthquake", () => {
            //earthquake
            this.tweens.add({
                targets: rectangle,
                y: 120,
                ease: "Bounce",
                duration: 300,
                yoyo: true
            })
            this.add.text(20, offsetY, parseInt(this.time.now), {color: "#000",});
            offsetY += 20;
        }, this);

        this.time.addEvent({
            callback: () => {
                this.events.emit("earthquake")
            },
            delay: 2000,
            loop: true
        })

        
    }

    update(time, delta){
        text.setText("Time: " + parseInt(time))

    }
}