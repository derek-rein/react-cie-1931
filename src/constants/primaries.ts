export type Primaries =
	| "sRGB"
	| "AdobeRGB"
	| "P3"
	| "Rec2020"
	| "ACEScg"
	| "ACES2065_1";

// Define the type for the actual coordinate object
export type PrimaryCoordinates = { r: [number, number]; g: [number, number]; b: [number, number] };

export const PrimariesData: Record<Primaries, { x: number; y: number }[]> = {
  sRGB: [
    { x: 0.64, y: 0.33 },  // Red
    { x: 0.30, y: 0.60 },  // Green 
    { x: 0.15, y: 0.06 },  // Blue
  ],
  AdobeRGB: [
    { x: 0.64, y: 0.33 },  // Red
    { x: 0.21, y: 0.71 },  // Green
    { x: 0.15, y: 0.06 },  // Blue  
  ],
  P3: [
    { x: 0.68, y: 0.32 },  // Red
    { x: 0.265, y: 0.69 }, // Green
    { x: 0.15, y: 0.06 },  // Blue
  ],
  Rec2020: [
    { x: 0.708, y: 0.292 },  // Red
    { x: 0.17, y: 0.797 },   // Green
    { x: 0.131, y: 0.046 },  // Blue
  ],
  ACEScg: [
    { x: 0.713, y: 0.293 },  // Red
    { x: 0.165, y: 0.830 },  // Green
    { x: 0.128, y: 0.044 },  // Blue
  ],
  ACES2065_1: [
    { x: 0.7347, y: 0.2653 },  // Red
    { x: 0, y: 1 },  // Green
    { x: 0.0001, y: -0.0770 },  // Blue
  ],
};

export const whitepoints = {
  D50: [0.3457, 0.3585],
  D55: [0.3324, 0.3474], 
  D60: [0.32168, 0.33767],
  D65: [0.31271, 0.32902],
  DCI: [0.314, 0.351],
};

export type Whitepoint = keyof typeof whitepoints; 