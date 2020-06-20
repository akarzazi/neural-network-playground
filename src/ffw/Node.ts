import { Link } from "./Link";
import { Activation } from "./Activation";


export class Node {

    Bias: number;
    Activation: Activation;
    Id: string;
    Inputs: Link[];
    Outputs: Link[];

    _totalInput: number = 0;
    _output: number = 0;

    _back_outputDer: number = 0;
    _back_inputDer: number = 0;
    _back_sumInputDer: number = 0;
    _back_countInputDer: number = 0;

    constructor(bias: number, activation: Activation, id: string) {
        this.Bias = bias;
        this.Id = id;
        this.Activation = activation;
        this.Inputs = [];
        this.Outputs = [];
    }

    ComputeOutput() {
        this._totalInput = this.Bias;
        for (let j = 0; j < this.Inputs.length; j++) {
            let link = this.Inputs[j];
            this._totalInput += link.Weight * link.Src._output;
        }
        this._output = this.Activation.impl(this._totalInput);
        return this._output;
    }

    ClearComputed() {
        this._totalInput = 0;
        this._output = 0;
        this._back_outputDer = 0;
        this._back_inputDer = 0;
        this._back_sumInputDer = 0;
        this._back_countInputDer = 0;
    }
}