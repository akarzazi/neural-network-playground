export class Mathx {

    public static MatrixHamard1D(a: number[], b: number[]): number[] {

        let result: number[] = [];
        let rowsa = a.length;
        let rowsb = b.length;

        if (rowsa != rowsb) {
            throw `Size do not match rowsa: ${rowsa} !=  rowsb: ${rowsb}`
        }

        for (let i = 0; i < rowsa; i++) {
            result[i] = a[i] * b[i];
        }

        return result;
    }

    public static MatrixMultiply(a: number[][], b: number[][]): number[][] {

        let result: number[][] = [];
        let n = a.length;
        let m = a[0].length;
        let mb = b.length;
        let p = b[0].length;

        if (m != mb) {
            throw `Size do not match cols: ${m} !=  row: ${mb}`
        }

        for (let i = 0; i < n; i++) {
            result[i] = [];

            for (let j = 0; j < p; j++) {
                var sum = 0;
                for (let k = 0; k < m; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i].push(sum);
            }
        }
        return result;
    }

    public static MatrixMultiplyTo1Col(a: number[][], b: number[]): number[] {

        let result: number[] = [];
        let rows = a.length;
        let cols = a[0].length;

        if (cols != b.length) {
            throw `Size do not match cols: ${cols} !=  rows: ${b.length}`
        }
        for (let i = 0; i < rows; i++) {
            //    result[i] = [];
            var sum = 0;
            for (let j = 0; j < b.length; j++) {

                sum += a[i][j] * b[j];
            }
            result[i] = sum;
        }

        return result;
    }

    public static MatrixMultiply1ColTo1Row(a: number[], b: number[]): number[][] {

        let result: number[][] = [];
        let rows = a.length;
        let cols = b.length;

        // if (cols != rows) {
        //     throw `Size do not match cols: ${cols} !=  rows: ${rows}`
        // }

        for (let i = 0; i < rows; i++) {
            result[i] = [];
            for (let j = 0; j < cols; j++) {

                result[i][j] = a[i] * b[j];
            }
        }

        return result;
    }

    public static MatrixAdd(a: number[][], b: number[][]): number[][] {

        let result: number[][] = [];
        let rows = a.length;
        let cols = a[0].length;

        if (rows != b.length || cols != b[0].length) {
            throw `Sizes do not match : ${rows} ${cols} vs ${b.length} ${b[0].length}`
        }

        for (let i = 0; i < rows; i++) {
            result[i] = [];
            for (let j = 0; j < cols; j++) {
                result[i][j] = a[i][j] + b[i][j];
            }
        }
        return result;
    }

    public static MatrixAdd1Col(a: number[], b: number[]): number[] {

        let result: number[] = [];
        let rowsA = a.length;
        let rowsB = b.length;

        if (rowsA != rowsB) {
            throw `Sizes do not match : ${rowsA} ${rowsB} }`
        }

        for (let i = 0; i < rowsA; i++) {
            result[i] = a[i] + b[i];
        }
        return result;
    }

    public static MatrixMinus1Col(a: number[], b: number[]): number[] {

        let result: number[] = [];
        let rowsA = a.length;
        let rowsB = b.length;

        if (rowsA != rowsB) {
            throw `Sizes do not match : ${rowsA} ${rowsB} }`
        }

        for (let i = 0; i < rowsA; i++) {
            result[i] = a[i] - b[i];
        }
        return result;
    }

    public static Matrix1ColOperation(a: number[], b: number[], func: (x: number, y: number) => number): number[] {

        let result: number[] = [];
        let rowsA = a.length;
        let rowsB = b.length;

        if (rowsA != rowsB) {
            throw `Sizes do not match : ${rowsA} ${rowsB} }`
        }

        for (let i = 0; i < rowsA; i++) {
            result[i] = func(a[i], b[i]);
        }
        return result;
    }

    public static Matrix1ColScalar(a: number[], x: number): number[] {
        var result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = a[i] * x;
        }
        return result;
    }


    public static MatrixTranspose(m: number[][]): number[][] {
        var result: number[][] = [];
        var rows = m.length;
        var cols = m[0].length;

        for (let i = 0; i < cols; i++) {
            result[i] = [];
            for (let j = 0; j < rows; j++) {
                result[i][j] = m[j][i];
            }
        }
        return result;
    }

    public static seed = 1;
    public static RandSeed() {
        //  return Math.random();
        var x = Math.sin(Mathx.seed++) * 10000;
        return x - Math.floor(x);
    }
    public static Rand(min: number, max: number): number {
        return (Mathx.RandSeed() * (max - min) + min);
    }

    public static RandInt(min: number, max: number): number {
        return (Mathx.RandSeed() * (max - min + 1) + min) | 0;
    }

    public static RandItem<T>(arr: T[]): T {
        var lastItemIndex = arr.length - 1;
        var randIndex = Mathx.RandInt(0, lastItemIndex);
        return arr[randIndex];
    }

    public static Batch<T>(arr: T[], size: number): T[][] {
        let arrayOfArrays = [];
        for (var i = 0; i < arr.length; i += size) {
            arrayOfArrays.push(arr.slice(i, i + size));
        }
        return arrayOfArrays;
    }

    public static Shuffle<T>(arr: T[]): T[] {
        let a: T[] = arr.slice(0);
        let j: number, x: T, i: number;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Mathx.RandSeed() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    public static Zeros(length: number) {
        let result: number[] = [];
        for (let i = 0; i < length; i++) {
            result[i] = 0;
        }
        return result;
    }

    public static Zeros2D(arr: number[][]) {
        let result: number[][] = [];
        for (let i = 0; i < arr.length; i++) {
            let sub: number[] = [];
            result[i] = sub;
            for (let k = 0; k < arr[i].length; k++) {
                sub[k] = 0;
            }
        }
        return result;
    }

    public static Zeros3D(arr: number[][][]) {
        let result: number[][][] = [];
        for (let i = 0; i < arr.length; i++) {
            let sub1: number[][] = [];
            result[i] = sub1;
            for (let k = 0; k < arr[i].length; k++) {
                let sub2: number[] = [];
                sub1[k] = sub2;
                for (let x = 0; x < arr[i][k].length; x++) {
                    sub2[x] = 0;
                }
            }
        }
        return result;
    }

    public static Round2Digits(num: number) {
        return Math.round(num * 100) / 100;
    }

    public static RoundToDigits(num: number, digits:number) {
        return Math.round(num * (10 ** digits)) / (10 ** digits);
    }

    public static Clamp(num: number, min: number, max: number) {
        return Math.min(Math.max(num, min), max);
    }

    public static Avg(array: number[]) {
        const sum = array.reduce((a, b) => a + b, 0);
        const avg = (sum / array.length) || 0;

        return avg;
    }


}
