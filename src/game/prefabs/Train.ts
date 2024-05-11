import { Scene, Math as pMath, Physics } from "phaser";

export const TRAIN_GRID_SIZE = 64;

export type ActivePath = { x: number; y: number; dwellTime: number }[];

export class Train extends Physics.Arcade.Sprite {
    gridX: number;
    gridY: number;

    route: { stationName: string }[] = [];
    activePath: ActivePath = [];
    routeIndex = 0;
    speed = 200;

    isDwelling = false;
    currentDwellTime = 0;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, "train");
        scene.physics.add.existing(this);
        this.scene.add.existing(this);
        this.setScale(2);

        this.gridX = x / TRAIN_GRID_SIZE;
        this.gridY = y / TRAIN_GRID_SIZE;
    }

    getNextStop = () => this.activePath[this.routeIndex];

    followNextStop = () => {
        if (this.routeIndex >= this.activePath.length - 1) {
            this.routeIndex = 0;
        } else {
            this.routeIndex++;
        }

        return this.routeIndex;
    };

    resetDwelling = () => {
        this.isDwelling = false;
        this.currentDwellTime = 0;
    };

    start = (scene: Scene, activePath: ActivePath) => {
        this.activePath = activePath;
        const next = this.getNextStop();
        if (next) scene.physics.moveTo(this, next.x, next.y, this.speed);
    };

    alignAngle = () => {
        this.angle = 0;
        this.flipX = false;
        // Adding 5 to everything because movement vectors aren't perfect
        if ((this.body?.velocity.x ?? 0) + 5 < 0) this.flipX = true;
        if ((this.body?.velocity.y ?? 0) + 5 < 0) this.angle = 270;
        if ((this.body?.velocity.y ?? 0) - 5 > 0) this.angle = 90;
    };

    update = (scene: Scene, delta: number) => {
        let next = this.getNextStop();
        if (!next) return;

        if (this.isDwelling) {
            this.currentDwellTime += delta;

            if (this.currentDwellTime > next.dwellTime) {
                this.followNextStop();
                next = this.getNextStop();
                this.resetDwelling();
                scene.physics.moveTo(this, next.x, next.y, this.speed);
                this.alignAngle();
            }
        } else {
            if (pMath.Distance.Between(this.x, this.y, next.x, next.y) < 10) {
                this.isDwelling = true;
                // Set perfect position to avoid weird numbers in next velocity
                this.x = next.x;
                this.y = next.y;
                this.setVelocity(0, 0);
            }
        }
    };
}
