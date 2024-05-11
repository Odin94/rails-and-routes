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
    type Node = {
        parent?: Node;
        rail: Rail;
    };
    const stationRail = rails.find(
        (r) => r.connectedStation?.name === stationName
    );
    console.error("No station rail!");
    if (!stationRail) return [];
    const stationRailNode: Node = { parent: undefined, rail: stationRail };
    console.log(
        "Looking for path to " +
            stationName +
            " which is at " +
            stationRail.gridX +
            " / " +
            stationRail.gridY
    );

    const queue: Node[] = [{ parent: undefined, rail: rail }];
    const visited = new Set<Rail>();
    const result = [];

    // Note: This only finds the optimal path for unweighted edges. If we ever have eg. speed restrictions or expected waiting time on some rails
    // We need to use Dijkstra's BFS algorithm instead
    while (queue.length) {
        const node = queue.shift()!;
        console.log(`Looking at ${node.rail.gridX} / ${node.rail.gridY}`);

        if (node.rail.connectedStation?.name === stationName) {
            let n = node;
            const result = [];
            while (n.parent) {
                result.push({
                    x: n.rail.x,
                    y: n.rail.y,
                    dwellTime: sameGridPos(n.rail, stationRail)
                        ? stationRailNode.rail.connectedStation!.dwellTime
                        : 0,
                });

                n = n.parent;
            }

            return result.reverse();
        }

        if (!visited.has(node.rail)) {
            visited.add(node.rail);

            for (const neighbor of node.rail.neighbours) {
                queue.push({ parent: node, rail: neighbor });
            }
        }
    }

    console.error("No path found!");
    return [];
};
