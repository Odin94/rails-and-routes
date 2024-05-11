import { Scene, GameObjects } from "phaser";

export class Station extends GameObjects.Sprite {
    constructor(scene: Scene, x: number, y: number, angle = 0) {
        super(scene, x, y, "station");
        this.angle = angle;

        this.scene.add.existing(this);
    }
}
