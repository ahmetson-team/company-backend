import { CircuitId, FSCircuitStorage } from '@0xpolygonid/js-sdk';
import path from 'path';

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const circuitsFolder = process.env.CIRCUITS_PATH as string;

console.log(process.env.CIRCUITS_PATH);

export class CircuitStorageInstance {
  static instance: FSCircuitStorage;

  static async init() {
    if (!this.instance) {
      console.log(circuitsFolder, __dirname);
      this.instance = new FSCircuitStorage({
        dirname: path.join(__dirname, '../../', circuitsFolder),
      });
    }
  }

  static getCircuitStorageInstance() {
    return this.instance;
  }
}
