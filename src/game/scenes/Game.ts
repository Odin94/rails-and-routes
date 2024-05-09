import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { Train } from "../prefabs/Train";
import { Rail } from "../prefabs/Rail";
import { Station } from "../prefabs/Station";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    trains: Train[] = [];
    rails: Rail[] = [];
    stations: Station[] = [];

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        this.gameText = this.add
            .text(
                512,
                384,
                "Make something fun!\nand share it with us:\nsupport@phaser.io",
                {
                    fontFamily: "Arial Black",
                    fontSize: 38,
                    color: "#ffffff",
                    stroke: "#000000",
                    strokeThickness: 8,
                    align: "center",
                }
            )
            .setOrigin(0.5)
            .setDepth(100);

        EventBus.emit("current-scene-ready", this);

        for (let i = 0; i < 10; i++) {
            const rail = new Rail(this, i * 64, 4 * 64, 90);
            this.rails.push(rail);
        }

        const train = new Train(this, -64, 4 * 64);
        train.route = [
            { x: 64, y: 4 * 64, dwellTime: 500 },
            { x: 8 * 64, y: 4 * 64, dwellTime: 500 },
        ];
        this.trains.push(train);
        train.start(this);

        const leftStation = new Station(this, 64, 3 * 64);
        const rightStation = new Station(this, 8 * 64, 3 * 64);
        this.stations.push(leftStation);
        this.stations.push(rightStation);
    }

    changeScene() {
        this.scene.start("GameOver");
    }

    update(time: number, delta: number) {
        for (const train of this.trains) {
            train.update(this, delta);
        }
    }
}

