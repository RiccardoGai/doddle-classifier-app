import * as tf from '@tensorflow/tfjs';
import { Tensor } from '@tensorflow/tfjs';
import * as jsonClasses from 'assets/doddle-model/classes.json';

export class DoddleClassifier {
  private model: tf.LayersModel;
  private classes: string[];
  constructor() {}

  async loadModel() {
    this.model = await tf.loadLayersModel('assets/doddle-model/model.json');
    const { classes } = jsonClasses;
    this.classes = classes;
  }

  async predict(data: tf.Tensor) {
    const argMax = await (
      this.model.predict(
        data // .reshape([1, 28, 28, 1])
      ) as Tensor
    )
      .argMax(-1)
      .data();
    return this.classes[argMax[0]];
  }

  async predictTopN(data: tf.Tensor, n: number) {
    const prediction = await (
      this.model.predict(
        data // .reshape([1, 28, 28, 1])
      ) as Tensor
    ).data();
    const topValues = Array.from(
      [...prediction].sort((a, b) => b - a).slice(0, n)
    );
    return topValues.map((x) => ({
      label: this.classes[prediction.indexOf(x)],
      accuracy: x,
    }));
  }
}
