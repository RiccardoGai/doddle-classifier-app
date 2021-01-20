import * as tf from '@tensorflow/tfjs';
import { Tensor } from '@tensorflow/tfjs';
import * as jsonClasses from 'assets/doddle-model/classes.json';

export class DoddleClassifier {
  private model: tf.LayersModel;
  private classes: string[];
  constructor() {}

  async loadModel() {
    this.model = await tf.loadLayersModel('assets/doddle-model/model.json');
    this.classes = jsonClasses.classes;
  }

  async predict(data: tf.Tensor) {
    const prediction = await (this.model.predict(
      data.reshape([1, 28, 28, 1])
    ) as Tensor).data();
    console.log(prediction);
    return this.classes[prediction.indexOf(Math.max(...prediction))];
  }
}
