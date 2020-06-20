import { Network as Network } from "../Network";
import { Optimizer } from "./Optimizer";

export class SGDOptimizer implements Optimizer {
    Net: Network;
    Options: SGDOptimizerOptions;
    EffectiveLearningRate: number;
    Momentum: number;
    LearningRateDecay: number;
    Nesterov: boolean;
    LastChanges: Map<string, number>;

    constructor(net: Network, options: SGDOptimizerOptions) {
        this.Net = net;
        this.Options = options;
        this.EffectiveLearningRate = options.LearningRate;
        this.Momentum = options.Momentum;
        this.LearningRateDecay = options.LearningRateDecay;
        this.Nesterov = options.Nesterov;
        this.LastChanges = this.ZeroMap();
    }

    public AdjustWeights() {
        this.EffectiveLearningRate = this.LearningRateDecay * this.EffectiveLearningRate;

        for (let layerIndex = 1; layerIndex < this.Net.Nodes.length; layerIndex++) {
            let layer = this.Net.Nodes[layerIndex];

            for (let nodeIndex = 0; nodeIndex < layer.length; nodeIndex++) {
                let node = layer[nodeIndex];
                let change = this.getChange(node._back_sumInputDer / node._back_countInputDer, this.LastChanges.get(node.Id)!);
                node.Bias += change;
                node.ClearComputed();
                this.LastChanges.set(node.Id, change);

                for (let i = 0; i < node.Inputs.length; i++) {
                    let input = node.Inputs[i];
                    let change = this.getChange(input._back_sumErrorDer / input._back_countErrorDer, this.LastChanges.get(input.Id)!);
                    input.Weight += change;
                    input.ClearComputed();
                    this.LastChanges.set(input.Id, change);
                }
            }
        }
    }

    private getChange(gradient: number, lastChange: number) {
        let grad = this.EffectiveLearningRate * gradient;
        let vect = this.Momentum * lastChange + grad;

        if (this.Nesterov) {
            return this.Momentum * vect + grad;
        }
        else {
            return vect;
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

export class SGDOptimizerOptions {
    LearningRate: number;
    Momentum: number;
    LearningRateDecay: number;
    Nesterov: boolean;

    constructor() {
        this.LearningRate = 0.03;
        this.LearningRateDecay = 1;
        this.Momentum = 0;
        this.Nesterov = false;
    }
}