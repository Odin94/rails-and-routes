import { Rail } from "./prefabs/Rail";
import { Train } from "./prefabs/Train";
import { Station } from "./prefabs/Station";

type GridObject = Train | Rail | Station;

export const absDiff = (a: number, b: number) => (a > b ? a - b : b - a);

export const absDiffGridPos = (a: GridObject, b: GridObject) =>
    absDiff(a.gridX, b.gridX) + absDiff(a.gridY, b.gridY);

export const sameGridPos = (a: GridObject, b: GridObject) =>
    absDiffGridPos(a, b) === 0;

export const findPath = (rail: Rail, stationName: string, rails: Rail[]) => {
    const stationRail = rails.find(
        (r) => r.connectedStation?.name === stationName
    );
    console.error("No station rail!");
    if (!stationRail) return [];

    const queue = [rail];
    const visited = new Set();
    const result = [];

    // Note: This only finds the optimal path for unweighted edges. If we ever have eg. speed restrictions or expected waiting time on some rails
    // We need to use Dijkstra's BFS algorithm instead
    while (queue.length) {
        const node = queue.shift()!;

        if (!visited.has(node)) {
            visited.add(node);
            result.push({
                x: node.x,
                y: node.y,
                dwellTime:
                    node == stationRail
                        ? stationRail.connectedStation!.dwellTime
                        : 0,
            });

            for (const neighbor of node.neighbours) {
                queue.push(neighbor);
            }
        }
    }

    return result;
};
