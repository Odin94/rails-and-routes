import { Scene, GameObjects } from "phaser";
import { Station } from "./Station";
import { absDiffGridPos } from "../utils";

export const RAIL_GRID_SIZE = 64;

export class Rail extends GameObjects.Sprite {
    gridX: number;
    gridY: number;
    neighbours: Rail[] = [];
    connectedStation?: Station = undefined;

    constructor(scene: Scene, x: number, y: number, angle = 0) {
        super(scene, x, y, "rails");
        this.angle = angle;

        this.gridX = x / RAIL_GRID_SIZE;
        this.gridY = y / RAIL_GRID_SIZE;

        this.scene.add.existing(this);
    }
}

// Consider RailNetwork class that contains rails, stations and pathing functions

export const createStraightRailway = (
    scene: Scene,
    gridFrom: { x: number; y: number },
    gridTo: { x: number; y: number }
) => {
    const rails = [];
    if (gridFrom.x === gridTo.x) {
        for (let i = gridFrom.y; i < gridTo.y; i++) {
            const rail = new Rail(
                scene,
                gridFrom.x * RAIL_GRID_SIZE,
                i * RAIL_GRID_SIZE,
                0
            );
            rails.push(rail);
        }
    } else if (gridFrom.y === gridTo.y) {
        for (let i = gridFrom.x; i < gridTo.x; i++) {
            const rail = new Rail(
                scene,
                i * RAIL_GRID_SIZE,
                gridFrom.y * RAIL_GRID_SIZE,
                90
            );
            rails.push(rail);
        }
    } else {
        throw new Error(
            `Can only draw straight railway lines, input: ${JSON.stringify(
                gridFrom
            )}, ${JSON.stringify(gridTo)}`
        );
    }

    return rails;
};

export const buildRailNetwork = (rails: Rail[], stations: Station[]) => {
    for (const rail of rails) {
        rail.neighbours = rails.filter((r) => absDiffGridPos(r, rail) === 1);
        rail.connectedStation = stations.find(
            (s) => absDiffGridPos(s, rail) === 1
        );
        if (rail.connectedStation) rail.connectedStation.rail = rail;
    }
};
