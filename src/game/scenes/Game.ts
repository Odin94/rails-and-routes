import { Cameras, GameObjects, Input, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { buildRailNetwork, createStraightRailway } from "../prefabs/Rail";
import { Station } from "../prefabs/Station";
import { Train } from "../prefabs/Train";
import { setupCamera } from "./game_features/Camera";
import { SpriteCollection } from "./game_features/Types";
import { ObjectPlacer, ObjectPlacerType } from "./game_features/ObjectPlacer";

export class Game extends Scene {
    cam: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    gameText: GameObjects.Text;

    objectPlacer = ObjectPlacer;

    sprites: SpriteCollection = {
        trains: [],
        rails: [],
        stations: [],
    };

    constructor() {
        super("Game");
    }

    update(time: number, delta: number) {
        for (const train of this.sprites.trains) {
            train.update(this, delta);
        }
        for (const station of this.sprites.stations) {
            station.update(this.sprites.trains);
        }

        this.objectPlacer.update(this.cam, this);
    }

    create() {
        this.cam = this.cameras.main;
        setupCamera(this.cam, this);
        this.objectPlacer.createUI(this);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        this.sprites.rails.push(
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
        this.sprites.trains.push(train);

        const train2 = new Train(this, 12 * 64, 7 * 64);
        train2.route = [
            { stationName: "Centropton" },
            { stationName: "Mesenter" },
        ];
        this.sprites.trains.push(train2);

        this.sprites.stations.push(
            ...[
                new Station(this, "Leftington", 64, 3 * 64),
                new Station(this, "Centropton", 8 * 64, 3 * 64),
                new Station(this, "Mesenter", 8 * 64, 6 * 64),
                new Station(this, "Bolevian", 3 * 64, 9 * 64),
            ]
        );

        buildRailNetwork(this.sprites.rails, this.sprites.stations);
        train.rails = this.sprites.rails;
        train.stations = this.sprites.stations;
        train.start(this);
        train2.rails = this.sprites.rails;
        train2.stations = this.sprites.stations;
        train2.start(this);

        this.input.on(
            "pointerdown",
            (p: Input.Pointer) => {
                if (p.leftButtonDown()) {
                    if (this.objectPlacer.isPlacing()) {
                        this.objectPlacer.placeSelectedObject(
                            this.sprites,
                            this
                        );
                    }
                }
            },
            this
        );

        // TODO: Add capacity to rails, stations
        // TODO: Add signals for track segments
        // TODO: Add a concept of time and let trains predict when they will be at certain places
        // TODO: Let trains pick their routes based on predictions of where other trains will block them
        // TODO: Add multi-track-stations (more platforms)
        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

