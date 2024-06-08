import { Cameras, GameObjects, Input, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { buildRailNetwork, createStraightRailway } from "../prefabs/Rail";
import { Station } from "../prefabs/Station";
import { Train } from "../prefabs/Train";
import { setupCamera } from "./game_features/Camera";
import { SpriteCollection } from "./game_features/Types";
import { ObjectPlacer } from "./game_features/ObjectPlacer";
import {
    StationConnectionChecker,
    createStationConnectionCheker,
} from "./game_features/StationConnectionChecker";

export class Game extends Scene {
    cam: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    gameText: GameObjects.Text;

    moneyText: GameObjects.Text;
    money: number;

    stationConnectionChecker: StationConnectionChecker;

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

        this.moneyText
            .setPosition(this.cam.scrollX + 20, this.cam.scrollY + 20)
            .setText(`Money: ${this.money}`);

        this.stationConnectionChecker.update(this.sprites, this);
    }

    create() {
        this.cam = this.cameras.main;
        setupCamera(this.cam, this);
        this.objectPlacer.initialize(this);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        this.money = 10_000;
        this.moneyText = this.add.text(20, 20, `Money: ${this.money}`);

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
            { stationName: "Hellola" },
        ];
        this.sprites.trains.push(train);

        const train2 = new Train(this, 12 * 64, 7 * 64);
        train2.route = [
            { stationName: "Centropton" },
            { stationName: "Mesenter" },
        ];
        this.sprites.trains.push(train2);

        const barzoople = new Station(this, "Barzoople", 15 * 64, 9 * 64);
        const hellola = new Station(this, "Hellola", 3 * 64, 9 * 64);
        this.sprites.stations.push(
            ...[
                new Station(this, "Leftington", 64, 3 * 64),
                new Station(this, "Centropton", 8 * 64, 3 * 64),
                new Station(this, "Mesenter", 8 * 64, 6 * 64),
                barzoople,
                hellola,
            ]
        );
        this.stationConnectionChecker = createStationConnectionCheker([
            { from: hellola, to: barzoople },
        ]);

        buildRailNetwork(this.sprites);
        train.rails = this.sprites.rails;
        train.stations = this.sprites.stations;
        train.start(this);
        train2.rails = this.sprites.rails;
        train2.stations = this.sprites.stations;
        train2.start(this);

        // TODO: Set up game with goals
        /*
            Add requirements for connections between stations that spawn trains when connected
            Make driving trains generate money
            Add mountains, lakes, trees as blocking tiles
        */

        // TODO: Add capacity to rails, stations
        // TODO: Add signals for track segments
        // TODO: Add a concept of time and let trains predict when they will be at certain places
        // TODO: Let trains pick their routes based on predictions of where other trains will block them
        // TODO: Add multi-track-stations (more platforms)
        this.input.on(
            "pointerdown",
            (p: Input.Pointer) => {
                if (p.leftButtonDown()) {
                    if (this.objectPlacer.isPlacing()) {
                        this.money = this.objectPlacer.placeSelectedObject(
                            this.sprites,
                            this.money,
                            this
                        );
                        buildRailNetwork(this.sprites);
                    }
                }
            },
            this
        );
        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

