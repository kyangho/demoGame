import { Mrpas } from "../../node_modules/mrpas/src/index.js";
import Player from "../components/Player.js";
export default class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MAINSCENE'
        });
    }
    //Nơi để load các assets trước khi chúng được sử dụng
    preload() {
        this.load.pack('player-asset', 'assets/asset-pack.json');
        this.load.tilemapTiledJSON('lobby', 'assets/lobby.json');
        this.load.image('tileset', 'assets/Map_tiles.png');
        this.load.audio('bg_sound', 'assets/sound.mp3');
    }
    //Nơi để thêm ra các đối tượng như image, text,... cần có trong Scene này
    create() {
        this.anims.create({
            key: 'arrow_fire',
            frames: [
                { key: 'FB001' },
                { key: 'FB002' },
                { key: 'FB003' },
                { key: 'FB004' },
                { key: 'FB005' }
            ],
            frameRate: 10,
            repeat: -1
        })
        this.input.mouse.disableContextMenu();

        // this.add.image(200, 200, 'shadow').setAlpha(0.3, 0.3, 0.3, 0.3).setBlendMode("MULTIPLY");
        this.map = this.make.tilemap({
            key: 'lobby',
            tileHeight: 32,
            tileWidth: 32
        });
        this.tilesets = [
            this.map.addTilesetImage('Map_tiles', 'tileset')
        ];
        this.layer = {
            "ground": this.map.createLayer("ground", this.tilesets),
            "tier_1": this.map.createLayer("tier 1", this.tilesets).setDepth(1)
        }
        this.fov = new Mrpas(this.game.config.maxWidth, this.game.config.maxHeight, (x, y) => {
            const tile = this.layer["ground"].getTileAt(x, y);
            return tile && !tile.collides
        })



        // let tileset = map.addTilesetImage('tileset-atlas', 'tileset')

        // let groudLayer = map.createLayer('ground', [tileset], 0, 0);
        // this.physics.world.addCollidera
        this.player = new Player(
            {
                scene: this,
                x: 500,
                y: 400
            });
        this.keys = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
        };
        this.player.create(500, 400 );
        this.physics.world.addCollider(this.player, this.createCollisionGroup(this.layer["tier_1"].layer));
        var background_sound = this.sound.add('bg_sound',{
            volume: 0.3,
            loop: true
        })
        background_sound.play();
    }
    //Phương thức update sẽ được gọi mỗi lần cho mỗi frame của Scene
    //Đây cũng là nơi để bạn thực hiện hoá các ý tưởng của mình vào game
    update(time, delta) {
        this.player.update(this.keys, time, delta);
        this.computeFOV();
    }

    createCollisionGroup(layer) {
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
    
    computeFOV() {
        if (!this.fov || !this.map || !this.layer["ground"] || !this.player) {
            return
        }
        // get camera view bounds
        const camera = this.cameras.main
        const bounds = new Phaser.Geom.Rectangle(
            this.map.worldToTileX(camera.worldView.x) - 1,
            this.map.worldToTileY(camera.worldView.y) - 1,
            this.map.worldToTileX(camera.worldView.width) + 2,
            this.map.worldToTileX(camera.worldView.height) + 3
        )

        // set all tiles within camera view to invisible
        for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
            for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
                if (y < 0 || y >= this.map.height || x < 0 || x >= this.map.width) {
                    continue
                }
                
                const tile = this.layer["ground"].getTileAt(x, y)
                if (!tile) {
                    continue
                }
                
                tile.alpha = 1;
                tile.tint = 0x404040
                // tile.tint = 0xffffff

            }
        }
        
        const px = this.map.worldToTileX(this.player.x)
        const py = this.map.worldToTileY(this.player.y)
        
        // compute fov from player's position
        const PI = 3.1415926535;
        this.fov.compute(
            px,
            py,
            6,
            (x, y) => {
                for (let y1 = y - r; y1 < y + r; y1++) {
                    for (let x1 = x - r; x1 < x + r; x1++) {
                        const tile = this.layer["ground"].getTileAt(x1, y1)
                        if (!tile) {
                            return false
                        }
                        return tile.tint = 0xffffff
                    }
                }
            },
            (x, y) => {
                var r = 6;
                for (let y1 = y - r; y1 < y + r; y1++) {
                    for (let x1 = x - r; x1 < x + r; x1++) {
                        if (y1 < 0 || y1 >= this.map.height || x1 < 0 || x1 >= this.map.width) {
                            continue
                        }
        
                        const tile = this.layer["ground"].getTileAt(x1, y1)
                        if (!tile) {
                            continue
                        }
        
                        const d = Phaser.Math.Distance.Between(py, px, y1, x1)
                        const alpha = Math.min(2 - d / 4.5, 1)

                        tile.alpha = alpha
                        tile.tint = 0xffffff
                    }
                }
            }
        )
    }
}