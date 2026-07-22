import { Page, Locator } from '@playwright/test';

type Point = { x: number; y: number };

export class CanvasUtils {

  static async drawSignature(
    _page: Page,
    canvasLocator: Locator
  ): Promise<void> {

    await canvasLocator.waitFor({ state: 'visible' });
    await canvasLocator.scrollIntoViewIfNeeded();

    const box = await canvasLocator.boundingBox();
    if (!box) throw new Error('Unable to find canvas bounding box');

    const startX = box.x + 20;
    const startY = box.y + (box.height / 2);

    const points: Point[] = [
      { x: startX,       y: startY      },
      { x: startX + 30,  y: startY - 20 },
      { x: startX + 60,  y: startY + 10 },
      { x: startX + 90,  y: startY - 15 },
      { x: startX + 120, y: startY + 5  },
      { x: startX + 150, y: startY - 10 },
      { x: startX + 180, y: startY + 15 },
    ];

    await canvasLocator.evaluate(
      (canvas: HTMLCanvasElement, args: { pts: Point[]; rect: DOMRect }) => {
        const { pts, rect } = args;

        const opts = (x: number, y: number, buttons: number) => ({
          bubbles:    true,
          cancelable: true,
          view:       window,
          clientX:    x,
          clientY:    y,
          offsetX:    x - rect.left,
          offsetY:    y - rect.top,
          button:     0,
          buttons,
        });

        const pointerOpts = (x: number, y: number, buttons: number) => ({
          ...opts(x, y, buttons),
          pointerId:   1,
          pointerType: 'mouse',
          isPrimary:   true,
        });

        const [first, ...rest] = pts;
        const last = pts[pts.length - 1];

        canvas.dispatchEvent(new PointerEvent('pointerdown', pointerOpts(first.x, first.y, 1)));
        canvas.dispatchEvent(new MouseEvent('mousedown',     opts(first.x, first.y, 1)));

        for (const pt of rest) {
          canvas.dispatchEvent(new PointerEvent('pointermove', pointerOpts(pt.x, pt.y, 1)));
          canvas.dispatchEvent(new MouseEvent('mousemove',     opts(pt.x, pt.y, 1)));
        }

        canvas.dispatchEvent(new PointerEvent('pointerup', pointerOpts(last.x, last.y, 0)));
        canvas.dispatchEvent(new MouseEvent('mouseup',     opts(last.x, last.y, 0)));
      },
      { pts: points, rect: box as unknown as DOMRect }
    );
  }

  /**
   * Returns true if at least one non-transparent pixel has been drawn on the canvas.
   * Use this after drawSignature() to confirm the signature widget registered the input.
   */
  static async hasSignature(canvasLocator: Locator): Promise<boolean> {
    return canvasLocator.evaluate((canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true;
      }
      return false;
    });
  }
}
