import * as React from 'react';
import { Dataset2To1 } from '../../../../dataset/DatasetCreator2To1';
import { WarningBanner } from '../../../components/WarningBanner/WarningBanner';
import { importTemplate2D1 } from '../../../assets/importTemplate2D1';

export interface Props {
  OnSamplesGenerated: (samples: Dataset2To1[], aMin: number, aMax: number, bMin: number, bMax: number) => void;
}

export function DataImporter2D1(props: Props) {
  const [rawData, setRawData] = React.useState(importTemplate2D1);
  const [rawDataError, setRawDataError] = React.useState("");
  const samples = React.useMemo(() => ComputeSamples(), [rawData]);

  React.useEffect(() => {
    let aMin = Math.min(...samples.map(p => p.a));
    let aMax = Math.max(...samples.map(p => p.a));
    let bMin = Math.min(...samples.map(p => p.b));
    let bMax = Math.max(...samples.map(p => p.b));
    props.OnSamplesGenerated(samples, aMin, aMax, bMin, bMax)

  }, [samples]);

  function ComputeSamples() {
    let index = -1;
    let dataset: Dataset2To1[] = [];
    setRawDataError("");
    try {
      let dataArray = JSON.parse(rawData) as Dataset2To1[];

      for (index = 0; index < dataArray.length; index++) {
        let entry = dataArray[index];

        throwIfNotNumeric(entry.a);
        throwIfNotNumeric(entry.b);
        throwIfNotNumeric(entry.label);

        dataset.push({ a: entry.a, b: entry.b, label: entry.label });
      }
    } catch (error) {
      var msg = `${error}`;
      if (index > -1) {
        msg += `\n near line: ${index} `;
      }
      setRawDataError(msg);
      return [];
    }

    return dataset;
  }

  function throwIfNotNumeric(tested: any) {
    var isnumeric = !isNaN(parseFloat(tested)) && isFinite(tested);
    if (!isnumeric) {
      throw `the value ${tested} is not numeric`;
    }
  }

  function onDataChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setRawData(e.target.value);
  }

  return (
    <>
      <div className="input-group">
        <textarea className="data-area" rows={20} cols={50}
          onChange={onDataChange}
          value={rawData} ></textarea >
      </div>
      <WarningBanner warn={rawDataError} />
    </>
  )
}