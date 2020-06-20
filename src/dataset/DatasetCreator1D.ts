import { Mathx } from "../helpers/Mathx";

export class DatasetCreator1D {
    Dimentions: 1 = 1;
    LabelFunc: (a: number) => number;

    constructor(labelFunc: (a: number) => number) {
        this.LabelFunc = labelFunc;
    }

    Generate(sampleCount: number, boundaryMin: number, boundaryMax: number): Dataset1D[] {
        let dataset: Dataset1D[] = [];
        for (let i = 0; i < sampleCount; i++) {
            let x = Mathx.Rand(boundaryMin, boundaryMax);
            let label = this.LabelFunc(x);
            dataset.push({ a: x, label: label });
        }
        return dataset;
    }

    GenerateIntegers(sampleCount: number, boundaryMin: number, boundaryMax: number): Dataset1D[] {
        let dataset: Dataset1D[] = [];
        for (let i = 0; i < sampleCount; i++) {
            let x = Mathx.RandInt(boundaryMin, boundaryMax);
            let label = this.LabelFunc(x);
            dataset.push({ a: x, label: label });
        }
        return dataset;
    }
}

export interface Dataset1D {
    a: number;
    label: number;
}