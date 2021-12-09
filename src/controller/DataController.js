class PlayerData{
    constructor(){
        this.score = 0;
        this.spawnXY = 
            {
                x: 100,
                y: 100
            }
    }

    setScore(score){
        this.score = score;
    }

    setSpawnXY(x, y){
        this.spawnXY.x = x;
        this.spawnXY.y = y;
    }

}
class SceneData{
    constructor(scene){
        this.scene = scene;
        this.skyState = {
            night: {
                id: 0,
                duration: 7000,
                r: 21 / 255,
                g: 40 / 255,
                b: 82 / 255,
            },
            sunrise: {
                id: 1,
                duration: 2000,
                r: 249 / 255,
                g: 152 / 255,
                b: 62 / 255,
            },
            day: {
                id: 2,
                duration: 10000,
                r: 200 / 255,
                g: 200 / 255,
                b: 200 / 255,
            },
            launch: {
                id: 3,
                duration: 2000,
                r: 250 / 255,
                g: 250 / 255,
                b: 250 / 255,
            },
            sunset: {
                id: 4,
                duration: 3000,
                r: 252 / 255,
                g: 156 / 255,
                b: 84 / 255,
            },
        };
    }

    createTimelineSkyState(){
        var skyState = this.skyState;
        var timeline = this.scene.tweens.createTimeline({
            repeat: -1,
        });
        
        timeline.add({
            targets: this.scene.lights.ambientColor,
            r: skyState.night.r,
            b: skyState.night.b,
            g: skyState.night.g,
            ease: "Linear",
            duration: skyState.night.duration,
        });
        timeline.add({
            targets: this.scene.lights.ambientColor,
            r: skyState.sunrise.r,
            b: skyState.sunrise.b,
            g: skyState.sunrise.g,
            ease: "Linear",
            duration: skyState.sunrise.duration,
        });
        timeline.add({
            targets: this.scene.lights.ambientColor,
            r: skyState.day.r,
            b: skyState.day.b,
            g: skyState.day.g,
            ease: "Linear",
            duration: skyState.day.duration,
        });
        timeline.add({
            targets: this.scene.lights.ambientColor,
            r: skyState.launch.r,
            b: skyState.launch.b,
            g: skyState.launch.g,
            ease: "Linear",
            duration: skyState.launch.duration,
        });
        timeline.add({
            targets: this.scene.lights.ambientColor,
            r: skyState.sunset.r,
            b: skyState.sunset.b,
            g: skyState.sunset.g,
            ease: "Linear",
            duration: skyState.sunset.duration,
        });
        timeline.add({
            targets: this.scene.lights.ambientColor,
            r: skyState.night.r,
            b: skyState.night.b,
            g: skyState.night.g,
            ease: "Linear",
            duration: skyState.night.duration / 2,
        });
        timeline.loop = -1;
        timeline.play();
        return timeline;
    }
}
export default class DataController{
    constructor(scene){
        this.playerData = new PlayerData();
        this.sceneData = new SceneData(scene);   
    }
}