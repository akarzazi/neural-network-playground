import { Key } from "react"

export interface GeneratorSample {
    amin: number;
    amax: number;
    bmin: number;
    bmax: number;
    code: string;
}

let circleSample: GeneratorSample = {
    amin: -5, amax: 5, bmin: -5, bmax: 5,
    code: 
`let isIncircle = a**2 + b**2 < 9;
return isIncircle ? 1 : -1;`
}

let adotb: GeneratorSample = {
    amin: -5, amax: 5, bmin: -5, bmax: 5,
    code: `return a * b > 0; `
}

let TwoClusters: GeneratorSample = {
    amin: -5, amax: 5, bmin: -5, bmax: 5,
    code: 
`let isIncircle1 = (a - 2) ** 2 + (b - 2) ** 2 < 4;
let isIncircle2 = (a + 2) ** 2 + (b + 2) ** 2 < 4;
return isIncircle2 ? 1 : isIncircle1 ? -1 : 0;`
}

let GrandientCircle: GeneratorSample = {
    amin: -5, amax: 5, bmin: -5, bmax: 5,
    code: 
`let location = (a) ** 2 + (b ) ** 2 ;
return location / 9;`,
}

let Linear: GeneratorSample = {
    amin: 0, amax: 5, bmin: 0, bmax: 5,
    code: `return  a*2 + b*3 + 5;`
}

export let codeGeneratorTemplates: { [Key: string]: GeneratorSample } = {

    "Circle": circleSample,
    "A dot B": adotb,
    "TwoClusters": TwoClusters,
    "GrandientCircle":GrandientCircle,
    "Linear": Linear,
}


