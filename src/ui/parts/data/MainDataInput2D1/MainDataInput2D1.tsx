import * as React from 'react';
import { Dataset2To1 } from '../../../../dataset/DatasetCreator2To1';
import * as Color from '../../../helpers/Color';

import { PivotRadio } from '../../../components/PivotRadio/PivotRadio';
import { DataCodeGenerator2D1 as DataGenerator2D1 } from '../DataCodeGenerator2D1/DataCodeGenerator2D1';
import { DataDrawer2D1 } from '../DataDrawer2D1/DataDrawer2D1';
import { DataImporter2D1 } from '../DataImporter2D1/DataImporter2D1';

import { DataHeatMap2D1 } from '../../../components/Charting/DataHeatMap2D1/DataHeatMap2D1';

enum generationModes2D {
    Generate = "Generate",
    Import = "Import",
    Draw = "Draw",
}

var generationModesOptions = Object.values(generationModes2D).map(x => ({ value: x }));

export interface Props {
    OnSamplesGenerated: (samples: Dataset2To1[], aMin: number, aMax: number, bMin: number, bMax: number) => void;
    minColor: Color.HSLA;
    maxColor: Color.HSLA;
}

export function MainDataInput2D1(props: Props) {

    const [generationMode, setGenerationMode] = React.useState(generationModes2D.Generate);

    const [aMin, setaMin] = React.useState(0);
    const [aMax, setaMax] = React.useState(0);
    const [bMin, setbMin] = React.useState(0);
    const [bMax, setbMax] = React.useState(0);

    const [samples, setSamples] = React.useState([] as Dataset2To1[]);
    const labelBoundary = React.useMemo(() => {
        return {
            min: Math.min(...samples.map(p => p.label)),
            max: Math.max(...samples.map(p => p.label))
        }
    }, [samples]);

    const OnSamplesGenerated = React.useCallback((samples: Dataset2To1[], aMin: number, aMax: number, bMin: number, bMax: number) => {
        setSamples(samples);
        setaMin(aMin);
        setaMax(aMax);
        setbMin(bMin);
        setbMax(bMax);

        props.OnSamplesGenerated(samples, aMin, aMax, bMin, bMax);
        //   setText(samples.length.toString());
    }, []);

    const dataGenerator = React.useMemo(() => <DataGenerator2D1 OnSamplesGenerated={OnSamplesGenerated} />, []);
    const dataImporter = React.useMemo(() => <DataImporter2D1 OnSamplesGenerated={OnSamplesGenerated} />, []);
    const dataDrawer = React.useMemo(() => <DataDrawer2D1 OnSamplesGenerated={OnSamplesGenerated} maxColor={props.maxColor} minColor={props.minColor} />, []);

    function getDisplayedGenerator() {
        switch (generationMode) {
            case generationModes2D.Generate:
                return dataGenerator;
            case generationModes2D.Import:
                return dataImporter;
            case generationModes2D.Draw:
                return dataDrawer;
            default:
                return dataImporter;
        }
    }

    return (
        <div className="MainDataInput2D1">
           
            <div className="data-generator-container">
                <div className="generator-section">
                    <PivotRadio className="pivot-head3" options={generationModesOptions} selectedValue={generationMode} name="generationMode" OnSelectionChanged={setGenerationMode} />
                    {getDisplayedGenerator()}
                </div>

 
            </div>

        </div>
    )
}
