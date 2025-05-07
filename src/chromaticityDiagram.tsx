import type React from "react";
import { useEffect, useRef, useState } from "react";
import { XAxis, YAxis } from "./axis";
import type { RenderOptions } from "./chromaticityRenderer";
import {
  drawGrid,
  drawPlanckianLocus,
  renderChromaticityDiagram,
} from "./chromaticityRenderer";
import type { PrimaryCoordinates } from "./constants/primaries";
import { getPlanckianLocusPoints } from "./planckianLocus";

// Re-define/Import necessary constants/types/helpers
// (Ideally, these would be shared or imported from the renderer)

export interface ChromaticityDiagramProps {
  /**
   * Input color space primaries as RGB coordinates
   */
  inputPrimaries?: PrimaryCoordinates | null;
  /**
   * Output color space primaries as RGB coordinates
   */
  outputPrimaries?: PrimaryCoordinates | null;
  /**
   * Whitepoint coordinates {x, y} or null
   */
  whitepoint?: { x: number; y: number } | null;
  /**
   * X Scale (Max x value, defaults to 0.8)
   */
  xScale?: number;
  /**
   * Y Scale (Max y value, defaults to 0.9)
   */
  yScale?: number;
  /**
   * Color for the axis labels (defaults to '#000000')
   */
  axisLabelColor?: string;
  /**
   * Color for the grid lines (defaults to 'rgba(0, 0, 0, 0.2)')
   */
  gridLineColor?: string;
  /**
   * Width for the grid lines (defaults to 1)
   */
  gridLineWidth?: number;
  /**
   * Stroke color for the input primaries triangle (defaults to 'rgba(0, 255, 0, 0.8)')
   */
  inputPrimariesColor?: string;
  /**
   * Stroke color for the output primaries triangle (defaults to 'rgba(255, 0, 0, 0.8)')
   */
  outputPrimariesColor?: string;
  /**
   * Whether to show the Planckian locus (defaults to false)
   */
  showPlanckianLocus?: boolean;
  /**
   * Color for the Planckian locus line (defaults to '#000000')
   */
  planckianLocusColor?: string;
  /**
   * Target color space for rendering ('srgb' or 'display-p3'). Defaults to 'srgb'.
   */
  colorSpace?: "srgb" | "display-p3";
}

// Define constants for the diagram size
const PLOT_SIZE = 600;

export const ChromaticityDiagram: React.FC<ChromaticityDiagramProps> = ({
  inputPrimaries = { r: [0.64, 0.33], g: [0.3, 0.6], b: [0.15, 0.06] }, // sRGB defaults
  outputPrimaries = { r: [0.64, 0.33], g: [0.3, 0.6], b: [0.15, 0.06] }, // sRGB defaults
  whitepoint = { x: 0.3127, y: 0.329 }, // Default to D65 coordinates
  xScale = 0.8,
  yScale = 0.9,
  axisLabelColor = "#000000",
  gridLineColor = "rgba(0, 0, 0, 0.2)",
  gridLineWidth = 1,
  inputPrimariesColor, // Default handled in renderer
  outputPrimariesColor, // Default handled in renderer
  showPlanckianLocus = false,
  planckianLocusColor = "#000000",
  colorSpace = "srgb", // Add default for new prop
}) => {
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // Store locus points locally once fetched
  const [locusPoints, setLocusPoints] = useState<
    { x: number; y: number }[] | null
  >(null);
  const [planckianLocusPoints, setPlanckianLocusPoints] = useState<
    { x: number; y: number }[] | null
  >(null);

  // Effect to fetch locus points ONCE on mount OR when scales change
  useEffect(() => {
    const glCanvas = glCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const path = pathRef.current;

    if (!glCanvas || !overlayCanvas || !path) {
      console.error("Canvas or path ref not available for locus fetch.");
      return;
    }

    const dummyOptions: RenderOptions = {
      plotSize: PLOT_SIZE,
      xScale: xScale,
      yScale: yScale,
      inputPrimaries: null,
      outputPrimaries: null,
      whitepointCoords: null,
    };

    renderChromaticityDiagram(
      glCanvas.getContext("webgl") as WebGLRenderingContext,
      overlayCanvas.getContext("2d") as CanvasRenderingContext2D,
      pathRef,
      dummyOptions
    )
      .then((points) => {
        if (points) {
          setLocusPoints(points); // Store the points
        } else {
          console.error("Failed to fetch locus points.");
        }
      })
      .catch((error) => {
        console.error("Error fetching locus points:", error);
      });

    // Run only once on mount or when scales change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xScale, yScale]); // Dependencies: include scales as they affect path calc

  // Effect to calculate Planckian locus points when enabled
  useEffect(() => {
    if (showPlanckianLocus) {
      // Calculate points (e.g., from 1000K to 15000K with 100 steps)
      // These ranges and steps can be made configurable if needed
      const points = getPlanckianLocusPoints(1000, 15000, 100);
      setPlanckianLocusPoints(points);
    } else {
      setPlanckianLocusPoints(null);
    }
  }, [showPlanckianLocus]);

  // Main rendering effect - runs when props, scales change, AFTER locus points are loaded
  useEffect(() => {
    // Don't run if locus points aren't loaded yet or if refs aren't ready
    if (
      !locusPoints ||
      !glCanvasRef.current ||
      !overlayCanvasRef.current ||
      !pathRef.current
    ) {
      return;
    }

    const glCanvas = glCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let actualOutputColorSpace: "srgb" | "display-p3" = "srgb";
    let manualGammaCorrectionNeeded = true; // Default to true (for sRGB contexts or WebGL1)

    if (colorSpace === "display-p3") {
      const gl2Candidate = glCanvas.getContext("webgl2", {
        colorSpace: "display-p3",
      });
      if (gl2Candidate instanceof WebGL2RenderingContext) {
        gl = gl2Candidate;
        // For WebGL2, check drawingBufferColorSpace for the actual colorspace of the buffer
        if (gl.drawingBufferColorSpace === "display-p3") {
          actualOutputColorSpace = "display-p3"; // Shader will use P3 matrix
          manualGammaCorrectionNeeded = false; // Browser handles gamma for P3 buffer
          console.log(
            "Successfully initialized WebGL2 context with display-p3 color space. Shader will output linear P3."
          );
        } else {
          // Got a WebGL2 context, but it's not 'display-p3'. It's likely 'srgb'.
          actualOutputColorSpace = "srgb"; // Shader will use sRGB matrix and apply sRGB gamma
          manualGammaCorrectionNeeded = true;
          console.warn(
            `Requested display-p3, but WebGL2 context is ${gl.drawingBufferColorSpace}. Falling back to sRGB rendering with manual gamma.`
          );
        }
      } else {
        // WebGL2 not available, fall back to WebGL1 (which is sRGB and needs manual gamma)
        console.warn(
          "Requested display-p3, but WebGL2 is not available. Falling back to WebGL1 (sRGB with manual gamma)."
        );
        const gl1Candidate = glCanvas.getContext("webgl");
        if (gl1Candidate instanceof WebGLRenderingContext) {
          gl = gl1Candidate;
        }
        actualOutputColorSpace = "srgb"; // Shader uses sRGB matrix
        manualGammaCorrectionNeeded = true; // Shader applies sRGB gamma
      }
    } else {
      // colorSpace prop is 'srgb'. Prefer WebGL2 for sRGB, then WebGL1.
      // Both will require manual gamma from the shader.
      const gl2Candidate = glCanvas.getContext("webgl2");
      if (gl2Candidate instanceof WebGL2RenderingContext) {
        gl = gl2Candidate;
        console.log("Initialized WebGL2 context for sRGB (manual gamma).");
      } else {
        const gl1Candidate = glCanvas.getContext("webgl");
        if (gl1Candidate instanceof WebGLRenderingContext) {
          gl = gl1Candidate;
          console.log("Initialized WebGL1 context for sRGB (manual gamma).");
        }
      }
      actualOutputColorSpace = "srgb";
      manualGammaCorrectionNeeded = true;
    }

    const overlayCtx = overlayCanvas.getContext("2d");

    if (!gl || !overlayCtx) {
      console.error("Failed to get rendering contexts after attempts.");
      return;
    }

    // Whitepoint is now directly the coords object or null
    const wpCoords = whitepoint;

    const options: RenderOptions = {
      plotSize: PLOT_SIZE,
      xScale: xScale,
      yScale: yScale,
      inputPrimaries,
      outputPrimaries,
      whitepointCoords: wpCoords,
      inputPrimariesColor,
      outputPrimariesColor,
      outputTargetColorSpace: actualOutputColorSpace, // Renamed for clarity
      manualGammaCorrectionRequired: manualGammaCorrectionNeeded, // New flag
    };

    // Render the diagram. This call will now use the cached locus points internally
    // for setting the SVG path `d` attribute via the pathRef.
    renderChromaticityDiagram(gl, overlayCtx, pathRef, options)
      .then(() => {
        // After main diagram is rendered (which clears overlayCtx),
        // draw the Planckian locus if enabled and points are available.
        if (showPlanckianLocus && planckianLocusPoints && overlayCtx) {
          drawPlanckianLocus(
            overlayCtx,
            planckianLocusPoints,
            planckianLocusColor,
            PLOT_SIZE,
            xScale,
            yScale
          );
        }
      })
      .catch((error) => {
        console.error("Error rendering chromaticity diagram:", error);
      });

    // Dependency array now includes the whitepoint prop directly
    // And also scales, since they affect drawing
  }, [
    inputPrimaries,
    outputPrimaries,
    whitepoint,
    locusPoints,
    xScale,
    yScale,
    inputPrimariesColor, // Add to dependency array
    outputPrimariesColor, // Add to dependency array
    showPlanckianLocus, // Add to dependency array
    planckianLocusColor, // Add to dependency array
    planckianLocusPoints, // Add to dependency array
    colorSpace, // Add new prop to dependency array
  ]);

  // Effect for drawing the grid - runs when scale or locus loading state changes
  useEffect(() => {
    if (!gridCanvasRef.current) {
      // Don't draw grid if canvas not ready
      return;
    }

    const gridCanvas = gridCanvasRef.current;
    const gridCtx = gridCanvas.getContext("2d");

    if (!gridCtx) {
      console.error("Failed to get grid rendering context");
      return;
    }

    // Clear previous grid
    gridCtx.clearRect(0, 0, PLOT_SIZE, PLOT_SIZE);

    // Draw the grid using the imported function
    drawGrid(gridCtx, PLOT_SIZE, xScale, yScale, gridLineColor, gridLineWidth);
  }, [xScale, yScale, gridLineColor, gridLineWidth]); // Add missing dependencies

  const axisLabelPadding = 20; // Space for labels

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${axisLabelPadding}px 1fr`,
        gridTemplateRows: `1fr ${axisLabelPadding}px`,
        width: PLOT_SIZE + axisLabelPadding,
        height: PLOT_SIZE + axisLabelPadding,
        position: "relative",
      }}
    >
      {/* Y Axis Component */}
      <YAxis
        scale={yScale}
        plotSize={PLOT_SIZE}
        axisLabelPadding={axisLabelPadding}
        axisLabelColor={axisLabelColor}
      />

      {/* Main Diagram Area */}
      <div
        style={{
          gridColumn: 2,
          gridRow: 1,
          position: "relative",
          width: PLOT_SIZE,
          height: PLOT_SIZE,
        }}
      >
        {/* WebGL Canvas for the background gradient */}
        <canvas
          ref={glCanvasRef}
          width={PLOT_SIZE}
          height={PLOT_SIZE}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            clipPath: "url(#spectral-locus-clip)",
            WebkitClipPath: "url(#spectral-locus-clip)",
          }}
        />
        {/* Grid Canvas */}
        <canvas
          ref={gridCanvasRef}
          width={PLOT_SIZE}
          height={PLOT_SIZE}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 3, // Grid above SVG stroke, below overlay
            pointerEvents: "none",
          }}
        />
        {/* SVG for the spectral locus boundary and clipping */}
        <svg
          width={PLOT_SIZE}
          height={PLOT_SIZE}
          viewBox={`0 0 ${PLOT_SIZE} ${PLOT_SIZE}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2, // SVG stroke below grid
            pointerEvents: "none",
          }}
        >
          <title>CIE 1931 Spectral Locus Boundary and Clip Path</title>
          <defs>
            <clipPath id="spectral-locus-clip">
              <path ref={pathRef} />
            </clipPath>
          </defs>
          <path
            d={pathRef.current?.getAttribute("d") || ""}
            fill="none"
            stroke="rgba(50, 50, 50, 0.75)"
            strokeWidth=".5"
          />
        </svg>
        {/* Overlay Canvas for color spaces, white point */}
        <canvas
          ref={overlayCanvasRef}
          width={PLOT_SIZE}
          height={PLOT_SIZE}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 4, // Overlay on top of GL, Grid, SVG stroke
          }}
        />
      </div>

      {/* X Axis Component */}
      <XAxis
        scale={xScale}
        plotSize={PLOT_SIZE}
        axisLabelPadding={axisLabelPadding}
        axisLabelColor={axisLabelColor}
      />
    </div>
  );
};

export default ChromaticityDiagram;
