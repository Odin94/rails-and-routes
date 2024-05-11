import { Scene, GameObjects } from "phaser";

export class Rail extends GameObjects.Sprite {
    constructor(scene: Scene, x: number, y: number, angle = 0) {
        super(scene, x, y, "rails");
        this.angle = angle;

        this.scene.add.existing(this);
    }
}

export const createRailway = (
    scene: Scene,
    from: { x: number; y: number },
    to: { x: number; y: number }
) => {};
