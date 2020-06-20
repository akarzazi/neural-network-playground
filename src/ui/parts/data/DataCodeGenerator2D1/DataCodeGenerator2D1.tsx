import * as React from 'react';
import { Select, SelectOptionProps } from '../../../components/Select/Select';
import './DataCodeGenerator2D1.css'
import { DatasetCreator2To1, Dataset2To1 } from '../../../../dataset/DatasetCreator2To1';
import { Slider } from '../../../components/Slider/Slider';
import { WarningBanner } from '../../../components/WarningBanner/WarningBanner';
import { codeGeneratorTemplates } from '../../../assets/code-generator-samples';
import { MinMaxInputNumber } from '../../../components/MinMaxInput/MinMaxInput';
import { useDebounceValue } from '../../../hooks/useDebounceValue';

let templates: SelectOptionProps<string>[] = Object.keys(codeGeneratorTemplates).map(p => ({ value: p, label: p }));

export interface Props {
    OnSamplesGenerated: (samples: Dataset2To1[], aMin: number, aMax: number, bMin: number, bMax: number) => void;
}

export function DataCodeGenerator2D1(props: Props) {

    const [selectedTemplate, setselectedTemplate] = React.useState("Circle");
    const [dataPoints, setdataPoints] = React.useState(2500);
    const debDataPoints = useDebounceValue(dataPoints, 100);
    const [codeFragment, setcodeFragment] = React.useState(codeGeneratorTemplates.Circle.code);
    //  const [samples, setsamples] = React.useState([] as Dataset2To1[]);
    const [aMin, setaMin] = React.useState(-5);
    const [aMax, setaMax] = React.useState(5);
    const [bMin, setbMin] = React.useState(-5);
    const [bMax, setbMax] = React.useState(5);

    const [codeFragmentError, setcodeFragmentError] = React.useState("");
    const [lastValidCode, setlastValidCode] = React.useState(codeFragment);
    const samples = React.useMemo(() => ComputeSamples(), [aMin, aMax, bMin, bMax, lastValidCode, debDataPoints]);

    React.useEffect(() => props.OnSamplesGenerated(samples, aMin, aMax, bMin, bMax), [samples]);

    const computeLastValidCode = React.useEffect(() => {
        //  console.log("memo", codeFragment)
        try {
            setcodeFragmentError("");
            CompileCode(codeFragment);
            setlastValidCode(codeFragment);
        }
        catch (err) {
            setcodeFragmentError(err.toString());
        }
    }, [codeFragment]);

    function onTemplateChange(templateName: string) {
        setselectedTemplate(templateName);
       let template= codeGeneratorTemplates[templateName];
        setcodeFragment(template.code);
        setaMin(template.amin);
        setaMax(template.amax);
        setbMin(template.bmin);
        setbMax(template.bmax);
    }

    function onCodeChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setcodeFragment(e.target.value);
        // console.log("change", codeFragment)
    }

    function CompileCode(funcBody: string) {
        var adder = new Function("a", "b", funcBody);
        var typedFunc: (a: number, b: number) => number = (a, b) => adder(a, b);
        typedFunc(1, 2);
        return typedFunc;
    }

    function ComputeSamples() {
        var compiledFunc = CompileCode(lastValidCode);
        var gen = new DatasetCreator2To1(compiledFunc);
        var sample = gen.Generate(debDataPoints, aMin, aMax, bMin, bMax);
        return sample;
    }

    function onDataPointChange(newValue: number) {
        setdataPoints(newValue);
    }

    function onAChange(newMin: number, newMax: number) {
        setaMin(newMin);
        setaMax(newMax);
    }

    function onBChange(newMin: number, newMax: number) {
        setbMin(newMin);
        setbMax(newMax);
    }

    return (
        <div className="DataCodeGenerator2D1">
            <div className="block-labelled-control">
                {/* <div className="title">Input domain</div> */}
                <Slider label="Data points"
                    className="block-labelled-control"
                    onChange={(val) => onDataPointChange(val)}
                    value={dataPoints}
                    step={100}
                    min={100}
                    max={10000} />
            </div>

            <div className="inline-labelled-control">
                <label>Sample</label>
                <Select
                    className="control"
                    options={templates}
                    value={selectedTemplate}
                    placeholder={'Select Generation Template'}
                    onChange={onTemplateChange}
                />
            </div>

            <div className="block-labelled-control">
                <label className="block-label">Data range</label>
                <MinMaxInputNumber label="a" min={aMin} max={aMax} onChange={onAChange} />
                <MinMaxInputNumber label="b" min={bMin} max={bMax} onChange={onBChange} />
            </div>

            <div className="block-labelled-control">
                <label>Function (a, b)  {'{ '} </label>
                <div className="code-area">
                    <div className="code-immutable">// js</div>
                    <textarea className="code-edit" rows={4} cols={50} spellCheck={false}
                        onChange={onCodeChange}
                        value={codeFragment} ></textarea>
                    <div className="code-immutable">{'}'} </div>
                </div>
            </div>
            <WarningBanner warn={codeFragmentError} />

        </div >
    );



}


