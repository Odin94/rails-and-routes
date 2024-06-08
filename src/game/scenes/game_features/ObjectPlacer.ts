import Phaser, { Scene, Cameras, GameObjects, Input } from "phaser";
import {
    RAIL_GRID_SIZE,
    Rail,
    buildRailNetwork,
    createStraightRailway,
} from "../../prefabs/Rail";
import { Station } from "../../prefabs/Station";
import { Point, PlacementObjectType, SpriteCollection } from "./Types";

export const StationNameOptions = [
    "Statington",
    "Quattro Stattioni",
    "Il Straterone",
    "Station Basin",
    "Dank memes",
];

export const costs = {
    rails: 500,
    station: 4000,
};

export type ObjectPlacerType = {
    selectedPlacementObj: PlacementObjectType | null;
    selectedPlacementImage: GameObjects.Image | null;
    uiContainer: GameObjects.Container | null;
    update: (cam: Cameras.Scene2D.Camera, scene: Scene) => void;
    isPlacing: () => boolean;
    placeSelectedObject: (
        sprites: SpriteCollection,
        money: number,
        scene: Scene
    ) => number;
    initialize: (scene: Scene) => void;
};

export const ObjectPlacer: ObjectPlacerType = {
    uiContainer: null,
    selectedPlacementObj: null,
    selectedPlacementImage: null,

    update: function (cam: Cameras.Scene2D.Camera, scene: Scene) {
        // Position the container at the bottom right of the screen in case the window is resized
        this.uiContainer?.setPosition(
            cam.scrollX + 10,
            cam.scrollY + cam.height - 120
        );

        const mouseX =
            (scene.input.x - cam.centerX) / cam.zoom +
            cam.width / 2 +
            cam.scrollX;
        const mouseY =
            (scene.input.y - cam.centerY) / cam.zoom +
            cam.height / 2 +
            cam.scrollY;
        const snapX = Math.round(mouseX / 64) * 64;
        const snapY = Math.round(mouseY / 64) * 64;

        if (this.selectedPlacementImage) {
            this.selectedPlacementImage.setPosition(snapX, snapY);
        }
    },

    isPlacing: function () {
        return this.selectedPlacementObj !== null;
    },

    placeSelectedObject: function (
        sprites: SpriteCollection,
        money: number,
        scene: Scene
    ) {
        if (!this.isPlacing()) return money;
        if (!this.selectedPlacementImage) return money;

        const position = {
            x: this.selectedPlacementImage.x,
            y: this.selectedPlacementImage.y,
        };
        const staticSprites: GameObjects.Sprite[] = [
            ...sprites.rails,
            ...sprites.stations,
        ];
        if (
            staticSprites.find((s) => s.x === position.x && s.y === position.y)
        ) {
            console.warn(`Overlapping: ${position.x} / ${position.y}`);
            return money;
        }
        switch (this.selectedPlacementObj) {
            case "rails": {
                if (money < costs.rails) return money;
                money -= costs.rails;

                const isHorizontal: boolean = !!sprites.rails.find(
                    (r) =>
                        r.y === position.y &&
                        (r.x === position.x - RAIL_GRID_SIZE ||
                            r.x === position.x + RAIL_GRID_SIZE)
                );
                const rail = new Rail(
                    scene,
                    position.x,
                    position.y,
                    isHorizontal ? 90 : 0
                );
                sprites.rails.push(rail);
                break;
            }
            case "station": {
                if (money < costs.station) return money;
                money -= costs.station;

                const station = new Station(
                    scene,
                    StationNameOptions.pop() ?? "No more station names",
                    position.x,
                    position.y
                );
                sprites.stations.push(station);
                break;
            }
            default: {
                console.warn(
                    `Unknown selectedPlacementObj: "${this.selectedPlacementObj}"`
                );
            }
        }

        return money;
    },

    initialize: function (scene: Scene) {
        this.uiContainer = scene.add.container(0, 0);

        this.uiContainer.setDepth(Number.MAX_SAFE_INTEGER);

        const menuBackground = scene.add.graphics();
        menuBackground.fillStyle(0xffffff, 0.8);
        menuBackground.fillRect(0, 0, 250, 120);
        this.uiContainer.add(menuBackground);

        // Buttons
        const buttonFrames: GameObjects.Rectangle[] = [];

        // Type must match asset name for icon!
        const buttonTypes: PlacementObjectType[] = ["rails", "station"];
        for (const [i, type] of buttonTypes.entries()) {
            const image = scene.add.image(0, 0, type);
            const frame = scene.add
                .rectangle(0, 0, 64, 64)
                .setStrokeStyle(3, 0x000);
            buttonFrames.push(frame);
            const buttonContainer = scene.add
                .container(40 + i * 64, 55, [image, frame])
                .setSize(64, 64)
                .setScale(0.7)
                .setInteractive();
            buttonContainer.on("pointerdown", () => {
                for (const frame of buttonFrames) {
                    frame.setStrokeStyle(3, 0x000);
                }
                frame.setStrokeStyle(3, 0xfff);

                this.selectedPlacementObj = type;
                this.selectedPlacementImage?.destroy();
                this.selectedPlacementImage = scene.add
                    .image(0, 0, type)
                    .setAlpha(0.75)
                    .setTint(0x80d8ff);
            });
            this.uiContainer.add(buttonContainer);
        }
    },
};
