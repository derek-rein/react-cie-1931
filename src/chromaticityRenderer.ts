import { CIE_CC_1931_DEG } from "./constants/cie_cc_1931_deg";
import {
  FRAGMENT_SHADER_SOURCE,
  VERTEX_SHADER_SOURCE,
} from "./constants/shaders";
import { compileShader, createProgram } from "./shaderUtils";
import type { PrimaryCoordinates } from "./types/primaries";

// Define XYZ to RGB conversion matrices in TypeScript
// These matrices are column-major for WebGL `uniformMatrix3fv` when transpose is false.
// Or row-major if you prefer to define them that way and then transpose them, or ensure data is laid out as an array of columns.
// WebGL expects matrices in column-major order. JavaScript arrays are row-major by default.
// So, if mat3(c1_r1, c2_r1, c3_r1, c1_r2, c2_r2, c3_r2, c1_r3, c2_r3, c3_r3)
// For a matrix M = [[a,b,c], [d,e,f], [g,h,i]], the column-major order is [a,d,g, b,e,h, c,f,i]

const XYZ_TO_SRGB_MATRIX = [
  // Column 1
  3.2404542, -0.969266, 0.0556434,
  // Column 2
  -1.5371385, 1.8760108, -0.2040259,
  // Column 3
  -0.4985314, 0.041556, 1.0572252,
];

const XYZ_TO_DISPLAY_P3_MATRIX = [
  // Column 1
  2.4934969, -0.829489, 0.0358458,
  // Column 2
  -0.9313836, 1.7626641, -0.0761724,
  // Column 3
  -0.4037018, 0.0236247, 0.9568845,
];

export interface RenderOptions {
  plotSize: number;
  xScale: number;
  yScale: number;
  inputPrimaries: PrimaryCoordinates | null;
  outputPrimaries: PrimaryCoordinates | null;
  whitepointCoords: { x: number; y: number } | null;
  inputPrimariesColor?: string;
  outputPrimariesColor?: string;
  outputTargetColorSpace?: "srgb" | "display-p3";
  manualGammaCorrectionRequired?: boolean;
  visibleXMin?: number;
  visibleXMax?: number;
  visibleYMin?: number;
  visibleYMax?: number;
}

export const renderChromaticityDiagram = async (
  gl: WebGLRenderingContext,
  overlayCtx: CanvasRenderingContext2D,
  pathRef: React.RefObject<SVGPathElement | null>,
  options: RenderOptions
): Promise<{ x: number; y: number }[] | null> => {
  const {
    plotSize,
    xScale,
    yScale,
    inputPrimaries,
    outputPrimaries,
    whitepointCoords,
    inputPrimariesColor,
    outputPrimariesColor,
    outputTargetColorSpace,
    manualGammaCorrectionRequired,
    visibleXMin,
    visibleXMax,
    visibleYMin,
    visibleYMax,
  } = options;

  // Set up WebGL
  gl.viewport(0, 0, plotSize, plotSize);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Compile shaders
  const vertexShader = compileShader(
    gl,
    gl.VERTEX_SHADER,
    VERTEX_SHADER_SOURCE
  );
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    FRAGMENT_SHADER_SOURCE
  );
  if (!vertexShader || !fragmentShader) return null;

  // Create program
  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    console.error("Failed to create shader program.");
    return null;
  }

  // Set up buffers
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  // Set up attributes and uniforms
  gl.useProgram(program);
  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Set the resolution uniform
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionLocation, plotSize, plotSize);

  // Set scale uniforms
  const xScaleLocation = gl.getUniformLocation(program, "u_xScale");
  gl.uniform1f(xScaleLocation, xScale);
  const yScaleLocation = gl.getUniformLocation(program, "u_yScale");
  gl.uniform1f(yScaleLocation, yScale);

  // Set viewport uniforms for zoom/pan support
  const visibleXMinLocation = gl.getUniformLocation(program, "u_visibleXMin");
  const visibleXMaxLocation = gl.getUniformLocation(program, "u_visibleXMax");
  const visibleYMinLocation = gl.getUniformLocation(program, "u_visibleYMin");
  const visibleYMaxLocation = gl.getUniformLocation(program, "u_visibleYMax");

  // Use provided viewport or default to full scale
  gl.uniform1f(visibleXMinLocation, visibleXMin ?? 0);
  gl.uniform1f(visibleXMaxLocation, visibleXMax ?? xScale);
  gl.uniform1f(visibleYMinLocation, visibleYMin ?? 0);
  gl.uniform1f(visibleYMaxLocation, visibleYMax ?? yScale);

  // Determine the correct XYZ to Target RGB conversion matrix
  const conversionMatrix =
    outputTargetColorSpace === "display-p3"
      ? XYZ_TO_DISPLAY_P3_MATRIX
      : XYZ_TO_SRGB_MATRIX;

  // Set the u_XYZ_to_TargetRGB_Matrix uniform
  const matrixLocation = gl.getUniformLocation(
    program,
    "u_XYZ_to_TargetRGB_Matrix"
  );
  // For uniformMatrix3fv, the second argument `transpose` should be false
  // if the matrix is already in column-major order, as WebGL expects.
  gl.uniformMatrix3fv(matrixLocation, false, conversionMatrix);

  // Set the u_applyGamma uniform based on options
  const applyGammaLocation = gl.getUniformLocation(program, "u_applyGamma");
  // Default to true if undefined, though ChromaticityDiagram.tsx should always pass it.
  gl.uniform1i(
    applyGammaLocation,
    manualGammaCorrectionRequired !== false ? 1 : 0
  );

  // Draw the main diagram
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Clear overlay
  overlayCtx.clearRect(0, 0, plotSize, plotSize);

  // Draw spectral locus path and fetch points if needed
  // This function now handles setting the path attribute internally
  const fetchedPoints = await drawSpectralLocus(
    pathRef,
    plotSize,
    xScale,
    yScale
  );

  // Draw input color space gamut if primaries are provided
  if (inputPrimaries) {
    drawColorSpace(
      overlayCtx,
      inputPrimaries,
      inputPrimariesColor || "rgba(0, 255, 0, 0.8)",
      plotSize,
      xScale,
      yScale
    );
  }

  // Draw output color space gamut if primaries are provided
  if (outputPrimaries) {
    drawColorSpace(
      overlayCtx,
      outputPrimaries,
      outputPrimariesColor || "rgba(255, 0, 0, 0.8)",
      plotSize,
      xScale,
      yScale
    );
  }

  // Draw the potentially interactive white point
  if (whitepointCoords) {
    drawWhitePoint(overlayCtx, plotSize, xScale, yScale, whitepointCoords);
  }

  // Return the fetched spectral locus points for external use (e.g., interaction checks)
  return fetchedPoints;
};

export const drawPlanckianLocus = (
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  strokeStyle: string,
  plotSize: number,
  xScale: number,
  yScale: number
): void => {
  if (points.length < 2) return;

  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 2; // Or make this a parameter
  ctx.beginPath();

  points.forEach((point, index) => {
    const xPos = (point.x / xScale) * plotSize;
    const yPos = ((yScale - point.y) / yScale) * plotSize;
    if (index === 0) {
      ctx.moveTo(xPos, yPos);
    } else {
      ctx.lineTo(xPos, yPos);
    }
  });

  ctx.stroke();
};

const drawSpectralLocus = async (
  pathRef: React.RefObject<SVGPathElement | null>,
  plotSize: number,
  xScale: number,
  yScale: number
): Promise<{ x: number; y: number }[] | null> => {
  try {
    // Use the imported constant instead of fetching CSV
    const points = CIE_CC_1931_DEG.map((row) => ({
      x: row[1] as number,
      y: row[2] as number,
    }));

    // Create spectral locus path
    let firstPointStr = "";
    const locusCurvePath = points.reduce((acc, point, i) => {
      const x = (point.x / xScale) * plotSize;
      const y = ((yScale - point.y) / yScale) * plotSize;
      const pointStr = `${x.toFixed(2)} ${y.toFixed(2)}`;
      if (i === 0) {
        firstPointStr = pointStr;
        return `M ${pointStr}`;
      }
      return `${acc} L ${pointStr}`;
    }, "");

    // Close the path along the line of purples by connecting the last point back to the first
    const closedLocusPath = `${locusCurvePath} L ${firstPointStr} Z`;

    // Use the ref instead of querySelector
    if (pathRef.current) {
      // Use the correctly closed path
      pathRef.current.setAttribute("d", closedLocusPath);
    }
    return points; // Return the parsed points
  } catch (error) {
    console.error("Error processing spectral locus data:", error);
    return null; // Return null on error
  }
};

const drawColorSpace = (
  ctx: CanvasRenderingContext2D,
  primaries: PrimaryCoordinates,
  strokeStyle: string,
  plotSize: number,
  xScale: number,
  yScale: number
): void => {
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(
    (primaries.r[0] / xScale) * plotSize,
    ((yScale - primaries.r[1]) / yScale) * plotSize
  );
  ctx.lineTo(
    (primaries.g[0] / xScale) * plotSize,
    ((yScale - primaries.g[1]) / yScale) * plotSize
  );
  ctx.lineTo(
    (primaries.b[0] / xScale) * plotSize,
    ((yScale - primaries.b[1]) / yScale) * plotSize
  );
  ctx.closePath();
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
};

const drawWhitePoint = (
  ctx: CanvasRenderingContext2D,
  plotSize: number,
  xScale: number,
  yScale: number,
  whitepointCoords: { x: number; y: number }
): void => {
  ctx.beginPath();
  ctx.arc(
    (whitepointCoords.x / xScale) * plotSize,
    ((yScale - whitepointCoords.y) / yScale) * plotSize,
    5,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctx.stroke();
};
