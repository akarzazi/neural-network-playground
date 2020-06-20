import * as React from 'react';
import { NetworkJSON, NodeJSON, Network } from '../../../ffw/Network';
import "./NetworkEditor.css"
import { ActivationTypeEnum, ActivationType } from '../../../ffw/Activation';
import { SelectOptionProps, Select } from '../../components/Select/Select';
import { Mathx } from '../../../helpers/Mathx';
import * as Color from '../../helpers/Color';

function getRandomWeight() {
    return Mathx.Rand(-1, 1);
}

var activationFunctionOptions: SelectOptionProps<ActivationTypeEnum>[] = Object.values(ActivationTypeEnum).map(p => ({ value: p, label: p }));

var maxStrokeWidth = 5;
var minStrokeWidth = 0.5;

var negativeStroke: Color.HSLA = { h: 15, s: 1, l: 0.4, a: 0.6 }
var positiveStroke: Color.HSLA = { h: 182, s: 0.25, l: 0.50, a: 0.6 }

interface TwoPoints {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

interface NeuronUi {
    layer: number,
    index: number,
    node: HTMLDivElement
}

interface DomRect {
    readonly top: number;
    readonly bottom: number;

    readonly left: number;
    readonly right: number;

    readonly width: number;
    readonly height: number;
}

export interface Props {
    inputLabels: string[]
    network: NetworkJSON;
    disabledEdit: boolean;
    onNetworkTopographyChange?: (newValue: NetworkJSON) => void;
}

export function NetworkEditor(props: Props) {
    const [jsonNetwork, setJsonNetwork] = React.useState(props.network);
    const layersCount = jsonNetwork.nodes.length;
    // Create our reference
    const networkViewRef = React.useRef(null as unknown as HTMLDivElement);
    const svgRef = React.useRef(null as unknown as SVGSVGElement);

    React.useEffect(() => {
        setJsonNetwork(props.network);
    }, [props.network]);

    React.useLayoutEffect(() => {
        DrawArrows();
    });

    React.useLayoutEffect(() => {

        function onResize() {
            DrawArrows();
        }

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [jsonNetwork]);

    // React.useEffect(() => console.log(JSON.stringify(jsonNetwork, null, '\t')));

    function setNetworkAndRaiseChange(net?: NetworkJSON) {
        var copy = { ...(net ?? jsonNetwork) }
        setJsonNetwork(copy);
        props.onNetworkTopographyChange?.(copy)
    }

    function onRemoveNode(layer: number) {
        let nodes = jsonNetwork.nodes[layer];
        if (nodes.length <= 1) {
            return;
        }

        nodes.pop();
        reComputeLinks();
        setNetworkAndRaiseChange();
    }

    function onAddNode(layer: number) {
        let nodes = jsonNetwork.nodes[layer];
        if (nodes.length > 10) {
            return;
        }

        nodes.push(createNode(layer));
        reComputeLinks();
        setNetworkAndRaiseChange();
    }

    function createNode(layer: number): NodeJSON {
        let nodes = jsonNetwork.nodes[layer];
        let bias = getRandomWeight();
        let activation = nodes[0].activation;

        let inputs = jsonNetwork.nodes[layer - 1].map(_p => getRandomWeight());
        return { activation: activation, bias: bias, inputs: inputs }
    }

    function onAddHiddenLayer() {
        var prev2Layer = jsonNetwork.nodes.length - 1;
        jsonNetwork.nodes.splice(prev2Layer, 0, [createNode(prev2Layer)]);
        reComputeLinks();
        setNetworkAndRaiseChange();
    }

    function onRemoveHiddenLayer() {
        if (jsonNetwork.nodes.length <= 2)
            return;

        jsonNetwork.nodes.splice(jsonNetwork.nodes.length - 2, 1);
        reComputeLinks();
        setNetworkAndRaiseChange();
    }

    function onActivationChange(activationType: ActivationType, layer: number) {
        let nodes = jsonNetwork.nodes[layer];
        for (const node of nodes) {
            node.activation = activationType;
        }

        setNetworkAndRaiseChange();
    }

    function reComputeLinks() {
        for (let layerIdx = 0; layerIdx < jsonNetwork.nodes.length; layerIdx++) {
            const layer = jsonNetwork.nodes[layerIdx];

            for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
                let node = layer[nodeIdx];
                if (layerIdx == 0) {
                    if (node.inputs.length > 0) {
                        throw "Inputs nodes should not have links";
                    }
                } else {
                    var prevLayerLength = jsonNetwork.nodes[layerIdx - 1].length;
                    var diff = node.inputs.length - prevLayerLength;
                    if (diff > 0) {
                        node.inputs.splice(prevLayerLength, diff)
                    }
                    if (diff < 0) {
                        for (let i = 0; i < -diff; i++) {
                            node.inputs.push(getRandomWeight());
                        }
                    }
                }
            }
        }
    }

    function DrawArrows() {
        var netView = networkViewRef.current;
        //   var neurons = netView.querySelectorAll(".neuron");
        let neronsNet = getNeuronsNet();
        let baseRect = netView.getBoundingClientRect();

        while (svgRef.current.lastChild) {
            svgRef.current.removeChild(svgRef.current.lastChild);
        }
        // 

        var inputsBoundary = getInputsAbsBoudary();
        // console.log(inputsBoundary);

        for (let layerIdx = 1; layerIdx < neronsNet.length; layerIdx++) {
            const layer = neronsNet[layerIdx];

            for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
                var prevLayer = neronsNet[layerIdx - 1];
                let targetNode = layer[nodeIdx];
                let targetRec = GetRelativeRect(baseRect, targetNode.node.getBoundingClientRect());


                for (let sourceidx = 0; sourceidx < prevLayer.length; sourceidx++) {
                    let sourceNode = prevLayer[sourceidx];
                    let sourceRec = GetRelativeRect(baseRect, sourceNode.node.getBoundingClientRect());
                    var link = jsonNetwork.nodes[targetNode.layer][targetNode.index].inputs[sourceidx];
                    let pathId = `L${layerIdx}N${nodeIdx}S${sourceidx}`;

                    let strockWidth = getNormalizedArrowStroke(Math.abs(link), inputsBoundary.min, inputsBoundary.max, inputsBoundary.avg);
                    let color = link > 0 ? positiveStroke : negativeStroke;
                    let pathPoints: TwoPoints =
                    {
                        x1: sourceRec.right,
                        y1: (sourceRec.bottom + sourceRec.top) / 2,
                        x2: targetRec.left,
                        y2: (targetRec.bottom + targetRec.top) / 2,
                    }

                    svgRef.current.appendChild(createPath(pathId, strockWidth, color, pathPoints));
                    svgRef.current.appendChild(createText(pathId, link.toFixed(2)));
                }
            }
        }
    }

    function getInputsAbsBoudary() {
        var x = jsonNetwork.nodes.flatMap(p => p.flatMap(x => x.inputs)).map(Math.abs);
        return {
            min: Math.min(...x),
            max: Math.max(...x),
            avg: Mathx.Avg(x)
        }
    }

    function getNormalizedArrowStroke(value: number, _minValue: number, _maxValue: number, avg: number) {
        if (avg == 0)
            return minStrokeWidth;

        // let valueRatio = (value - minValue) / (maxValue - minValue);
        // let strokeRange = maxStrokeWidth - minStrokeWidth;
        let avgStroke = (maxStrokeWidth + minStrokeWidth) / 2;

        let valueRatio2 = value / avg;
        let width = valueRatio2 * avgStroke;
        //  return (minStrokeWidth + valueRatio * strokeRange);
        return Mathx.Clamp(width, minStrokeWidth, maxStrokeWidth);
    }

    function getNeuronsNet(): NeuronUi[][] {
        var netView = networkViewRef.current;
        var neurons = Array.from(netView.querySelectorAll(".neuron")) as HTMLDivElement[];

        var neuronsAndIndex = neurons.map(p => ({
            layer: Number(p.getAttribute("data-layer")),
            index: Number(p.getAttribute("data-index")),
            node: p
        }));

        neuronsAndIndex.sort((a, b) => a.layer - b.layer || a.index - b.index);

        let indexedNeuronUi: NeuronUi[][] = [];
        for (const neuron of neuronsAndIndex) {
            let currentLayer = indexedNeuronUi[neuron.layer];
            if (currentLayer == undefined) {
                indexedNeuronUi.push(currentLayer = []);
            }
            currentLayer.push(neuron);
        }
        return indexedNeuronUi;
    }

    function createText(pathId: string, text: string) {
        var textElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
        var textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");

        textElem.setAttribute("dy", "-2");
        textPath.setAttribute("href", `#${pathId}`);
        textPath.setAttribute("startOffset", `30%`);
        textPath.textContent = text;

        textElem.appendChild(textPath);
        return textElem;
    }

    function createPath(pathId: string, strokeWidth: number, color: Color.HSLA, points: TwoPoints) {
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${points.x1} ${points.y1} L ${points.x2} ${points.y2}`);
        path.setAttribute("id", pathId);
        path.setAttribute("stroke", Color.hslaToString(color));
        path.setAttribute("stroke-width", strokeWidth.toString());
        return path;
    }

    function GetRelativeRect(parent: DomRect, child: DomRect): DomRect {
        return {
            top: child.top - parent.top,
            bottom: child.bottom - parent.top,
            left: child.left - parent.left,
            right: child.right - parent.left,
            height: child.height,
            width: child.width
        }
    }

    function onRandomize() {
        let net = Network.FromJson(jsonNetwork);
        net.Randomize();
        setNetworkAndRaiseChange(net.ToJson());
    }

    function buildInputNeuron(index: number) {
        return <div key={index} data-layer={0} data-index={index} className="neuron" > {props.inputLabels[index]} </div >
    }

    function buildNeuron(layer: number, index: number) {
        let node = jsonNetwork.nodes[layer][index];
        return <div key={index} data-layer={layer} data-index={index} className="neuron" > {"B " + Mathx.Round2Digits(node.bias)} <br /> {node.activation}</div >
    }

    var hiddenLayers = [] as any;
    jsonNetwork.nodes.forEach((nodes, layer) => {
        if (layer == 0 || layer == jsonNetwork.nodes.length - 1) {
            return;
        }

        hiddenLayers.push(
            <div key={layer} className="hidden-layer">
                <div key={"layer-settings" + layer} className="layer-settings">
                    <div className="inline-labelled-control">
                        <Select<ActivationType>
                            options={activationFunctionOptions}
                            value={nodes[0].activation || ActivationTypeEnum.LINEAR}
                            placeholder={'Select Generation Template'}
                            onChange={(newValue) => onActivationChange(newValue, layer)}
                            disabled={props.disabledEdit}
                        />
                    </div>
                    <div className="buttons">
                        <button onClick={_p => onRemoveNode(layer)} disabled={props.disabledEdit}>-</button>
                        <button onClick={_p => onAddNode(layer)} disabled={props.disabledEdit}>+</button>
                    </div>
                </div>
                <div key={"neurons-vertical" + layer} className="neurons-vertical">
                    {
                        nodes.map((_p, i) => buildNeuron(layer, i))
                    }
                </div>
            </div>)
    }
    );

    return (
        <>

            <div className="NetworkEditor">
                <div className="action-zone">
                    <button onClick={onRandomize} disabled={props.disabledEdit}>Randomize</button>
                </div>
                <div className="hidden-layers-settings">
                    <span className="label">
                        <span className="count">{layersCount - 2}</span>
                    Hidden layers
                </span>
                    <span className="buttons">
                        <button onClick={onRemoveHiddenLayer} disabled={props.disabledEdit}>-</button>
                        <button onClick={onAddHiddenLayer} disabled={props.disabledEdit}>+</button>
                    </span>
                </div>
                <div className="network-view" ref={networkViewRef}>
                    <svg className="svg-arrows" ref={svgRef}>

                    </svg>
                    <div className="input-layer">
                        <div className="layer-settings" style={{ visibility: "hidden" }}>
                            <div className="inline-labelled-control">
                                <Select options={[]} value={0} />
                            </div>
                        </div>
                        <div className="neurons-vertical">
                            {
                                jsonNetwork.nodes[0].map((_p, i) => buildInputNeuron(i))
                            }
                        </div>
                    </div>

                    <div className="hidden-layers">
                        {hiddenLayers}
                    </div>

                    <div className="outputlayer">
                        <div className="layer-settings">
                            <div className="inline-labelled-control">
                                <Select<ActivationType>
                                    options={activationFunctionOptions}
                                    value={jsonNetwork.nodes[layersCount - 1][0].activation || ActivationTypeEnum.LINEAR}
                                    placeholder={'Select Generation Template'}
                                    onChange={(newValue) => onActivationChange(newValue, layersCount - 1)}
                                    disabled={props.disabledEdit}
                                />
                            </div>
                        </div>
                        <div className="neurons-vertical">
                            {
                                jsonNetwork.nodes[layersCount - 1].map((_p, _i) => buildNeuron(layersCount - 1, 0))
                            }
                        </div>
                    </div>
                </div>
                <br />


            </div>
        </>
    )
}