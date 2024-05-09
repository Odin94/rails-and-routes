import { Scene } from "phaser";

export class Train extends Phaser.Physics.Arcade.Sprite {
    route: { x: number; y: number; dwellTime: number }[] = [];
    routeIndex = 0;
    speed = 200;

    isDwelling = false;
    currentDwellTime = 0;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, "train");
        scene.physics.add.existing(this);
        this.scene.add.existing(this);
        this.setScale(2);
    }

    getNextStop = () => this.route[this.routeIndex];

    followNextStop = () => {
        if (this.routeIndex >= this.route.length - 1) {
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

    start = (scene: Scene) => {
        const next = this.getNextStop();
        scene.physics.moveTo(this, next.x, next.y, this.speed);
    };

    update = (scene: Scene, delta: number) => {
        let next = this.getNextStop();

        if (this.isDwelling) {
            this.currentDwellTime += delta;

            if (this.currentDwellTime > next.dwellTime) {
                this.followNextStop();
                next = this.getNextStop();
                this.resetDwelling();
                scene.physics.moveTo(this, next.x, next.y, this.speed);
            }
        } else {
            if (
                Phaser.Math.Distance.Between(this.x, this.y, next.x, next.y) <
                10
            ) {
                this.isDwelling = true;
                this.setVelocity(0, 0);
            }
        }
    };
}
