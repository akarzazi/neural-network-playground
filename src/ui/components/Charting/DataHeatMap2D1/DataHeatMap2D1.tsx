import * as React from 'react';
import { Dataset2To1 } from '../../../../dataset/DatasetCreator2To1';
import "./DataHeatMap2D1.css"
import * as Color from '../../../helpers/Color';
import { LabelScale } from '../LabelScale/LabelScale';
import { Mathx } from '../../../../helpers/Mathx';

var equal = require('fast-deep-equal');

interface Props {
    aMin: number;
    aMax: number;
    bMin: number;
    bMax: number;
    samples: Dataset2To1[];
    labelMin: number;
    labelMax: number;
    minColor: Color.HSLA;
    maxColor: Color.HSLA;
}

function areEqual(prevProps: Props, nextProps: Props) {

    return equal(prevProps, nextProps);
}

function drawCircle(data: Uint8ClampedArray, radius: number, x: number, y: number, width: number, c: Color.RGBA) {

    let rad2 = radius ** 2;
    for (let i = -radius; i <= radius; i++) {
        for (let k = -radius; k <= radius; k++) {

            let a = x + i | 0;
            let b = y + k | 0;

            if (isPointOffScreen(a, b))
                continue;

            let alpha = c.a;
            let spread = (i) ** 2 + (k) ** 2;
            if (spread > rad2) {
                alpha = c.a * ((2 * rad2) - spread) / (2 * rad2);
            }

            //  c.a = alpha;

            // if (spread == radius ** 2) {
            //     //  alpha = 0.5;
            // }
            let idx = 4 * (a + b * width);
            // let bg: Color.RGBA = { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] / 255 }
            let res = c

            data[idx] = c.r;     // Red
            data[idx + 1] = c.g; // Green
            data[idx + 2] = c.b;  // Blue
            data[idx + 3] = alpha * 255;   // Alpha
        }
    }
};

function isPointOffScreen(x: number, y: number) {
    if (x < 0 || x >= canvasSize)
        return true;
    if (y < 0 || y >= canvasSize)
        return true;

    return false;
}

export var DataHeatMap2D1 = React.memo(DataHeatMap2D1Internal, areEqual);

const canvasSize = 300.0;
const pointRadius = (canvasSize / 150.0);

function DataHeatMap2D1Internal(props: Props) {
    //  console.log("render");
    if (props.samples.length == 0)
        return (<> No data </>);

    let { aMin, aMax, bMin, bMax } = { ...props };
    if (props.samples.length == 1
        && (aMax - aMin == 0 || bMax - bMin == 0)) {
        let sample = props.samples[0];
        aMax = sample.a + 1;
        aMin = sample.a - 1;
        bMax = sample.b + 1;
        bMin = sample.b - 1;
    }

    const canvasRef = React.useRef(null as unknown as HTMLCanvasElement)
    const aspect = ComputeRatios();

    function ComputeRatios() {
        var asize = aMax - aMin;
        var bsize = bMax - bMin;

        var maxSize = Math.max(asize, bsize);
        var svgWidth = canvasSize * (asize) / maxSize;
        var svgHeight = canvasSize * (bsize) / maxSize;

        return {
            asize,
            bsize,
            svgWidth: Math.max(1, svgWidth),
            svgHeight: Math.max(1, svgHeight)
        }
    }

    function getPointColorRgba(value: number) {
        var labelRange = props.labelMax - props.labelMin;
        if (labelRange == 0)
            return Color.hslaToRgba(props.minColor);

        var valueRatio = (value - props.labelMin) / (labelRange)
        var pointColor = Color.interpolateHSLA(props.minColor, props.maxColor, valueRatio);

        return Color.hslaToRgba(pointColor);
    }

    function drawSamplesImg() {
        //  console.log("draw");

        let canvas = canvasRef.current;
        if (canvas == null) {
            console.log("canvasisnull");
            return;
        }

        // console.time("draw");
        //  debugger;
        let ctx = canvas.getContext('2d')!;
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Create an ImageData object
        var imagedata = ctx.createImageData(canvas.width, canvas.height);

        var asize = aMax - aMin;
        var bsize = bMax - bMin;
        var aResizeRatio = aspect.svgWidth / asize;
        var bResizeRatio = aspect.svgHeight / bsize;

        // var pixelindex = drawY * (canvas.width * 4) + drawX * 4;

        for (const sample of props.samples) {
            let drawX = ((sample.a - aMin) * aResizeRatio) | 0;
            let drawY = (aspect.svgHeight - ((sample.b - bMin) * bResizeRatio)) | 0;

            let c = getPointColorRgba(sample.label);
            drawCircle(imagedata.data, pointRadius, drawX, drawY, canvas.width, c);
        }

        // Draw the image data to the canvas
        ctx.putImageData(imagedata, 0, 0);
        // console.timeEnd("draw");
    }

    React.useLayoutEffect(() => drawSamplesImg());

    return (
        <div className="DataHeatMap2D">
            <div className="map-axis-container">

                <canvas className="canvas" id="drawcanvas"
                    ref={canvasRef}
                    width={aspect.svgWidth}
                    height={aspect.svgHeight}
                />

                <div className="x-axis-container" style={{ width: aspect.svgWidth }}>
                    <span>{Mathx.Round2Digits(aMin)}</span>
                    <span>a</span>
                    <span>{Mathx.Round2Digits(aMax)}</span>
                </div>

                <div className="y-axis-container" style={{ height: aspect.svgHeight }}>
                    <span>{Mathx.Round2Digits(bMax)}</span>
                    <span>b</span>
                    <span>{Mathx.Round2Digits(bMin)}</span>
                </div>
            </div>

            <LabelScale min={props.labelMin} max={props.labelMax} maxColor={props.maxColor} minColor={props.minColor} />
        </div>
    )

}


