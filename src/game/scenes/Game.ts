import { EventBus } from "../EventBus";
import { Scene, Cameras, GameObjects } from "phaser";
import { Train } from "../prefabs/Train";
import { Rail, buildRailNetwork, createStraightRailway } from "../prefabs/Rail";
import { Station } from "../prefabs/Station";
import { absGridPosDiff, findPath, sameGridPos } from "../utils";

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

        EventBus.emit("current-scene-ready", this);

        this.rails.push(
            // Left T
            ...createStraightRailway(this, { x: 0, y: 4 }, { x: 11, y: 4 }),
            ...createStraightRailway(this, { x: 4, y: 4 }, { x: 4, y: 10 }),
            // Center-right +
            ...createStraightRailway(this, { x: 4, y: 7 }, { x: 14, y: 7 }),
            ...createStraightRailway(this, { x: 10, y: 4 }, { x: 10, y: 10 })
        );

        const train = new Train(this, 0, 4 * 64);
        train.route = [
            { stationName: "Leftington" },
            { stationName: "Centropton" },
            { stationName: "Bolevian" },
        ];
        this.trains.push(train);

        const train2 = new Train(this, 12 * 64, 7 * 64);
        train2.route = [
            { stationName: "Centropton" },
            { stationName: "Mesenter" },
        ];
        this.trains.push(train2);

        this.stations.push(
            ...[
                new Station(this, "Leftington", 64, 3 * 64),
                new Station(this, "Centropton", 8 * 64, 3 * 64),
                new Station(this, "Mesenter", 8 * 64, 6 * 64),
                new Station(this, "Bolevian", 3 * 64, 9 * 64),
            ]
        );

        buildRailNetwork(this.rails, this.stations);
        train.rails = this.rails;
        train.stations = this.stations;
        train.start(this);
        train2.rails = this.rails;
        train2.stations = this.stations;
        train2.start(this);

        // TODO: Add capacity to rails, stations
        // TODO: Add switches
        // TODO: Add multi-track-stations (more platforms)
    }

    changeScene() {
        this.scene.start("GameOver");
    }

    update(time: number, delta: number) {
        for (const train of this.trains) {
            train.update(this, delta);
        }
        for (const station of this.stations) {
            station.update(this.trains);
        }
    }
}

