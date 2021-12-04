export default class InputController{
    constructor(scene){
        this.scene = scene;
    }

    getInputKeysDown(){
        var inputAWSDKeys = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        var inputArrowKeys = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        });

        var inputAnotherKeys = this.scene.input.keyboard.addKeys({
            left_mouse: this.scene.input.activePointer.leftButtonDown(),
            right_mouse: this.scene.input.activePointer.rightButtonDown(),
            shift: this.scene.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.SHIFT
            )
        })


        // var inputKeys = inputAWSDKeys;
        return {inputAWSDKeys, inputAnotherKeys, inputArrowKeys};
    }
}