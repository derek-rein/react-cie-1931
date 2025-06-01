import { AxisBottom, AxisLeft } from "@visx/axis";
import { Grid } from "@visx/grid";
import { scaleLinear } from "@visx/scale";
import { Zoom } from "@visx/zoom";
import React, { useCallback, useRef } from "react";
import { type ColorSpace, useChromaticity } from "./ChromaticityContext";

export interface ChromaticityDiagramProps {
  /**
   * Array of color spaces to display
   */
  colorSpaces?: ColorSpace[];
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
const MARGIN = { top: 20, right: 20, bottom: 60, left: 60 };
const INNER_WIDTH = PLOT_SIZE - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = PLOT_SIZE - MARGIN.top - MARGIN.bottom;

export const ChromaticityDiagram: React.FC<ChromaticityDiagramProps> = ({
  colorSpaces = [],
  axisLabelColor = "#000000",
  gridLineColor = "rgba(0, 0, 0, 0.2)",
  gridLineWidth = 1,
  showPlanckianLocus = false,
  planckianLocusColor = "#000000",
  colorSpace = "srgb",
}) => {
  const {
    state,
    actions,
    constants,
    renderWithCurrentState,
    renderWithTransform,
  } = useChromaticity();
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const initializeRef = useRef(false);

  // Memoized render options to prevent unnecessary re-renders
  const renderOptions = useCallback(
    () => ({
      showPlanckianLocus,
      planckianLocusColor,
      colorSpace,
      axisLabelColor,
      gridLineColor,
      gridLineWidth,
    }),
    [
      showPlanckianLocus,
      planckianLocusColor,
      colorSpace,
      axisLabelColor,
      gridLineColor,
      gridLineWidth,
    ]
  );

  // Initialize directly when refs are ready (no useEffect)
  if (
    !initializeRef.current &&
    glCanvasRef.current &&
    overlayCanvasRef.current &&
    pathRef.current &&
    !state.isInitialized
  ) {
    initializeRef.current = true;
    actions.initialize(glCanvasRef.current, overlayCanvasRef.current, pathRef);
  }

  // Memoized transform handler
  const handleTransformChange = useCallback(
    (newTransform: {
      scaleX: number;
      scaleY: number;
      translateX: number;
      translateY: number;
    }) => {
      actions.setTransform(newTransform);
    },
    [actions]
  );

  return (
    <div
      style={{
        width: PLOT_SIZE,
        height: PLOT_SIZE,
        position: "relative",
        border: "1px solid #e0e0e0",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <Zoom<SVGSVGElement>
        width={PLOT_SIZE}
        height={PLOT_SIZE}
        scaleXMin={0.5}
        scaleXMax={4}
        scaleYMin={0.5}
        scaleYMax={4}
        initialTransformMatrix={{
          scaleX: 1,
          scaleY: 1,
          translateX: 0,
          translateY: 0,
          skewX: 0,
          skewY: 0,
        }}
      >
        {(zoom) => {
          const { scaleX, scaleY, translateX, translateY } =
            zoom.transformMatrix;

          // Update transform in context immediately (no useEffect)
          handleTransformChange({ scaleX, scaleY, translateX, translateY });

          // Render immediately if initialized (no useEffect)
          if (state.isInitialized) {
            renderWithTransform(colorSpaces, renderOptions(), {
              scaleX,
              scaleY,
              translateX,
              translateY,
            });
          }

          // Calculate the visible domain for axes using current transform
          const leftDataPoint =
            (-translateX / scaleX / INNER_WIDTH) * constants.xScale;
          const rightDataPoint =
            ((INNER_WIDTH - translateX) / scaleX / INNER_WIDTH) *
            constants.xScale;
          const topDataPoint =
            (-translateY / scaleY / INNER_HEIGHT) * constants.yScale;
          const bottomDataPoint =
            ((INNER_HEIGHT - translateY) / scaleY / INNER_HEIGHT) *
            constants.yScale;

          const zoomedXScale = scaleLinear({
            domain: [leftDataPoint, rightDataPoint],
            range: [0, INNER_WIDTH],
          });

          const zoomedYScale = scaleLinear({
            domain: [
              constants.yScale - bottomDataPoint,
              constants.yScale - topDataPoint,
            ],
            range: [INNER_HEIGHT, 0],
          });

          // Calculate appropriate tick counts based on zoom level
          const baseXTicks = Math.floor(constants.xScale * 10);
          const baseYTicks = Math.floor(constants.yScale * 10);
          const xTickCount = Math.max(
            5,
            Math.min(20, Math.floor(baseXTicks * scaleX))
          );
          const yTickCount = Math.max(
            5,
            Math.min(20, Math.floor(baseYTicks * scaleY))
          );

          return (
            <div style={{ position: "relative" }}>
              <svg
                width={PLOT_SIZE}
                height={PLOT_SIZE}
                style={{
                  cursor: zoom.isDragging ? "grabbing" : "grab",
                  touchAction: "none",
                }}
                onMouseDown={zoom.dragStart}
                onMouseMove={zoom.dragMove}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
                }}
                onTouchStart={zoom.dragStart}
                onTouchMove={zoom.dragMove}
                onTouchEnd={zoom.dragEnd}
                onWheel={(event) => {
                  event.preventDefault();
                  const svg = event.currentTarget;
                  const rect = svg.getBoundingClientRect();
                  const point = {
                    x: event.clientX - rect.left - MARGIN.left,
                    y: event.clientY - rect.top - MARGIN.top,
                  };
                  const wheelDelta = -event.deltaY > 0 ? 1.1 : 0.9;
                  zoom.scale({
                    scaleX: wheelDelta,
                    scaleY: wheelDelta,
                    point,
                  });
                }}
                onDoubleClick={(event) => {
                  const svg = event.currentTarget;
                  const rect = svg.getBoundingClientRect();
                  const point = {
                    x: event.clientX - rect.left - MARGIN.left,
                    y: event.clientY - rect.top - MARGIN.top,
                  };
                  zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
                }}
              >
                {/* Clipping path definition - use exact same coordinate system as locus boundary */}
                <defs>
                  <clipPath id="spectral-locus-clip">
                    <path
                      ref={pathRef}
                      transform={`scale(${scaleX}, ${scaleY}) translate(${translateX / scaleX}, ${translateY / scaleY})`}
                    />
                  </clipPath>
                </defs>

                {/* Main content group */}
                <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                  {/* WebGL canvas - clipped by locus path using exact same coordinate system */}
                  <foreignObject
                    x={0}
                    y={0}
                    width={INNER_WIDTH}
                    height={INNER_HEIGHT}
                  >
                    <canvas
                      ref={glCanvasRef}
                      width={INNER_WIDTH}
                      height={INNER_HEIGHT}
                      style={{
                        width: "100%",
                        height: "100%",
                        clipPath: "url(#spectral-locus-clip)",
                        WebkitClipPath: "url(#spectral-locus-clip)",
                      }}
                    />
                  </foreignObject>

                  {/* SVG for the spectral locus boundary - exact same transform as clipping path */}
                  <g
                    transform={`scale(${scaleX}, ${scaleY}) translate(${translateX / scaleX}, ${translateY / scaleY})`}
                  >
                    <path
                      d={pathRef.current?.getAttribute("d") || ""}
                      fill="none"
                      stroke="rgba(50, 50, 50, 0.75)"
                      strokeWidth={0.5 / Math.max(scaleX, scaleY)}
                    />
                  </g>
                </g>

                {/* Grid and axes - OUTSIDE zoom transform, drawn at screen space */}
                <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                  {/* Grid using visx with zoomed scales - drawn at screen space */}
                  <Grid
                    xScale={zoomedXScale}
                    yScale={zoomedYScale}
                    width={INNER_WIDTH}
                    height={INNER_HEIGHT}
                    stroke={gridLineColor}
                    strokeWidth={gridLineWidth}
                    strokeOpacity={0.6}
                    numTicksRows={yTickCount}
                    numTicksColumns={xTickCount}
                  />

                  {/* Axes using visx with zoomed scales - drawn at screen space with appropriate tick density */}
                  <AxisBottom
                    scale={zoomedXScale}
                    top={INNER_HEIGHT}
                    label="x (CIE 1931)"
                    labelOffset={15}
                    stroke={axisLabelColor}
                    tickStroke={axisLabelColor}
                    numTicks={xTickCount}
                    tickLabelProps={{
                      fill: axisLabelColor,
                      fontSize: 10,
                      textAnchor: "middle",
                    }}
                    labelProps={{
                      fill: axisLabelColor,
                      fontSize: 12,
                      textAnchor: "middle",
                    }}
                  />
                  <AxisLeft
                    scale={zoomedYScale}
                    label="y (CIE 1931)"
                    labelOffset={25}
                    stroke={axisLabelColor}
                    tickStroke={axisLabelColor}
                    numTicks={yTickCount}
                    tickLabelProps={{
                      fill: axisLabelColor,
                      fontSize: 10,
                      textAnchor: "end",
                    }}
                    labelProps={{
                      fill: axisLabelColor,
                      fontSize: 12,
                      textAnchor: "middle",
                    }}
                  />

                  {/* Overlay canvas for primaries and white point - OUTSIDE zoom transform */}
                  <foreignObject
                    x={0}
                    y={0}
                    width={INNER_WIDTH}
                    height={INNER_HEIGHT}
                  >
                    <canvas
                      ref={overlayCanvasRef}
                      width={INNER_WIDTH}
                      height={INNER_HEIGHT}
                      style={{
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                      }}
                    />
                  </foreignObject>
                </g>
              </svg>

              {/* Zoom controls */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  zIndex: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
                  style={{
                    width: 30,
                    height: 30,
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
                  style={{
                    width: 30,
                    height: 30,
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => {
                    zoom.reset();
                    actions.resetTransform();
                  }}
                  style={{
                    width: 30,
                    height: 30,
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ⌂
                </button>
              </div>
            </div>
          );
        }}
      </Zoom>
    </div>
  );
};

export default ChromaticityDiagram;
