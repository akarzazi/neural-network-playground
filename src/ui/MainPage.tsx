import './styles/reset.css';
import './styles/main.css';

import * as React from 'react';
import { Dataset2To1, Dataset2To1Helper } from '../dataset/DatasetCreator2To1';
import { Activations } from '../ffw/Activation';
import { Errors } from '../ffw/Error';
import { Layer } from '../ffw/Layer';
import { Network, NetworkJSON } from '../ffw/Network';
import { NetworkTrainer } from '../ffw/NetworkTrainer';
import { AdamOptimizerOptions, AdamOptimizer } from '../ffw/optimizers/AdamOptimizer';
import { SGDOptimizerOptions, SGDOptimizer } from '../ffw/optimizers/SGDOptimizer';
import * as Color from './helpers/Color';
import { PauseIcon, PlayIcon, RewindIcon, SkipNext, SaveDisk } from './assets/svg-icons';
import { OptimizersEnum, OptimizersOptions, DataOptions, TrainingSettings } from './parts/settings/TrainingSettings';
import { MainDataInput2D1 } from './parts/data/MainDataInput2D1/MainDataInput2D1';
import { NetworkEditor } from './parts/network/NetworkEditor';
import ReactDOM = require('react-dom');
import { Mathx } from '../helpers/Mathx';
import { LossViewer } from './components/Charting/LossViewer/LossViewer';
import { Optimizer } from '../ffw/optimizers/Optimizer';
import { DataHeatMap2D1 } from './components/Charting/DataHeatMap2D1/DataHeatMap2D1';

function getInitialNetwork() {
    const jsonStrNetwork = `{"nodes":[[{"bias":0,"inputs":[]},{"bias":0,"inputs":[]}],[{"activation":"TANH","bias":0.064,"inputs":[0.11,-0.08]},{"activation":"TANH","bias":-0.08,"inputs":[0.57,0.69]},{"activation":"TANH","bias":0.04,"inputs":[0.69,0.74]}],[{"activation":"TANH","bias":0.19,"inputs":[0.42,0.39,0.22]}]]}`

    let layers: Layer[] = [
        { NodesCount: 2 },
        { NodesCount: 3, Activation: Activations.TANH },
        { NodesCount: 1, Activation: Activations.TANH },
    ]

    // var x = Network2.Build(layers);
    // let jsonStrNetwork = JSON.stringify(x.ToJson());
    // console.log(jsonStrNetwork)
    return JSON.parse(jsonStrNetwork) as NetworkJSON;
}

let referenceNetwork = getInitialNetwork();

let defaultOptimizerOptions: OptimizersOptions = {
    selectedOptimizer: OptimizersEnum.sgd,
    adamOptimizerOptions: new AdamOptimizerOptions(),
    sgdptimizerOptions: new SGDOptimizerOptions()
}

let errorFunction = Errors.SQUARE;

let defaultDataTrainingOptions: DataOptions = {
    batchSize: 300,
    testDataRatio: 0.20,
    shuffle: true,
}

var maxColor: Color.HSLA = Color.hexToHSLA("#CF384D", 0.8);
var minColor: Color.HSLA = Color.hexToHSLA("#3682BA", 0.8);

var greenLimit = 10000;
export function MainPage() {

    const [aMin, setaMin] = React.useState(0);
    const [aMax, setaMax] = React.useState(0);
    const [bMin, setbMin] = React.useState(0);
    const [bMax, setbMax] = React.useState(0);
    const [samples, setSamples] = React.useState([] as Dataset2To1[]);

    const [dataTrainingOpts, setDataTrainingOpts] = React.useState(() => defaultDataTrainingOptions);
    const [optimizerOpts, setOptimizerTrainingOpts] = React.useState(() => defaultOptimizerOptions);
    //   const [dataTrainingOpts, setDataTrainingOpts] = React.useState(null as unknown as DataTrainingOptions);

    const [trainingSamples, testSamples] = React.useMemo(() => {
        let splitIndex = Math.floor(samples.length * dataTrainingOpts.testDataRatio);
        let shuffled = Mathx.Shuffle(samples);
        let testData = shuffled.slice(0, splitIndex);
        let trainData = shuffled.slice(splitIndex);

        return [trainData, testData];
    }, [samples, dataTrainingOpts]);

    const [jsonNetwork, setJsonNetwork] = React.useState(() => getInitialNetwork() as NetworkJSON);
    const networkTrainer = React.useRef(null as unknown as NetworkTrainer);
    const currentOptimizer = React.useRef(null as unknown as Optimizer);

    const createOptimizer = React.useMemo(() => {

        return (net: Network) => {
            switch (optimizerOpts.selectedOptimizer) {
                case OptimizersEnum.sgd:
                    return new SGDOptimizer(net, optimizerOpts.sgdptimizerOptions);
                case OptimizersEnum.adam:
                    return new AdamOptimizer(net, optimizerOpts.adamOptimizerOptions);
            }
        }

    }, [optimizerOpts]);

    React.useEffect(() => {

        if (!networkTrainer.current)
            return;
        currentOptimizer.current = createOptimizer(networkTrainer.current.Net)
    }, [optimizerOpts]);

    const [epoch, setEpoch] = React.useState(0);
    const [isRunning, setIsRunning] = React.useState(false);
    const [interval, setInterval] = React.useState(0);

    const [predictionSamples, setPredictionSamples] = React.useState([] as Dataset2To1[]);
    const [shouldUpdatePrediction, setShouldUpdatePrediction] = React.useState(true);

    const [trainingLossHisto, setTrainingLossHisto] = React.useState([] as number[]);
    const [testLossHisto, setTestLossHisto] = React.useState([] as number[]);

    const labelBoundary = React.useMemo(() => {
        return {
            min: Math.min(...samples.map(p => p.label)),
            max: Math.max(...samples.map(p => p.label))
        }
    }, [samples]);

    const predictLabelBoundary = React.useMemo(() => {
        return {
            min: Math.min(...predictionSamples.map(p => p.label)),
            max: Math.max(...predictionSamples.map(p => p.label))
        }
    }, [predictionSamples]);

    const OnSamplesGenerated = React.useCallback((samples: Dataset2To1[], aMin: number, aMax: number, bMin: number, bMax: number) => {
        setSamples(samples);
        setaMin(aMin);
        setaMax(aMax);
        setbMin(bMin);
        setbMax(bMax);
        setShouldUpdatePrediction(true);
    }, []);

    const OnDataSettingsChanged = React.useCallback((newOptions: DataOptions) => {
        setDataTrainingOpts(newOptions);
    }, []);

    const OnOptimizerOptionsChanged = React.useCallback((newOptions: OptimizersOptions) => {
        setOptimizerTrainingOpts(newOptions);
    }, []);

    const onNetworkEditorChange = React.useCallback((newNetwork: NetworkJSON) => {

        resetNetwork(newNetwork);
        setShouldUpdatePrediction(true);
    }, []);

    React.useEffect(() => onEpoch(), [epoch]);

    React.useEffect(() => {
        if (isRunning)
            return;

        if (!shouldUpdatePrediction)
            return;


        // networkTrainer.current = );
        runPrediction();
    }, [shouldUpdatePrediction, samples, jsonNetwork]);

    function onStartButton() {

        if (isRunning) {
            setIsRunning(false);
            window.clearInterval(interval);
            return;
        }

        setIsRunning(true);

        // networkTrainer.current = new NetworkTrainer2(Network2.FromJson(jsonNetwork));
        // currentOptimizer.current = createOptimizer(networkTrainer.current.Net);

        let inter = window.setInterval(() => {
            setEpoch(e => e + 1);
        }, 100);

        setInterval(inter);
    }

    function onSingleStep() {
        setEpoch(e => e + 1);
    }

    function onReset() {
        window.clearInterval(interval);
        setEpoch(0);
        setIsRunning(false);
        setTrainingLossHisto([]);
        setTestLossHisto([]);
        resetNetwork(JSON.parse(JSON.stringify(referenceNetwork)));
        setShouldUpdatePrediction(true);

        // updateNetPrediction(referenceNetwork);
    }

    function onEpoch() {

        if (epoch == 0) {
            return;
        }

        if (epoch == 1) {
            resetNetwork(jsonNetwork);
        }

        if (epoch % greenLimit == 0) {
            window.alert(`You reached ${epoch} epochs, are you still here ?`);
        }

        runTrain();
    }

    function runPrediction() {
        let trainer = new NetworkTrainer(Network.FromJson(jsonNetwork));

        let predictSamples: Dataset2To1[] = [];
        for (const sample of samples) {
            let predicted = trainer.Predict([sample.a, sample.b]);
            predictSamples.push({ ...sample, label: predicted[0] });
        }

        setPredictionSamples(predictSamples);
    }

    function runTrain() {
        let traingSet = Dataset2To1Helper.ToLabelled(trainingSamples);
        if (dataTrainingOpts.shuffle)
            traingSet = Mathx.Shuffle(traingSet);
        let trainLoss = networkTrainer.current.TrainStep(currentOptimizer.current, traingSet, dataTrainingOpts.batchSize, errorFunction);
        let testSet = Dataset2To1Helper.ToLabelled(testSamples);
        let testLoss = networkTrainer.current.ComputeLoss(testSet, errorFunction);
        let predictSamples: Dataset2To1[] = [];
        for (const sample of samples) {
            let predicted = networkTrainer.current.Predict([sample.a, sample.b]);
            predictSamples.push({ ...sample, label: predicted[0] });
        }
        setTrainingLossHisto(p => { p.push(trainLoss[0]); return p; });
        setTestLossHisto(p => { p.push(testLoss[0]); return p; });
        setPredictionSamples(predictSamples);
        setJsonNetwork(networkTrainer.current.Net.ToJson());
        setShouldUpdatePrediction(false);
    }

    function onSetNetAsDefault() {
        referenceNetwork = jsonNetwork;
    }

    function resetNetwork(network: NetworkJSON) {
        networkTrainer.current = new NetworkTrainer(Network.FromJson(network));
        currentOptimizer.current = createOptimizer(networkTrainer.current.Net);
        setJsonNetwork(network);
    }

    return (
        <div className="main-body-content">
            <div className="main-body-left">
                <div className="page-split">
                    <div className="page-section data-page-section" >
                        <h1>Data Input</h1>

                        {React.useMemo(() => <MainDataInput2D1 OnSamplesGenerated={OnSamplesGenerated} maxColor={maxColor} minColor={minColor} />, [])}
                    </div>
                    <div className="page-section network-page-section" >
                        <h1>Training the model</h1>
                        <div className="control-btns">
                            <button className="control-btn rewind" onClick={onReset} title="Reset to baseline">{RewindIcon}</button>
                            <button className="control-btn play" onClick={onStartButton} title="Start/Pause">{isRunning ? PauseIcon : PlayIcon}</button>
                            <button className="control-btn oneStep" onClick={onSingleStep} title="Single step" disabled={isRunning}>{SkipNext}</button>
                            <button className="control-btn save" onClick={onSetNetAsDefault} title="Save as baseline" disabled={isRunning}>{SaveDisk}</button>
                            
                        </div>
                        <p>
                            Epoch : {String(epoch).padStart(4, '0')}
                        </p>
   
                        {/* <button onClick={onSetNetAsDefault} disabled={isRunning}>Save as baseline</button> */}
                        <div className="input-group">
                            <NetworkEditor network={jsonNetwork} onNetworkTopographyChange={onNetworkEditorChange} inputLabels={["a", "b"]} disabledEdit={isRunning} />
                        </div>
                    </div>
                </div>
                <div className="page-section visualisation-section">
                    <div className="visualisation-block">
                        <h3>Data visualization</h3>
                        <div className="data-preview">
                            <DataHeatMap2D1 aMin={aMin} aMax={aMax} bMin={bMin} bMax={bMax} samples={samples} labelMin={labelBoundary.min} labelMax={labelBoundary.max} maxColor={maxColor} minColor={minColor} />
                        </div>
                    </div>

                    <div className="visualisation-block">
                        <h3>Prediction visualization</h3>
                        <DataHeatMap2D1
                            aMin={aMin} aMax={aMax} bMin={bMin} bMax={bMax}
                            samples={predictionSamples}
                            labelMin={predictLabelBoundary.min} labelMax={predictLabelBoundary.max}
                            maxColor={maxColor} minColor={minColor} />
                    </div>

                    <div className="visualisation-block">
                        <h3>Loss view</h3>
                        <LossViewer testLoss={testLossHisto} trainingLoss={trainingLossHisto} />
                    </div>
                </div>



                <div className="page-section" >
                    <h1>Training Settings</h1>
                    <TrainingSettings
                        dataOptions={dataTrainingOpts}
                        optimizerOptions={defaultOptimizerOptions}
                        OnDataOptionsChanged={OnDataSettingsChanged}
                        OnOptimizerOptionsChanged={OnOptimizerOptionsChanged} />


                </div>
            </div>
            <div className="main-body-right">


            </div>
        </div >
    );

}

ReactDOM.render(
    <MainPage />,
    document.getElementById('root')
);