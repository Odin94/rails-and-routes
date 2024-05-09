import { Scene } from "phaser";

export const addTrain = (scene: Scene | Phaser.Scenes.ScenePlugin) => {
    const x = Phaser.Math.Between(64, scene.scale.width - 64);
    const y = Phaser.Math.Between(64, scene.scale.height - 64);

    const train = scene.add.sprite(x, y, "star");

    return train;
};

export type Train = {
    x: number;
    y: number;
};
