import { Rail } from "../../prefabs/Rail";
import { Station } from "../../prefabs/Station";
import { Train } from "../../prefabs/Train";

export type SelectedPlacementObj = "rails" | "station" | null;

export type Point = { x: number; y: number };

export type SpriteCollection = {
    trains: Train[];
    rails: Rail[];
    stations: Station[];
};