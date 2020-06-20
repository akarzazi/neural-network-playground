export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface HSL {
    h: number;
    s: number;
    l: number;
}

export interface RGBA extends RGB {
    a: number;
}

export interface HSLA extends HSL {
    a: number;
}

export function hslToString(color: HSL) {
    return `hsl(${color.h},${color.s * 100}%,${color.l * 100}%)`;
}

export function hslaToString(color: HSLA) {
    return `hsla(${color.h},${color.s * 100}%,${color.l * 100}%,${color.a})`;
    // return 'hsla(240,100%,50%, 0.7)';
    return 'hsla(' + color.h + ',' + color.s * 100 + '%,' + color.l * 100 + '%,' + color.a + ')';
}

export function rgbToString(color: RGB) {
    return `rgb(${color.r},${color.g},${color.b})`;
}

export function rgbaToString(color: RGBA) {
    return `rgba(${color.r},${color.g},${color.b},${color.a})`;
}

export function hexToRGB(hex: string): RGB {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result == null)
        throw Error("Invalid color " + hex);

    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    }
}

export function rgbToHex(rgb: RGB) {
    return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
};


export function hexToHSL(hex: string) {
    return rgbToHsl(hexToRGB(hex));
}

export function hexToHSLA(hex: string, a: number): HSLA {

    let hsl = rgbToHsl(hexToRGB(hex));
    return {
        h: hsl.h,
        s: hsl.s,
        l: hsl.l,
        a: a
    }
}

export function interpolateRGB(color1: RGB, color2: RGB, factor: number): RGB {

    let mutator = (x1: number, x2: number) => Math.round(x1 + factor * (x2 - x1));

    return {
        r: mutator(color1.r, color2.r),
        g: mutator(color1.g, color2.g),
        b: mutator(color1.b, color2.b),
    };
};

export function interpolateRGBA(color1: RGBA, color2: RGBA, factor: number): RGBA {
    let mutator = (x1: number, x2: number) => Math.round(x1 + factor * (x2 - x1));

    return {
        r: mutator(color1.r, color2.r),
        g: mutator(color1.g, color2.g),
        b: mutator(color1.b, color2.b),
        a: mutator(color1.a, color2.a),
    };
}

export function interpolateHSL(color1: HSL, color2: HSL, factor: number): HSL {

    let mutator = (x1: number, x2: number) => x1 + factor * (x2 - x1);

    return {
        h: mutator(color1.h, color2.h),
        s: mutator(color1.s, color2.s),
        l: mutator(color1.l, color2.l),
    };
};

export function interpolateHSLA(color1: HSLA, color2: HSLA, factor: number): HSLA {

    let mutator = (x1: number, x2: number) => x1 + factor * (x2 - x1);

    return {
        h: mutator(color1.h, color2.h),
        s: mutator(color1.s, color2.s),
        l: mutator(color1.l, color2.l),
        a: mutator(color1.a, color2.a),
    };
};


export function rgbToHsl(color: RGB): HSL {
    var { r, g, b } = color;
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s, l };
}

export function rgbaToHsla(color: RGBA): HSLA {
    let hsl = rgbToHsl(color);
    return { ...hsl, a: color.a };
}

export function hslToRgb(color: HSL): RGB {
    var { h, s, l } = color;


    let c = (1 - Math.abs(2 * l - 1)) * s;
    let hp = h / 60.0;
    let x = c * (1 - Math.abs((hp % 2) - 1));
    let rgb1;
    if (isNaN(h)) rgb1 = [0, 0, 0];
    else if (hp <= 1) rgb1 = [c, x, 0];
    else if (hp <= 2) rgb1 = [x, c, 0];
    else if (hp <= 3) rgb1 = [0, c, x];
    else if (hp <= 4) rgb1 = [0, x, c];
    else if (hp <= 5) rgb1 = [x, 0, c];
    else if (hp <= 6) rgb1 = [c, 0, x];
    else rgb1 = [0, 0, 0];
    let m = l - c * 0.5;

    return {
        r: Math.round(255 * (rgb1[0] + m)),
        g: Math.round(255 * (rgb1[1] + m)),
        b: Math.round(255 * (rgb1[2] + m))
    }
};

export function hslaToRgba(color: HSLA): RGBA {
    let rgb = hslToRgb(color);
    return { ...rgb, a: color.a };
}