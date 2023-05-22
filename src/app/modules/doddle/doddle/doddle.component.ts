import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import {
  switchMap,
  takeUntil,
  pairwise,
  map,
  debounceTime,
} from 'rxjs/operators';
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
  // private coordinates: { x: number; y: number }[] = [];
  private drawing$ = new Subject();
  predictions: { label: string; accuracy: number }[] = [];

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.initCanvas();
  }
  constructor() {}

  ngOnInit() {
    this.model = new DoddleClassifier();
    this.model.loadModel();

    this.drawing$.pipe(debounceTime(250)).subscribe(() => {
      this.onGuess();
    });
  }

  private initCanvas() {
    this.canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
    this.cx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.cx.lineWidth = 16;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = 'black';
    this.cx.fillStyle = '#ffffff';
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  ngAfterViewInit() {
    this.initCanvas();
    merge(
      fromEvent(this.canvas, 'mousedown').pipe(
        switchMap(() => {
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
        switchMap(() => {
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
      // this.coordinates.push(currentPos);

      this.cx.beginPath();

      if (prevPos) {
        this.cx.moveTo(prevPos.x, prevPos.y);
        this.cx.lineTo(currentPos.x, currentPos.y);
        this.cx.stroke();
      }
      this.drawing$.next(null);
    });
  }

  async onGuess() {
    // const minX = Math.min(...this.coordinates.map((x) => x.x));
    // const minY = Math.min(...this.coordinates.map((x) => x.y));
    // const maxX = Math.max(...this.coordinates.map((x) => x.x));
    // const maxY = Math.max(...this.coordinates.map((x) => x.y));

    // const dpi = window.devicePixelRatio;
    // const imgData = this.cx.getImageData(
    //   minX * dpi,
    //   minY * dpi,
    //   (maxX - minX) * dpi,
    //   (maxY - minY) * dpi
    // );

    const imgData = this.cx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    tf.tidy(() => {
      const tensor = tf.browser.fromPixels(imgData, 1);
      const resized = tf.image
        .resizeBilinear(tensor, [28, 28])
        .reshape([28, 28, 1])
        .toFloat();
      const normalized = tf.scalar(1.0).sub(resized.div(tf.scalar(255.0)));

      const batched = normalized.expandDims(0);

      // const resizedCanvas = document.createElement('canvas');
      // document.body.appendChild(resizedCanvas);
      // tf.browser.toPixels(normalized as tf.Tensor3D, resizedCanvas);
      this.model.predictTopN(batched, 5).then((predictions) => {
        this.predictions = predictions;
      });
    });
  }

  onClear() {
    // this.coordinates = [];
    this.predictions = [];
    this.cx.fillStyle = '#ffffff';
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
