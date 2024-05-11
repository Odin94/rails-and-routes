import { Scene, Math as pMath, Physics } from "phaser";
import { Rail } from "./Rail";
import { findPath, sameGridPos } from "../utils";

export const TRAIN_GRID_SIZE = 64;

export type ActivePath = { x: number; y: number; dwellTime: number }[];

export class Train extends Physics.Arcade.Sprite {
    gridX: number;
    gridY: number;

    route: { stationName: string }[] = [];
    routeIndex = 0;

    activePath: ActivePath = [];
    activePathIndex = 0;

    speed = 200;

    isDwelling = false;
    currentDwellTime = 0;

    rails: Rail[] = [];

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, "train");
        scene.physics.add.existing(this);
        this.scene.add.existing(this);
        this.setScale(2);

        this.gridX = x / TRAIN_GRID_SIZE;
        this.gridY = y / TRAIN_GRID_SIZE;
    }

    startOnRoute = () => {
        const railUnderTrain = this.rails.find((r) => sameGridPos(this, r));
        console.log({ x: railUnderTrain?.gridX, y: railUnderTrain?.gridY });
        if (!railUnderTrain)
            throw new Error(
                `Rail under train is undefined for train with coords: ${this.gridX} / ${this.gridY}`
            );
        this.activePath = findPath(
            railUnderTrain,
            this.route[this.routeIndex].stationName,
            this.rails
        );
        this.activePathIndex = 0;
    };

    getNextStop = () => this.activePath[this.activePathIndex];

    followNextStop = () => {
        if (this.activePathIndex >= this.activePath.length - 1) {
            console.log(
                "Arrived at " + this.route[this.routeIndex].stationName
            );
            this.routeIndex =
                this.routeIndex >= this.route.length - 1
                    ? 0
                    : this.routeIndex + 1;
            this.startOnRoute();
            console.log(
                "Moving on to " + this.route[this.routeIndex].stationName
            );
            console.log({ path: this.activePath });
        } else {
            this.activePathIndex++;
        }

        return this.activePathIndex;
    };

    resetDwelling = () => {
        this.isDwelling = false;
        this.currentDwellTime = 0;
    };

    start = (scene: Scene) => {
        this.startOnRoute();
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
        this.gridX = Math.round(this.x / TRAIN_GRID_SIZE);
        this.gridY = Math.round(this.y / TRAIN_GRID_SIZE);

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
