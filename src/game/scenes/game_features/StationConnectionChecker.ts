import { Scene } from "phaser";
import { SpriteCollection, StationConnection } from "./Types";
import { findPathBetweenStations } from "../../utils";
import { Train } from "../../prefabs/Train";

export type StationConnectionChecker = {
    requiredConnections: StationConnection[];
    update: (sprites: SpriteCollection, scene: Scene) => void;
};

export const createStationConnectionCheker = (
    requiredConnections: StationConnection[]
): StationConnectionChecker => {
    return {
        requiredConnections,
        update: function (sprites: SpriteCollection, scene: Scene) {
            for (const { from, to } of this.requiredConnections) {
                const connection = findPathBetweenStations(
                    from,
                    to,
                    sprites.rails
                );
                if (connection.length > 0) {
                    console.log(`Connection made! ${from.name} -> ${to.name}`);
                    this.requiredConnections = this.requiredConnections.filter(
                        (sc) => !(sc.from === from && sc.to === to)
                    );

                    const train = new Train(scene, 0, 4 * 64);
                    train.route = [
                        { stationName: from.name },
                        { stationName: to.name },
                    ];
                    sprites.trains.push(train);
                    train.rails = sprites.rails;
                    train.stations = sprites.stations;
                    train.start(scene);
                }
            }
        },
    };
};
