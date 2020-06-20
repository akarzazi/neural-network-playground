import * as React from 'react';
import { Dataset2To1 } from '../../../../dataset/DatasetCreator2To1';
import { Slider } from '../../../components/Slider/Slider';
import { Mathx } from '../../../../helpers/Mathx';
import * as Color from '../../../helpers/Color';
import './DataDrawer2D1.css'
import { useDebounce } from '../../../hooks/useDebounce';
import { MinMaxInputNumber } from '../../../components/MinMaxInput/MinMaxInput';
import { MemoizedInputNumber } from '../../../components/InputNumber/InputNumber';

interface CanvasPoint {
    x: number;
    y: number;
    value: number;
}

export interface Props {
    OnSamplesGenerated: (samples: Dataset2To1[], aMin: number, aMax: number, bMin: number, bMax: number) => void;
    minColor: Color.HSLA;
    maxColor: Color.HSLA;
}


const canvasSize = 300;
const pointRadius = (canvasSize / 200.0);

// const aMin = -1;
// const aMax = 1;
// const bMin = -1;
// const bMax = 1;
export function DataDrawer2D1(props: Props) {

    const [aMin, setaMin] = React.useState(-5);
    const [aMax, setaMax] = React.useState(5);
    const [bMin, setbMin] = React.useState(-5);
    const [bMax, setbMax] = React.useState(5);

    // const [lMin, setlMin] = React.useState(-1);
    // const [lMax, setlMax] = React.useState(1);

    //const [rawData, setRawData] = React.useState(dataTemplate);
    const [sprayPoints, setSprayPoints] = React.useState(10);
    const [sprayRadius, setSprayRadius] = React.useState(10);
    const [sprayRelativeLabel, setSprayRelativeLabel] = React.useState(1);
    const [pointsCount, setPointsCount] = React.useState(0);
    // const pointsCount = React.useRef(0);
    //  const debouncedPointsCount = useDebounceValue(pointsCount.current, 500);
    const debouncedIncrementPointCount = useDebounce(() => setPointsCount(p => p + 1), 100);

    //   const [points, setPoints] = React.useState();
    const points = React.useRef([] as CanvasPoint[]);

    const samples = React.useMemo(() => computeSamples(), [pointsCount, aMax, aMin, bMax, bMin]);

    const lMin = React.useMemo(() => Math.min(...samples.map(p => p.label)), [samples]);
    const lMax = React.useMemo(() => Math.max(...samples.map(p => p.label)), [samples]);
    const canvasRef = React.useRef(null as unknown as HTMLCanvasElement)

    React.useEffect(() => props.OnSamplesGenerated(samples, aMin, aMax, bMin, bMax), [samples]);

    React.useEffect(() => redrawCanvas(), [samples]);

    function computeSamples() {
        // for (const canvasPoints of points.current) {

        // }

        return points.current.map(p => canvasToSamplePoint(p));
    }

    function canvasToSamplePoint(point: CanvasPoint): Dataset2To1 {

        let aRange = aMax - aMin;
        let bRange = bMax - bMin;

        let aRatio = point.x / canvasSize;
        let bRatio = (canvasSize - point.y) / canvasSize;

        return {
            a: aMin + aRatio * aRange,
            b: bMin + bRatio * bRange,
            label: point.value
        }
    }

    function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        //    e.persist();
        if ((e.buttons & 1) !== 1 && e.type == "mousemove") {
            //    console.log(e);
            return;
        }

        let canvas = canvasRef.current;
        // let ctx = canvas.getContext('2d');
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        //    console.log(e.buttons, x, y);
        drawCoordinates(x, y);
        debouncedIncrementPointCount();
    }

    function drawCoordinates(x: number, y: number) {
        let canvas = canvasRef.current;
        let ctx = canvas.getContext('2d')!;

        var interval = sprayRadius;
        let value = sprayRelativeLabel;
        ctx.fillStyle = getPointColor(value);// "#ff2626"; // Red color

        for (let i = 0; i < sprayPoints; i++) {
            let drawX = Mathx.Rand(x - interval, x + interval);
            let drawY = Mathx.Rand(y - interval, y + interval);
            if (isPointOffScreen(drawX, drawY)) {
                //      console.log("offscreen", drawX, drawY)
                continue;
            }

            points.current.push({ x: drawX, y: drawY, value: value });
            drawPoint(ctx, drawX, drawY);
        }
    }

    function drawPoint(ctx: CanvasRenderingContext2D, drawX: number, drawY: number) {
        ctx.beginPath();
        ctx.arc(drawX, drawY, pointRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    function isPointOffScreen(x: number, y: number) {
        if (x < 0 || x > canvasSize)
            return true;
        if (y < 0 || y > canvasSize)
            return true;

        return false;
    }

    function getPointColor(value: number) {
        var labelRange = lMax - lMin;
        if (labelRange == 0 || !isFinite(lMin))
            return Color.hslaToString(props.minColor);

        var valueRatio = (value - lMin) / (labelRange)

        var pointColor = Color.interpolateHSLA(props.minColor, props.maxColor, valueRatio);

        return Color.hslaToString(pointColor);
    }

    function redrawCanvas() {
        let canvas = canvasRef.current;
        let ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const point of points.current) {
            ctx.fillStyle = getPointColor(point.value);
            drawPoint(ctx, point.x, point.y);
        }
        //   pointsCount.current = 0;
    };

    function onClearClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        let canvas = canvasRef.current;
        let ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points.current = [];
        setPointsCount(0);
        //   pointsCount.current = 0;
    };

    function onAChange(newMin: number, newMax: number) {
        setaMin(newMin);
        setaMax(newMax);
    }

    function onBChange(newMin: number, newMax: number) {
        setbMin(newMin);
        setbMax(newMax);
    }

    // function onLChange(newMin: number, newMax: number) {
    //     setlMin(newMin);
    //     setlMax(newMax);
    // }

    // function sprayLabelRender(relativeValue: number) {

    //     return <>Spray label&nbsp;&nbsp;<span className="value">{getSprayLabel(relativeValue)}</span></>
    // }

    // function getSprayLabel(relativeValue: number) {
    //     let lSize = lMax - lMin;
    //     return Mathx.Round2Digits(relativeValue * lSize + lMin);
    // }

    return (
        <div className="DataDrawer2D1">

            <div className="draw-canvas">
                <label>Draw points on the canvas below:<br /></label>

                <canvas className="canvas"
                    ref={canvasRef}
                    width={canvasSize}
                    height={canvasSize}
                    onMouseMove={onCanvasClick}
                    onClick={onCanvasClick}
                />
                <div className="input-group">
                    <button onClick={onClearClick} >Clear</button>
                </div>
            </div>
            
            <div className="draw-panel">
                <div className="input-group">
                    <label className="block-label">Data range</label>
                    <MinMaxInputNumber label="a" min={aMin} max={aMax} onChange={onAChange} />
                    <MinMaxInputNumber label="b" min={bMin} max={bMax} onChange={onBChange} />
                </div>

                <div className="input-group">
                    <label className="block-label">Spray label</label>
                    <MemoizedInputNumber value={sprayRelativeLabel} onChange={setSprayRelativeLabel} />
                </div>

                <div className="input-group">

                    <Slider label="Spray points"
                        className="block-labelled-control"
                        onChange={setSprayPoints}
                        value={sprayPoints}
                        step={1}
                        min={1}
                        max={30} />

                    <Slider label="Spray radius"
                        className="block-labelled-control"
                        onChange={setSprayRadius}
                        value={sprayRadius}
                        step={1}
                        min={0}
                        max={30} />

                </div>
            </div>
        </div>
    )
}