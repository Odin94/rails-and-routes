import { Scene, GameObjects } from "phaser";
import { Rail } from "./Rail";

export const STATION_GRID_SIZE = 64;

export class Station extends GameObjects.Sprite {
    gridX: number;
    gridY: number;
    rail?: Rail = undefined;
    dwellTime: number = 500;

    constructor(scene: Scene, name: string, x: number, y: number, angle = 0) {
        super(scene, x, y, "station");
        this.angle = angle;
        this.name = name;

        this.gridX = x / STATION_GRID_SIZE;
        this.gridY = y / STATION_GRID_SIZE;

        this.scene.add.existing(this);
    }
}
