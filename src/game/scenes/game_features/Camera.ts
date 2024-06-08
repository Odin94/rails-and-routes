import Phaser, { Scene, Cameras, GameObjects, Input } from "phaser";

export const setupCamera = (cam: Cameras.Scene2D.Camera, scene: Scene) => {
    cam.setBounds(-1000, -1000, 4000, 4000);
    cam.setZoom(1, 1);
    cam.setBackgroundColor(0x7cfc00);

    // Move camera with middle mouse
    let prevCamPos = { x: 0, y: 0 };
    scene.input.on(
        "pointerdown",
        (p: Input.Pointer) => {
            prevCamPos = { x: p.x, y: p.y };
        },
        this
    );
    scene.input.on(
        "pointermove",
        (p: Input.Pointer) => {
            if (scene.input.activePointer.middleButtonDown()) {
                const deltaX = p.x - prevCamPos.x;
                const deltaY = p.y - prevCamPos.y;

                cam.scrollX -= deltaX / cam.zoom;
                cam.scrollY -= deltaY / cam.zoom;

                prevCamPos = { x: p.x, y: p.y };
            }
        },
        this
    );

    // Zoom with scroll wheel
    const minZoom = 0.25;
    const maxZoom = 2;
    scene.input.on(
        "wheel",
        (
            pointer: Input.Pointer,
            gameObjects: any,
            deltaX: number,
            deltaY: number,
            deltaZ: number
        ) => {
            if (deltaY > 0) {
                cam.zoom = Phaser.Math.Clamp(cam.zoom - 0.1, minZoom, maxZoom);
            } else if (deltaY < 0) {
                cam.zoom = Phaser.Math.Clamp(cam.zoom + 0.1, minZoom, maxZoom);
            }
        },
        this
    );
};
