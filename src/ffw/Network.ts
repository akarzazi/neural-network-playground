import { Layer } from "./Layer";
import { Node } from "./Node";
import { Link } from "./Link";
import { Activations, ActivationType } from "./Activation";
import { Mathx } from "../helpers/Mathx";

export class Network {
    Nodes: Node[][];

    constructor() {
        this.Nodes = [];
    }

    public static Build(layers: Layer[]) {
        let net = new Network();

        for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
            const layer = layers[layerIdx];
            net.Nodes[layerIdx] = [];

            for (let nodeIdx = 0; nodeIdx < layer.NodesCount; nodeIdx++) {
                let nodeId = "L" + layerIdx + ':' + nodeIdx;
                // let r = Mathx.Rand(0, 1)

                if (layerIdx == 0) {
                    net.Nodes[layerIdx].push(new Node(0, Activations.LINEAR, nodeId));
                    continue;
                }

                let node = new Node(Mathx.Rand(-1, 1), layer.Activation || Activations.LINEAR, nodeId);
                net.Nodes[layerIdx].push(node);

                let prevLayerNodes = net.Nodes[layerIdx - 1];
                for (let prevNodeIdx = 0; prevNodeIdx < prevLayerNodes.length; prevNodeIdx++) {
                    let prevNode = prevLayerNodes[prevNodeIdx];
                    let link = new Link(Mathx.Rand(-1, 1), prevNode, node);
                    prevNode.Outputs.push(link);
                    node.Inputs.push(link);
                }
            }
        }
        return net;
    }

    static FromJson(json: NetworkJSON) {
        let net = new Network();

        for (let layerIdx = 0; layerIdx < json.nodes.length; layerIdx++) {
            const layer = json.nodes[layerIdx];
            net.Nodes[layerIdx] = [];

            for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
                let nodeId = "L" + layerIdx + ':' + nodeIdx;
                let nodejs = layer[nodeIdx];
                let node = new Node(nodejs.bias, nodejs.activation ? Activations.GetById(nodejs.activation) : Activations.LINEAR, nodeId);
                net.Nodes[layerIdx].push(node);

                if (layerIdx == 0)
                    continue;

                let prevLayerNodes = net.Nodes[layerIdx - 1];
                for (let prevNodeIdx = 0; prevNodeIdx < prevLayerNodes.length; prevNodeIdx++) {
                    let prevNode = prevLayerNodes[prevNodeIdx];
                    let link = new Link(nodejs.inputs[prevNodeIdx], prevNode, node);
                    prevNode.Outputs.push(link);
                    node.Inputs.push(link);
                }
            }
        }
        return net;
    }


    ToJson(): NetworkJSON {
        let nodesJson: NodeJSON[][] = [];
        for (let layerIdx = 0; layerIdx < this.Nodes.length; layerIdx++) {
            const layer = this.Nodes[layerIdx];
            let jsonLayer: NodeJSON[] = [];
            nodesJson.push(jsonLayer);
            for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
                let node = layer[nodeIdx];
                if (layerIdx == 0) {
                    jsonLayer.push({ activation: undefined, bias: 0, inputs: [] })
                } else {
                    let nodeJson: NodeJSON = { activation: node.Activation.id, bias: node.Bias, inputs: [] };
                    jsonLayer.push(nodeJson)
                    for (let linkIdx = 0; linkIdx < node.Inputs.length; linkIdx++) {
                        nodeJson.inputs.push(node.Inputs[linkIdx].Weight)
                    }
                }
            }
        }

        //  let topology: number[] = this.Nodes.map(p => p.length);
        return { nodes: nodesJson };
    }

    Randomize() {
        for (let layerIdx = 1; layerIdx < this.Nodes.length; layerIdx++) {
            const layer = this.Nodes[layerIdx];

            for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
                let node = layer[nodeIdx];
                node.ClearComputed();
                node.Bias = Mathx.Rand(-1, 1);

                for (let linkIdx = 0; linkIdx < node.Inputs.length; linkIdx++) {
                    node.Inputs[linkIdx].ClearComputed();
                    node.Inputs[linkIdx].Weight = node.Bias = Mathx.Rand(-1, 1);
                }
            }
        }
    }
}

export interface NetworkJSON {
    nodes: NodeJSON[][];
}

export interface NodeJSON {
    activation?: ActivationType;
    bias: number;
    inputs: number[];
}