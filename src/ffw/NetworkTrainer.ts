import { Network } from "./Network";
import { SGDOptimizer, SGDOptimizerOptions } from "./optimizers/SGDOptimizer";
import { Mathx } from "../helpers/Mathx";
import { Optimizer, OptimizerOptions } from "./optimizers/Optimizer";
import { ErrorFunction } from "./Error";
import { AdamOptimizer, AdamOptimizerOptions } from "./optimizers/AdamOptimizer";
import { LabeledDataItem } from "../dataset/LabeledDataItem";

export class NetworkTrainer {
    Net: Network;

    constructor(network: Network) {
        this.Net = network;
    }

    public Predict(input: number[]): number[] {
        let lastLayerIndex = this.Net.Nodes.length - 1;
        this.FeedForward(input);
        return this.Net.Nodes[lastLayerIndex].map(p => p._output);
    }

    public TrainStep(optimizer: Optimizer, trainData: LabeledDataItem[], batchSize: number, errorFunction: ErrorFunction) {
        let batches = Mathx.Batch(trainData, batchSize);

        for (let batch of batches) {
            this.TrainBatch(batch, errorFunction);
            optimizer.AdjustWeights();
        }

        return this.ComputeLoss(trainData, errorFunction);
    }

    public Train(trainData: LabeledDataItem[], testData: LabeledDataItem[], options: TrainingOptions2) {
        let optimizer = this.CreateOptimizer(options.OptimizerOptions);

        for (let iteration = 0; iteration < options.Iterations; iteration++) {

            let trainingData = Mathx.Shuffle(trainData);
            let batches = Mathx.Batch(trainData, options.BatchSize);

            for (let batch of batches) {
                this.TrainBatch(batch, options.ErrorFunction);
                optimizer.AdjustWeights();
            }

            if (options.LossCallBack) {
                let trainLoss = this.ComputeLoss(trainingData, options.ErrorFunction);
                let testLoss = this.ComputeLoss(testData, options.ErrorFunction);
                options.LossCallBack(iteration, trainLoss, testLoss)
            }
        }
    }

    public ComputeLoss(data: LabeledDataItem[], errorFunction: ErrorFunction): number[] {

        let outputNodes = this.Net.Nodes[this.Net.Nodes.length - 1];
        let sumLoss: number[] = Mathx.Zeros(outputNodes.length);
        for (let i = 0; i < data.length; i++) {
            let dataItem = data[i];
            this.FeedForward(dataItem.In);
            for (let nodeIdx = 0; nodeIdx < outputNodes.length; nodeIdx++) {
                let node = outputNodes[nodeIdx];
                sumLoss[nodeIdx] += errorFunction.error(node._output, dataItem.Out[nodeIdx]);
            }
        }
        return sumLoss.map(p => p / data.length);
    }

    private TrainBatch(batch: LabeledDataItem[], errorFunction: ErrorFunction) {

        for (let itemIndex = 0; itemIndex < batch.length; itemIndex++) {
            const data = batch[itemIndex];
            this.FeedForward(data.In);
            this.BackPropagate(data.Out, errorFunction)
        }
    }

    private FeedForward(input: number[]) {
        let inputLayer = this.Net.Nodes[0];
        if (this.Net.Nodes[0].length != input.length)
            throw `Input Size do not match ${input.length} net input ${this.Net.Nodes[0].length}`;

        // Update the input layer.
        for (let i = 0; i < inputLayer.length; i++) {
            let node = inputLayer[i];
            node._output = input[i];
        }

        for (let layerIdx = 1; layerIdx < this.Net.Nodes.length; layerIdx++) {
            let currentLayer = this.Net.Nodes[layerIdx];
            for (let i = 0; i < currentLayer.length; i++) {
                let node = currentLayer[i];
                node.ComputeOutput();
            }
        }
    }

    BackPropagate(target: number[], errorFunc: ErrorFunction): void {

        let outputNodes = this.Net.Nodes[this.Net.Nodes.length - 1];
        for (let nodeIdx = 0; nodeIdx < outputNodes.length; nodeIdx++) {
            let node = outputNodes[nodeIdx];
            node._back_outputDer = - errorFunc.der(node._output, target[nodeIdx]);
        }

        // Go through the layers backwards.
        for (let layerIdx = this.Net.Nodes.length - 1; layerIdx >= 1; layerIdx--) {
            let currentLayer = this.Net.Nodes[layerIdx];
            // Compute the error derivative of each node with respect to:
            // 1) its total input
            // 2) each of its input weights.
            for (let i = 0; i < currentLayer.length; i++) {
                let node = currentLayer[i];
                node._back_inputDer = node._back_outputDer * node.Activation.der(node._totalInput);
                node._back_sumInputDer += node._back_inputDer;
                node._back_countInputDer++;
            }

            // Error derivative with respect to each weight coming into the node.
            for (let i = 0; i < currentLayer.length; i++) {
                let node = currentLayer[i];
                for (let j = 0; j < node.Inputs.length; j++) {
                    let link = node.Inputs[j];

                    link._back_errorDer = node._back_inputDer * link.Src._output;
                    link._back_sumErrorDer += link._back_errorDer;
                    link._back_countErrorDer++;
                }
            }
            if (layerIdx === 1) {
                continue;
            }
            let prevLayer = this.Net.Nodes[layerIdx - 1];
            for (let i = 0; i < prevLayer.length; i++) {
                let node = prevLayer[i];
                // Compute the error derivative with respect to each node's output.
                node._back_outputDer = 0;
                for (let j = 0; j < node.Outputs.length; j++) {
                    let output = node.Outputs[j];
                    node._back_outputDer += output.Weight * output.Dest._back_inputDer;
                }
            }
        }
    }

    private CreateOptimizer(optimizerOptions: OptimizerOptions) {
        if (optimizerOptions instanceof SGDOptimizerOptions) {
            return new SGDOptimizer(this.Net, optimizerOptions);
        }

        if (optimizerOptions instanceof AdamOptimizerOptions) {
            return new AdamOptimizer(this.Net, optimizerOptions);
        }

        throw 'unkown optimizer';
    }
}

export interface TrainingOptions2 {
    OptimizerOptions: OptimizerOptions;
    ErrorFunction: ErrorFunction;
    Iterations: number;
    BatchSize: number;
    //  TestDataRatio: number;
    LossCallBack?: ((iteration: number, trainLoss: number[], testLoss: number[]) => void);

}

export interface TrainingStepOptions {
    OptimizerOptions: OptimizerOptions;
    ErrorFunction: ErrorFunction;
    BatchSize: number;
}