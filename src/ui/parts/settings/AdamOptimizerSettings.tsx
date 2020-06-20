import * as React from 'react';
import { Select } from '../../components/Select/Select';
import { AdamOptimizerOptions } from '../../../ffw/optimizers/AdamOptimizer';

export interface Props {
    default: AdamOptimizerOptions;
    OnSettingsChanged?: (newSettings: AdamOptimizerOptions) => void;
}

export function AdamOptimizerSettings(props: Props) {

    const [learningRate, setLearningRate] = React.useState(props.default.LearningRate);
    const [beta1, setBeta1] = React.useState(props.default.Beta1);
    const [beta2, setBeta2] = React.useState(props.default.Beta2);
    const [epsilon, setEpsilon] = React.useState(props.default.Epsilon);

    React.useEffect(() => {
        var newSettings: AdamOptimizerOptions = {
            LearningRate: learningRate,
            Beta1: beta1,
            Beta2: beta2,
            Epsilon: epsilon
        };
        props.OnSettingsChanged?.(newSettings);

    }, [learningRate, beta1, beta2, epsilon]);

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
                    <label>Beta1</label>
                    <Select<number>
                        className="control"
                        value={beta1}
                        onChange={setBeta1}
                        options={[0.50, 0.70, 0.80, 0.85, 0.86, 0.87, 0.88, 0.89, 0.90, 0.91, 0.92, 0.93, 0.94, 0.95, 1, 1.1, 2].map(p => ({ value: p }))} />
                </div>


                <div className="inline-labelled-control">
                    <label>Beta2</label>
                    <Select<number>
                        className="control"
                        value={beta2}
                        onChange={setBeta2}
                        options={[0.80, 0.90, 0.98, 0.99, 0.9970, 0.9980, 0.9985, 0.9986, 0.9987, 0.9988, 0.9989, 0.9990, 0.9991, 0.9992, 0.9993, 0.9994, 0.9995, 1, 1.1, 2].map(p => ({ value: p }))} />
                </div>

                <div className="inline-labelled-control">
                    <label>Epsilon</label>
                    <Select<number>
                        className="control"
                        value={epsilon}
                        onChange={setEpsilon}
                        options={[0.0000000001, 0.0000000003, 0.000000001, 0.000000003, 0.00000001, 0.00000003, 0.0000001, 0.0000003, 0.000001, 0.000003, 0.00001].map(p => ({ value: p }))} />
                </div>

            </div>
        </>
    )
}