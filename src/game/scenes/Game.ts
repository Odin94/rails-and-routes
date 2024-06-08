import { EventBus } from "../EventBus";
import Phaser, { Scene, Cameras, GameObjects, Input } from "phaser";
import { Train } from "../prefabs/Train";
import { Rail, buildRailNetwork, createStraightRailway } from "../prefabs/Rail";
import { Station } from "../prefabs/Station";

export class Game extends Scene {
    cam: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    gameText: GameObjects.Text;
    uiContainer: GameObjects.Container;

    selectedPlacementObj: "rails" | "station" | null = null;
    selectedPlacementImage: GameObjects.Image | null = null;

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

        // Position the container at the bottom right of the screen in case the window is resized
        this.uiContainer.setPosition(
            this.cam.scrollX + 10,
            this.cam.scrollY + this.cam.height - 120
        );

        const mouseX =
            (this.input.x - this.cam.centerX) / this.cam.zoom +
            this.cam.width / 2 +
            this.cam.scrollX;
        const mouseY =
            (this.input.y - this.cam.centerY) / this.cam.zoom +
            this.cam.height / 2 +
            this.cam.scrollY;
        const snapX = Math.round(mouseX / 64) * 64;
        const snapY = Math.round(mouseY / 64) * 64;

        if (this.selectedPlacementImage) {
            this.selectedPlacementImage.setPosition(snapX, snapY);
        }
    }

    create() {
        this.cam = this.cameras.main;
        this.uiContainer = this.add.container(0, 0);
        this.setupCamera();
        this.createUI();

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

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
        EventBus.emit("current-scene-ready", this);
    }

    createUI() {
        this.uiContainer.setDepth(Number.MAX_SAFE_INTEGER);

        const menuBackground = this.add.graphics();
        menuBackground.fillStyle(0xffffff, 0.8);
        menuBackground.fillRect(0, 0, 250, 120);
        this.uiContainer.add(menuBackground);

        // Buttons
        const buttonFrames: GameObjects.Rectangle[] = [];

        // Rails button
        const railsImage = this.add.image(0, 0, "rails");
        const railsFrame = this.add
            .rectangle(0, 0, 64, 64)
            .setStrokeStyle(3, 0x000);
        buttonFrames.push(railsFrame);
        const railsButtonContainer = this.add
            .container(40, 55, [railsImage, railsFrame])
            .setSize(64, 64)
            .setScale(0.7)
            .setInteractive();
        railsButtonContainer.on("pointerdown", () => {
            for (const frame of buttonFrames) {
                frame.setStrokeStyle(3, 0x000);
            }
            railsFrame.setStrokeStyle(3, 0xfff);

            this.selectedPlacementObj = "rails";
            this.selectedPlacementImage?.destroy();
            this.selectedPlacementImage = this.add
                .image(0, 0, "rails")
                .setAlpha(0.75)
                .setTint(0x80d8ff);
        });
        this.uiContainer.add(railsButtonContainer);

        // Station button
        const stationImage = this.add.image(0, 0, "station");
        const stationFrame = this.add
            .rectangle(0, 0, 64, 64)
            .setStrokeStyle(3, 0x000);
        buttonFrames.push(stationFrame);
        const stationButtonContainer = this.add
            .container(40 + 64, 55, [stationImage, stationFrame])
            .setSize(64, 64)
            .setScale(0.7)
            .setInteractive();
        stationButtonContainer.on("pointerdown", () => {
            for (const frame of buttonFrames) {
                frame.setStrokeStyle(3, 0x000);
            }
            stationFrame.setStrokeStyle(3, 0xfff);

            this.selectedPlacementObj = "station";
            this.selectedPlacementImage?.destroy();
            this.selectedPlacementImage = this.add
                .image(0, 0, "station")
                .setAlpha(0.75)
                .setTint(0x80d8ff);
        });
        this.uiContainer.add(stationButtonContainer);
    }

    setupCamera() {
        this.cam.setBounds(-1000, -1000, 4000, 4000);
        this.cam.setZoom(1, 1);
        this.cam.setBackgroundColor(0x7cfc00);

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

