import { Network as Network } from "../Network";
import { Optimizer } from "./Optimizer";

export class AdamOptimizer implements Optimizer {
    Net: Network;
    LearningRate: number;
    Beta1: number;
    Beta2: number;
    Epsilon: number;

    BiasChangesLow: Map<string, number>;
    BiasChangesHigh: Map<string, number>;
    WeightChangesLow: Map<string, number>;
    WeightChangesHigh: Map<string, number>;

    Iterations: number = 0;

    constructor(net: Network, options: AdamOptimizerOptions) {
        this.Net = net;
        this.LearningRate = options.LearningRate;
        this.Beta1 = options.Beta1;
        this.Beta2 = options.Beta2;
        this.Epsilon = options.Epsilon;

        this.BiasChangesLow = this.ZeroMap();
        this.BiasChangesHigh = this.ZeroMap();
        this.WeightChangesLow = this.ZeroMap();
        this.WeightChangesHigh = this.ZeroMap();
    }

    public AdjustWeights() {
        this.Iterations++;

        for (let layerIdx = 1; layerIdx < this.Net.Nodes.length; layerIdx++) {
            let layer = this.Net.Nodes[layerIdx];

            for (let nodeIndex = 0; nodeIndex < layer.length; nodeIndex++) {
                let node = layer[nodeIndex];

                const biasGradient = node._back_sumInputDer / node._back_countInputDer;
                const biasChangeLow = this.BiasChangesLow.get(node.Id)! * this.Beta1 + (1 - this.Beta1) * biasGradient;
                const biasChangeHigh = this.BiasChangesHigh.get(node.Id)! * this.Beta2 + (1 - this.Beta2) * biasGradient * biasGradient;

                const biasMomentumCorrection = this.BiasChangesLow.get(node.Id)! / (1 - Math.pow(this.Beta1, this.Iterations));
                const biasGradientCorrection = this.BiasChangesHigh.get(node.Id)! / (1 - Math.pow(this.Beta2, this.Iterations));

                this.BiasChangesLow.set(node.Id, biasChangeLow);
                this.BiasChangesHigh.set(node.Id, biasChangeHigh);
                node.Bias += this.LearningRate * biasMomentumCorrection / (Math.sqrt(biasGradientCorrection) + this.Epsilon);
                node.ClearComputed();

                for (let i = 0; i < node.Inputs.length; i++) {
                    let input = node.Inputs[i];
                    const gradient = input._back_sumErrorDer / input._back_countErrorDer;

                    const changeLow = this.WeightChangesLow.get(input.Id)! * this.Beta1 + (1 - this.Beta1) * gradient;
                    const changeHigh = this.WeightChangesHigh.get(input.Id)! * this.Beta2 + (1 - this.Beta2) * gradient * gradient;

                    const momentumCorrection = changeLow / (1 - Math.pow(this.Beta1, this.Iterations));
                    const gradientCorrection = changeHigh / (1 - Math.pow(this.Beta2, this.Iterations));

                    this.WeightChangesLow.set(input.Id, changeLow);
                    this.WeightChangesHigh.set(input.Id, changeHigh);
                    input.Weight += this.LearningRate * momentumCorrection / (Math.sqrt(gradientCorrection) + this.Epsilon);
                    input.ClearComputed();
                }
            }
        }
    }

    private ZeroMap() {
        let map = new Map<string, number>()
        for (let layerIndex = 1; layerIndex < this.Net.Nodes.length; layerIndex++) {
            let layer = this.Net.Nodes[layerIndex];

            for (let nodeIndex = 0; nodeIndex < layer.length; nodeIndex++) {
                let node = layer[nodeIndex];
                map.set(node.Id, 0);
                for (let i = 0; i < node.Inputs.length; i++) {
                    let input = node.Inputs[i];
                    map.set(input.Id, 0);
                }
            }
        }
        return map;
    }

}

export class AdamOptimizerOptions {
    LearningRate: number;
    Beta1: number;
    Beta2: number;
    Epsilon: number;

    constructor() {
        this.LearningRate = 0.003;
        this.Beta1 = 0.9;
        this.Beta2 = 0.999;
        this.Epsilon = 1e-8;
    }
}