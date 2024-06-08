import { EventBus } from "../EventBus";
import Phaser, { Scene, Cameras, GameObjects, Input } from "phaser";
import { Train } from "../prefabs/Train";
import { Rail, buildRailNetwork, createStraightRailway } from "../prefabs/Rail";
import { Station } from "../prefabs/Station";
import { absGridPosDiff, findPath, sameGridPos } from "../utils";

export class Game extends Scene {
    cam: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    gameText: GameObjects.Text;

    trains: Train[] = [];
    rails: Rail[] = [];
    stations: Station[] = [];

    constructor() {
        super("Game");
    }

    update(time: number, delta: number) {
        for (const train of this.trains) {
            train.update(this, delta);
        }
        for (const station of this.stations) {
            station.update(this.trains);
        }
    }

    create() {
        this.setupCamera();

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
        // TODO: Add signals for track segments
        // TODO: Add a concept of time and let trains predict when they will be at certain places
        // TODO: Let trains pick their routes based on predictions of where other trains will block them
        // TODO: Add multi-track-stations (more platforms)
    }

    setupCamera() {
        this.cam = this.cameras.main;
        this.cam.setBounds(-1000, -1000, 4000, 4000);
        this.cam.setZoom(1, 1);
        this.cam.setBackgroundColor(0x00ff00);

        // Move camera with middle mouse
        let prevCamPos = { x: 0, y: 0 };
        this.input.on(
            "pointerdown",
            (p: Input.Pointer) => {
                prevCamPos = { x: p.x, y: p.y };
            },
            this
        );
        this.input.on(
            "pointermove",
            (p: Input.Pointer) => {
                if (this.input.activePointer.middleButtonDown()) {
                    const deltaX = p.x - prevCamPos.x;
                    const deltaY = p.y - prevCamPos.y;

                    this.cam.scrollX -= deltaX / this.cam.zoom;
                    this.cam.scrollY -= deltaY / this.cam.zoom;

                    prevCamPos = { x: p.x, y: p.y };
                }
            },
            this
        );

        // Zoom with scroll wheel
        const minZoom = 0.25;
        const maxZoom = 2;
        this.input.on(
            "wheel",
            (
                pointer: Input.Pointer,
                gameObjects: any,
                deltaX: number,
                deltaY: number,
                deltaZ: number
            ) => {
                if (deltaY > 0) {
                    this.cam.zoom = Phaser.Math.Clamp(
                        this.cam.zoom - 0.1,
                        minZoom,
                        maxZoom
                    );
                } else if (deltaY < 0) {
                    this.cam.zoom = Phaser.Math.Clamp(
                        this.cam.zoom + 0.1,
                        minZoom,
                        maxZoom
                    );
                }
            },
            this
        );
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

