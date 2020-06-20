import { Mathx } from "../helpers/Mathx";
import { LabeledDataItem } from "./LabeledDataItem";

export class DatasetCreator2To1 {
    Dimentions: 1 = 1;
    LabelFunc: (a: number, b: number) => number;

    constructor(labelFunc: (a: number, b: number) => number) {
        this.LabelFunc = labelFunc;
    }

    Generate(sampleCount: number, aMin: number, aMax: number, bMin: number, bMax: number): Dataset2To1[] {
        let dataset: Dataset2To1[] = [];
        for (let i = 0; i < sampleCount; i++) {
            let x = Mathx.Round2Digits(Mathx.Rand(aMin, aMax));
            let y = Mathx.Round2Digits(Mathx.Rand(bMin, bMax));
            let label = this.LabelFunc(x, y);
            dataset.push({ a: x, b: y, label: label });
        }
        return dataset;
    }

    GenerateIntegers(sampleCount: number, aMin: number, aMax: number, bMin: number, bMax: number): Dataset2To1[] {
        let dataset: Dataset2To1[] = [];
        for (let i = 0; i < sampleCount; i++) {
            let x = Mathx.RandInt(aMin, aMax);
            let y = Mathx.RandInt(bMin, bMax);
            let label = this.LabelFunc(x, y);
            dataset.push({ a: x, b: y, label: label });
        }
        return dataset;
    }
}

export class Dataset2To1Helper {
    public static ToLabelled(dataset: Dataset2To1[]): LabeledDataItem[] {
        return dataset.map(p => ({ In: [p.a, p.b], Out: [p.label] }));
    }
}

export interface Dataset2To1 {
    a: number;
    b: number;
    label: number;
}

