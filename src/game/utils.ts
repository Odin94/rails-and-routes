import { Rail } from "./prefabs/Rail";
import { Train } from "./prefabs/Train";
import { Station } from "./prefabs/Station";

type GridObject = Train | Rail | Station;

export const absDiff = (a: number, b: number) => (a > b ? a - b : b - a);

export const absGridPosDiff = (a: GridObject, b: GridObject) =>
    absDiff(a.gridX, b.gridX) + absDiff(a.gridY, b.gridY);

export const sameGridPos = (a: GridObject, b: GridObject) =>
    absGridPosDiff(a, b) === 0;

export const findPath = (
    startRail: Rail,
    stationName: string,
    rails: Rail[]
) => {
    type Node = {
        parent?: Node;
        rail: Rail;
    };
    const stationRail = rails.find(
        (r) => r.connectedStation?.name === stationName
    );
    if (!stationRail) {
        console.error(`No station rail for station ${stationName}!`);
        return [];
    }
    const stationRailNode: Node = { parent: undefined, rail: stationRail };

    const queue: Node[] = [{ parent: undefined, rail: startRail }];
    const visited = new Set<Rail>();
    const result = [];

    // Note: This only finds the optimal path for unweighted edges. If we ever have eg. speed restrictions or expected waiting time on some rails
    // We need to use Dijkstra's BFS algorithm instead
    while (queue.length) {
        const node = queue.shift()!;

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
            // Push startRail-node as well so we never have an empty path if train is already at station
            result.push({
                x: n.rail.x,
                y: n.rail.y,
                dwellTime: sameGridPos(n.rail, stationRail)
                    ? stationRailNode.rail.connectedStation!.dwellTime
                    : 0,
            });

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
