import MainScene from "./scenes/MainScene.js";
import MathGame from "./scenes/MathGameScene.js";
import Sharing from "./scenes/Sharing.js";
import TestScene from "./scenes/TestScene.js";
const config = {
    width: 660,
    height: 340,
    backgroundColor: "#00000",
    type: Phaser.AUTO,
    scene: [MainScene, MathGame],
    scale: {
        zoom: 1,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: "matter",
        matter: {
            debug: true,
            gravity: { y: 0.5 },
        },
    },
    pixelArt: true,
};

const game = new Phaser.Game(config);
