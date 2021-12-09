

export default class MenuScene extends Phaser.Scene{
    constructor(){
        super({
            key: 'MENUSCENE' 
        });
    }
    init(){

    }
    preload(){
        this.load.image("cheems", "assets/images/cheems_bonk.png");
        this.load.image("bg", "assets/images/thinking.png");
    }

    create(){
        this.input.mouse.disableContextMenu();
        var title = this.add.text(this.renderer.width / 2, this.renderer.height * 0.1, 'nâm du kí', {fontSize: 50, fontStyle: 'bold'}).setDepth(1).setOrigin(0.5, 0.5);
        var bg = this.add.image(this.renderer.width / 2, this.renderer.height / 2, "bg").setOrigin(0.5, 0.5).setDepth(0);
        bg.setScale(this.renderer.width / bg.displayWidth)
        var playButton = this.add.text(this.renderer.width / 2, this.renderer.height * 0.5, 'Chơi luôn', {fontSize: 30, fontStyle: 'bold'}).setDepth(1).setOrigin(0.5, 0.5);
        var star = this.add.image(0, 0, 'cheems').setVisible(false).setScale(0.5);
        playButton.setInteractive();
        this.add.rectangle(this.renderer.width / 2, this.renderer.height * 0.1, title.displayWidth, title.height, 0xff0000).setOrigin(0.5, 0.5).setDepth(0)
        this.add.rectangle(this.renderer.width / 2, this.renderer.height * 0.5, playButton.displayWidth, playButton.height, 0xff0000).setOrigin(0.5, 0.5).setDepth(0)
        playButton.on('pointerover', () =>{
            star.setVisible(true);
            star.setX(playButton.x - playButton.width / 2 - 30);
            star.setY(playButton.y);
        })
        playButton.on('pointerdown', () =>{
            this.scene.start('MAINSCENE');
        })
        playButton.on('pointerout', () =>{
            star.setVisible(false);
        })


    }
}