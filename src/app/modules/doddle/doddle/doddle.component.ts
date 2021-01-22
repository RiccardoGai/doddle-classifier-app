import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { fromEvent, merge } from 'rxjs';
import { switchMap, takeUntil, pairwise, map } from 'rxjs/operators';
import * as tf from '@tensorflow/tfjs';
import { DoddleClassifier } from 'app/core/core/models/doddle-classifier.model';

@Component({
  selector: 'app-doddle',
  templateUrl: './doddle.component.html',
  styleUrls: ['./doddle.component.scss'],
})
export class DoddleComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') public canvasRef: ElementRef;
  private canvas: HTMLCanvasElement;
  private cx: CanvasRenderingContext2D;
  private model: DoddleClassifier;
  private coordinates: { x: number; y: number }[] = [];
  prediction: string;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.initCanvas();
  }
  constructor() {}

  async ngOnInit() {
    this.model = new DoddleClassifier();
    this.model.loadModel();
  }

  private initCanvas() {
    this.canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
    this.cx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.cx.lineWidth = 8;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';
    this.cx.fillStyle = '#fff';

    // this.cx.strokeStyle = '#fff';
    // this.cx.fillStyle = '#000';
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  ngAfterViewInit() {
    this.initCanvas();
    merge(
      fromEvent(this.canvas, 'mousedown').pipe(
        switchMap((e) => {
          return fromEvent(this.canvas, 'mousemove').pipe(
            takeUntil(fromEvent(this.canvas, 'mouseup')),
            takeUntil(fromEvent(this.canvas, 'mouseleave')),
            pairwise()
          );
        }),
        map((events) =>
          events.map((event) => ({
            clientX: (event as MouseEvent).clientX,
            clientY: (event as MouseEvent).clientY,
          }))
        )
      ),
      fromEvent(this.canvas, 'touchstart').pipe(
        switchMap((e) => {
          return fromEvent(this.canvas, 'touchmove').pipe(
            takeUntil(fromEvent(this.canvas, 'touchend')),
            pairwise()
          );
        }),
        map((events) =>
          events.map((event) => ({
            clientX: (event as TouchEvent).touches[0].clientX,
            clientY: (event as TouchEvent).touches[0].clientY,
          }))
        )
      )
    ).subscribe((res) => {
      const rect = this.canvas.getBoundingClientRect();

      const prevPos = {
        x: res[0].clientX - rect.left,
        y: res[0].clientY - rect.top,
      };

      const currentPos = {
        x: res[1].clientX - rect.left,
        y: res[1].clientY - rect.top,
      };
      this.coordinates.push(currentPos);
      this.prediction = null;
      this.drawOnCanvas(prevPos, currentPos);
    });
  }

  private drawOnCanvas(
    prevPos: { x: number; y: number },
    currentPos: { x: number; y: number }
  ) {
    if (!this.cx) {
      return;
    }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }

  async onGuess() {
    const minX = Math.min(...this.coordinates.map((x) => x.x));
    const minY = Math.min(...this.coordinates.map((x) => x.y));
    const maxX = Math.max(...this.coordinates.map((x) => x.x));
    const maxY = Math.max(...this.coordinates.map((x) => x.y));

    const dpi = window.devicePixelRatio;
    const imgData = this.cx.getImageData(
      minX * dpi,
      minY * dpi,
      (maxX - minX) * dpi,
      (maxY - minY) * dpi
    );
    const tensor = tf.browser.fromPixels(imgData, 1);
    //resize to 28 x 28
    const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat();
    // Normalize the image
    const offset = tf.scalar(255.0);
    const normalized = tf.scalar(1.0).sub(resized.div(offset));
    // console.log(normalized);
    const batched = normalized.expandDims(0);

    // const resizedCanvas = document.createElement('canvas');
    // document.body.appendChild(resizedCanvas);
    // tf.browser.toPixels(normalized as tf.Tensor3D, resizedCanvas);

    this.model.predict(batched);
    this.prediction = await this.model.predict(batched);
  }

  // async onGuess() {
  //   const resizedCanvas = document.createElement('canvas');
  //   resizedCanvas.width = 28;
  //   resizedCanvas.height = 28;
  //   const ctx = resizedCanvas.getContext('2d');

  //   ctx.drawImage(
  //     this.canvas,
  //     0,
  //     0,
  //     this.canvas.width,
  //     this.canvas.height,
  //     0,
  //     0,
  //     resizedCanvas.width,
  //     resizedCanvas.height
  //   );

  //   const imageData = ctx.getImageData(
  //     0,
  //     0,
  //     resizedCanvas.width,
  //     resizedCanvas.height
  //   );
  //   const pixels = imageData.data;
  //   const inputs = new Float32Array(784);
  //   for (let i = 0; i < pixels.length; i += 4) {
  //     const lightness =
  //       255 -
  //       parseInt(String((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3), 10);
  //     pixels[i] = lightness;
  //     pixels[i + 1] = lightness;
  //     pixels[i + 2] = lightness;
  //     inputs[i / 4] = lightness / 255;
  //   }
  //   ctx.putImageData(imageData, 0, 0);
  //   document.body.appendChild(resizedCanvas);
  //   this.prediction = await this.model.predict(tf.tensor2d(inputs, [1, 784]));
  // }

  onClear() {
    this.coordinates = [];
    this.cx.fillStyle = '#fff';
    // this.cx.fillStyle = '#000';
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
