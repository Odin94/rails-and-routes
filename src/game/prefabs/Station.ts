import { Scene } from "phaser";

export class Station extends Phaser.GameObjects.Sprite {
    constructor(scene: Scene, x: number, y: number, angle = 0) {
        super(scene, x, y, "station");
        this.angle = angle;

        this.scene.add.existing(this);
    }
}
