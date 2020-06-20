import * as React from 'react';
import { Slider } from '../../components/Slider/Slider';
import { useDebounceValue } from '../../hooks/useDebounceValue';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { Select } from '../../components/Select/Select';
import { SgdOptimizerSettings } from './SgdOptimizerSettings';
import { SGDOptimizerOptions } from '../../../ffw/optimizers/SGDOptimizer';
import { AdamOptimizerOptions } from '../../../ffw/optimizers/AdamOptimizer';
import { AdamOptimizerSettings } from './AdamOptimizerSettings';
import { Mathx } from '../../../helpers/Mathx';

export const debounce = (func: Function, wait: number) => {
    let timeout: number | null;
    return function (...args: any) {

        if (timeout)
            clearTimeout(timeout);

        timeout = window.setTimeout(() => {
            timeout = null;
            func(...args);
        }, wait);
    };
};

// export interface OptimizerOpts {
//     type: OptimizersEnum
// }

export interface OptimizersOptions {
    selectedOptimizer: OptimizersEnum;
    sgdptimizerOptions: SGDOptimizerOptions;
    adamOptimizerOptions: AdamOptimizerOptions;
}

export interface DataOptions {
    batchSize: number;
    testDataRatio: number;
    shuffle: boolean;
}

export interface Props {
    dataOptions: DataOptions;
    optimizerOptions: OptimizersOptions;
    OnDataOptionsChanged: (newOptions: DataOptions) => void;
    OnOptimizerOptionsChanged: (newOptions: OptimizersOptions) => void;
}

export enum OptimizersEnum {
    sgd = "SGD",
    adam = "Adam"
}

export function TrainingSettings(props: Props) {

    const [batchSize, setBatchSize] = React.useState(props.dataOptions.batchSize);
    const [testDataRatio, setTestDataRatio] = React.useState(props.dataOptions.testDataRatio);
    const [shuffleData, setShuffleData] = React.useState(props.dataOptions.shuffle);
    const debouncedTestDataRatio = useDebounceValue(testDataRatio, 300);

    const [optimizerType, setOptimizerType] = React.useState(props.optimizerOptions.selectedOptimizer);
    const [sgdOpts, setSgdOpts] = React.useState(props.optimizerOptions.sgdptimizerOptions);
    const [adamOpts, setAdamOpts] = React.useState(props.optimizerOptions.adamOptimizerOptions);

    React.useEffect(() => {
        var newSettings: DataOptions = {
            batchSize: batchSize,
            testDataRatio: debouncedTestDataRatio,
            shuffle: shuffleData
        };

        props.OnDataOptionsChanged(newSettings);

    }, [batchSize, debouncedTestDataRatio]);

    React.useEffect(() => {
        let newOptions: OptimizersOptions = {
            selectedOptimizer: optimizerType,
            adamOptimizerOptions: adamOpts,
            sgdptimizerOptions: sgdOpts
        }

        props.OnOptimizerOptionsChanged(newOptions);
    }, [optimizerType, JSON.stringify(sgdOpts), JSON.stringify(adamOpts)]);

    function getDisplayedOptimizer() {
        switch (optimizerType) {
            case OptimizersEnum.sgd:
                return <SgdOptimizerSettings default={sgdOpts} OnSettingsChanged={setSgdOpts} />;
            case OptimizersEnum.adam:
                return <AdamOptimizerSettings default={adamOpts} OnSettingsChanged={setAdamOpts} />;
        }
    }

    return (
        <div>
            <div className="input-section-container">

                <div className="input-section">
                    <h3>Data feed</h3>

                    <Slider
                        className="block-labelled-control"
                        labelRenderer={(newvalue => <>Test data ratio &nbsp;<span className="value">{Mathx.Round2Digits(newvalue * 100)} %</span></>)}
                        onChange={setTestDataRatio}
                        value={testDataRatio}
                        step={0.05}
                        min={0}
                        max={1} />

                    <div className="inline-labelled-control">
                        <label>Batch size</label>
                        <Select<number>
                            className="control"
                            value={batchSize}
                            onChange={setBatchSize}
                            options={[1, 2, 3, 10, 30, 100, 300, 1000, 3000, 10000].map(p => ({ value: p }))} />
                    </div>

                    <Checkbox label="Shuffle data per Epoch" checked={shuffleData} onChange={setShuffleData} />

                </div>
                <div className="input-section">
                    <h3>Optimizer</h3>
                    <div className="inline-labelled-control">
                        <Select<OptimizersEnum>
                            options={Object.values(OptimizersEnum).map(p => ({ value: p }))}
                            value={optimizerType}
                            onChange={setOptimizerType}
                            placeholder={'Select Generation Template'}
                        // handleChange={(newValue) => onActivationChange(newValue, layer)}
                        />
                    </div>
                    {getDisplayedOptimizer()}

                </div>
            </div>
        </div>
    );
}

