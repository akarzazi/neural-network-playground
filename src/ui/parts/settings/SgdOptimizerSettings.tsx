import * as React from 'react';
import { SGDOptimizerOptions } from '../../../ffw/optimizers/SGDOptimizer';
import { Select } from '../../components/Select/Select';
import { Checkbox } from '../../components/Checkbox/Checkbox';

export interface Props {
    default: SGDOptimizerOptions;
    OnSettingsChanged?: (newSettings: SGDOptimizerOptions) => void;
}

export function SgdOptimizerSettings(props: Props) {

    const [learningRate, setLearningRate] = React.useState(props.default.LearningRate);
    const [learningRateDecay, setLearningRateDecay] = React.useState(props.default.LearningRateDecay);
    const [momentum, setMomentum] = React.useState(props.default.Momentum);
    const [useNesterov, setUseNesterov] = React.useState(props.default.Nesterov);

    React.useEffect(() => {
        var newSettings: SGDOptimizerOptions = {
            LearningRate: learningRate,
            LearningRateDecay: learningRateDecay,
            Momentum: momentum,
            Nesterov: useNesterov
        };
        props.OnSettingsChanged?.(newSettings);

        // console.log(newSettings);
    }, [learningRate, learningRateDecay, momentum, useNesterov]);

    return (
        <>
            <div className="input-group">
                <div className="inline-labelled-control">
                    <label>Learning rate</label>
                    <Select<number>
                        className="control"
                        value={learningRate}
                        onChange={setLearningRate}
                        options={[0, 0.0001, 0.0003, 0.001, 0.003, 0.01, 0.03, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 3, 10].map(p => ({ value: p }))} />
                </div>

                <div className="inline-labelled-control">
                    <label>Learning rate decay</label>
                    <Select<number>
                        className="control"
                        value={learningRateDecay}
                        onChange={setLearningRateDecay}
                        options={[0.999, 0.9995, 0.9998, 0.9999, 1, 1.0001, 1.0002, 1.0005, 1.001].map(p => ({ value: p }))} />
                </div>

                <div className="inline-labelled-control">
                    <label>Momentum</label>
                    <Select<number>
                        className="control"
                        value={momentum}
                        onChange={setMomentum}
                        options={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 2].map(p => ({ value: p }))} />
                </div>

                <Checkbox checked={useNesterov} label="Use Nesterov momentum" onChange={setUseNesterov} />
            </div>
        </>
    )
}