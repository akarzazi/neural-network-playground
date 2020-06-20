import * as React from 'react';
import { Slider } from '../../Slider/Slider';
import "./LossViewer.css";

interface Props {

    trainingLoss: number[];
    testLoss: number[];
}

let viewRanges = [0, 1000, 300, 100, 30];
let svgHeight = 200;
let svgWidth = 300;

export function LossViewer(props: Props) {
    const [viewRangeIndex, setViewRangeIndex] = React.useState(0);

    let visibleTestLoss = props.testLoss.slice(-viewRanges[viewRangeIndex]);
    let visibleTrainingLoss = props.trainingLoss.slice(-viewRanges[viewRangeIndex]);

    let aggreg = [...visibleTestLoss, ...visibleTrainingLoss].filter(p => !isNaN(p));
    let min = Math.min(...aggreg);
    let max = Math.max(...aggreg);
    let range = max - min;

    function getPath(loss: number[]) {
        let length = loss.length;

        let path = 'M 0 0';
        for (let i = 0; i < length; i++) {
            let value = loss[i];

            let pointx = (i / length) * svgWidth;
            let yRatio = range == 0 ? 0 : (value - min) / range;
            let pointy = svgHeight - (yRatio * svgHeight);

            if (Number.isNaN(pointy))
                continue;

            if (i == 0) {
                path = 'M0 ' + pointy;
                continue;
            }

            path += ' L ' + pointx + ' ' + pointy;

        }

        //  console.log(path);
        return path;
    }

    function getLastValue(loss: number[]) {
        let length = loss.length;
        if (length == 0)
            return "no value"

        return loss[length - 1].toFixed(4);
    }

    function GetViewRangeLabel(index: number) {
        let value = viewRanges[index];

        if (value == 0)
            return "Full";

        return value;
    }

    // function PointRadius() {
    //     var asize = props.aMax - props.aMin;
    //     var bsize = props.bMax - props.bMin;

    //     return asize * bsize / 1000;
    // }


    return (
        <div className="LossViewer">
            <div className="titles">
                <div className="test-loss" style={{ color: "#000000" }}>Test loss <span>{getLastValue(visibleTestLoss)}</span> </div>
                <div className="training-loss" style={{ color: "#00000077" }}>Train loss <span>{getLastValue(visibleTrainingLoss)}</span> </div>

            </div>
            <div className="svg-container">
                <svg width={svgWidth} height={svgHeight}  >
                    <path stroke="#00000077" strokeWidth="3" fill="none" d={getPath(visibleTrainingLoss)} />
                    <path stroke="#000000" strokeWidth="3" fill="none" d={getPath(visibleTestLoss)} />
                </svg>
            </div>
            <div>
                <Slider
                    className="block-labelled-control"
                    labelRenderer={(value => <>View Range &nbsp;<span className="value">{GetViewRangeLabel(value)} Epochs</span></>)}
                    onChange={setViewRangeIndex}
                    value={viewRangeIndex}
                    step={1}
                    min={0}
                    max={4} />
            </div>
        </div>
    )

}