import { CIE_CC_1931_DEG } from "./constants/cie_cc_1931_deg";
import type { PrimaryCoordinates } from "./constants/primaries";
import {
  FRAGMENT_SHADER_SOURCE,
  VERTEX_SHADER_SOURCE,
} from "./constants/shaders";
import { compileShader, createProgram } from "./shaderUtils";

export interface RenderOptions {
  plotSize: number;
  xScale: number;
  yScale: number;
  inputPrimaries?: PrimaryCoordinates | null;
  outputPrimaries?: PrimaryCoordinates | null;
  whitepointCoords: { x: number; y: number } | null;
  inputPrimariesColor?: string;
  outputPrimariesColor?: string;
}

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  plotSize: number,
  xScale: number,
  yScale: number,
  gridLineColor: string,
  gridLineWidth: number
): void => {
  ctx.strokeStyle = gridLineColor;
  ctx.lineWidth = gridLineWidth;

  // Vertical grid lines & X labels
  for (let x = 0.1; x < xScale; x += 0.1) {
    const xPos = (x / xScale) * plotSize;
    ctx.beginPath();
    ctx.moveTo(xPos, 0);
    ctx.lineTo(xPos, plotSize);
    ctx.stroke();
  }

  // Horizontal grid lines & Y labels
  for (let y = 0.1; y < yScale; y += 0.1) {
    const yPos = ((yScale - y) / yScale) * plotSize;
    ctx.beginPath();
    ctx.moveTo(0, yPos);
    ctx.lineTo(plotSize, yPos);
    ctx.stroke();
  }
};

export const renderChromaticityDiagram = async (
  gl: WebGLRenderingContext,
  overlayCtx: CanvasRenderingContext2D,
  pathRef: React.RefObject<SVGPathElement>,
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
  if (!program) return null;

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

  gl.uniform2f(
    gl.getUniformLocation(program, "u_resolution"),
    plotSize,
    plotSize
  );
  gl.uniform2f(gl.getUniformLocation(program, "u_scale"), xScale, yScale);

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
  pathRef: React.RefObject<SVGPathElement>,
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
