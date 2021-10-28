import Player from "../components/Player.js";
export default class MainScene extends Phaser.Scene{
    constructor(){
        super({
            key: 'MAINSCENE'
        });
    }
    //Nơi để load các assets trước khi chúng được sử dụng
    preload(){
        this.load.pack('player-asset', 'assets/asset-pack.json');
        this.load.tilemapTiledJSON('lobby', 'assets/lobby.json');
        this.load.image('tileset', 'assets/Map_tiles.png');
    }
    //Nơi để thêm ra các đối tượng như image, text,... cần có trong Scene này
    create(){
        // this.add.image(200, 200, 'shadow').setAlpha(0.3, 0.3, 0.3, 0.3).setBlendMode("MULTIPLY");
        const map = this.make.tilemap({
            key: 'lobby',
            tileHeight: 32,
            tileWidth: 32
        });
        const tilesets = [
            map.addTilesetImage('Map_tiles', 'tileset')
        ];
        const layer = {
            "ground": map.createLayer("ground", tilesets),
            "tier_1": map.createLayer("tier 1", tilesets).setDepth(1)
        }
        
        // let tileset = map.addTilesetImage('tileset-atlas', 'tileset')

        // let groudLayer = map.createLayer('ground', [tileset], 0, 0);
        // this.physics.world.addCollidera
        this.player = new Player(
            {
                scene: this,
                x: 200, 
                y: 200
            });
        this.keys = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
        };
        this.player.create(100, 100);
        this.physics.world.addCollider(this.player, this.createCollisionGroup(layer["tier_1"].layer));
    }
    //Phương thức update sẽ được gọi mỗi lần cho mỗi frame của Scene
    //Đây cũng là nơi để bạn thực hiện hoá các ý tưởng của mình vào game
    update(time, delta){
        this.player.update(this.keys, time, delta);
    }

    createCollisionGroup(layer) {
        console.log(layer.data)
        const walls = this.physics.add.group();
        layer.data.forEach(row => {
            row.forEach(col => {
                col?.getCollisionGroup()?.objects.forEach(e => {
                    const s = this.physics.add.sprite(
                        col.pixelX + e.x + layer.x - col.width / 2,
                        col.pixelY + e.y + layer.y - col.height / 2,
                        null, null)
                        .setOrigin(0, 0)
                        .setSize(e.width, e.height)
                        .setPushable(false)
                        .setImmovable()
                        .setOffset(16, 16)
                        .setVisible(false)
                        .setActive(true);
                    walls.add(s);
                });
            });
        });

        return walls;
    }
}