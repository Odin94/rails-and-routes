import { EventBus } from "../EventBus";
import { Scene, Cameras, GameObjects } from "phaser";
import { Train } from "../prefabs/Train";
import { Rail, buildRailNetwork, createStraightRailway } from "../prefabs/Rail";
import { Station } from "../prefabs/Station";
import { absDiffGridPos, findPath, sameGridPos } from "../utils";

export class Game extends Scene {
    camera: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    gameText: GameObjects.Text;

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

        // Create rail network where rails know their neighbors and stations -> paths can be graph searched
        // Build routes based on stations

        EventBus.emit("current-scene-ready", this);

        this.rails.push(
            ...createStraightRailway(this, { x: 0, y: 4 }, { x: 10, y: 4 }),
            ...createStraightRailway(this, { x: 4, y: 5 }, { x: 4, y: 10 })
        );

        const train = new Train(this, 0, 4 * 64);
        train.route = [
            { stationName: "Leftington" },
            { stationName: "Centropton" },
            { stationName: "Bolevian" },
            // // Left station
            // { x: 64, y: 4 * 64, dwellTime: 500 },

            // // switch + bottom station
            // { x: 4 * 64, y: 4 * 64, dwellTime: 0 },
            // { x: 4 * 64, y: 8 * 64, dwellTime: 500 },
            // { x: 4 * 64, y: 4 * 64, dwellTime: 0 },

            // // right station
            // { x: 8 * 64, y: 4 * 64, dwellTime: 500 },
        ];
        this.trains.push(train);
        this.stations.push(
            ...[
                new Station(this, "Leftington", 64, 3 * 64),
                new Station(this, "Centropton", 8 * 64, 3 * 64),
                new Station(this, "Bolevian", 3 * 64, 8 * 64),
            ]
        );

        buildRailNetwork(this.rails, this.stations);
        const railUnderTrain = this.rails.find((r) => sameGridPos(train, r));
        if (!railUnderTrain)
            throw new Error(
                `Rail under train is undefined for train with coords: ${train.gridX} / ${train.gridY}`
            );
        const activePath = findPath(
            railUnderTrain,
            train.route[2].stationName,
            this.rails
        );
        train.start(this, activePath);
        console.log({
            rails: this.rails.map((r) => {
                return {
                    x: r.gridX,
                    y: r.gridY,
                    n: r.neighbours,
                    s: r.connectedStation?.name,
                };
            }),
        });
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

