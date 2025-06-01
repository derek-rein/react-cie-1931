import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RenderOptions } from "./chromaticityRenderer";
import { renderChromaticityDiagram } from "./chromaticityRenderer";
import { getPlanckianLocusPoints } from "./planckianLocus";

// Fixed internal scales - no longer exposed as props
const INTERNAL_X_SCALE = 0.8;
const INTERNAL_Y_SCALE = 0.9;

export interface ColorSpace {
  name: string;
  rgb: {
    r: [number, number];
    g: [number, number];
    b: [number, number];
  };
  whitepoint: {
    x: number;
    y: number;
  };
  color?: string; // Optional color for the triangle
}

export interface Transform {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
}

export interface ChromaticityState {
  // Transform state - single source of truth
  transform: Transform;

  // Rendering state
  isInitialized: boolean;
  locusPoints: { x: number; y: number }[] | null;
  planckianLocusPoints: { x: number; y: number }[] | null;
}

export interface ChromaticityActions {
  setTransform: (transform: Transform) => void;
  resetTransform: () => void;
  initialize: (
    glCanvas: HTMLCanvasElement,
    overlayCanvas: HTMLCanvasElement,
    pathRef: React.RefObject<SVGPathElement | null>
  ) => Promise<void>;
}

export interface ChromaticityContextValue {
  state: ChromaticityState;
  actions: ChromaticityActions;
  constants: {
    xScale: number;
    yScale: number;
  };
  // Memoized rendering function
  renderWithCurrentState: (
    colorSpaces: ColorSpace[],
    options: {
      showPlanckianLocus?: boolean;
      planckianLocusColor?: string;
      colorSpace?: "srgb" | "display-p3";
      axisLabelColor?: string;
      gridLineColor?: string;
      gridLineWidth?: number;
    }
  ) => void;
  // Immediate render function that uses provided transform (for responsiveness)
  renderWithTransform: (
    colorSpaces: ColorSpace[],
    options: {
      showPlanckianLocus?: boolean;
      planckianLocusColor?: string;
      colorSpace?: "srgb" | "display-p3";
      axisLabelColor?: string;
      gridLineColor?: string;
      gridLineWidth?: number;
    },
    transform: Transform
  ) => void;
}

const ChromaticityContext = createContext<ChromaticityContextValue | null>(
  null
);

export const useChromaticity = () => {
  const context = useContext(ChromaticityContext);
  if (!context) {
    throw new Error(
      "useChromaticity must be used within a ChromaticityProvider"
    );
  }
  return context;
};

const DEFAULT_TRANSFORM: Transform = {
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
};

export const ChromaticityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<ChromaticityState>({
    transform: DEFAULT_TRANSFORM,
    isInitialized: false,
    locusPoints: null,
    planckianLocusPoints: null,
  });

  // Refs to maintain canvas/path references and prevent concurrent renders
  const canvasRefs = useRef<{
    glCanvas: HTMLCanvasElement | null;
    overlayCanvas: HTMLCanvasElement | null;
    pathRef: React.RefObject<SVGPathElement | null> | null;
  }>({
    glCanvas: null,
    overlayCanvas: null,
    pathRef: null,
  });

  const isRenderingRef = useRef(false);

  // Memoized transform comparison to prevent unnecessary updates
  const setTransform = useCallback((newTransform: Transform) => {
    setState((prev) => {
      // Only update if transform actually changed
      if (
        prev.transform.scaleX === newTransform.scaleX &&
        prev.transform.scaleY === newTransform.scaleY &&
        prev.transform.translateX === newTransform.translateX &&
        prev.transform.translateY === newTransform.translateY
      ) {
        return prev; // No change, prevent re-render
      }
      return { ...prev, transform: newTransform };
    });
  }, []);

  const resetTransform = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM);
  }, [setTransform]);

  const initialize = useCallback(
    async (
      glCanvas: HTMLCanvasElement,
      overlayCanvas: HTMLCanvasElement,
      pathRef: React.RefObject<SVGPathElement | null>
    ) => {
      // Store refs
      canvasRefs.current = { glCanvas, overlayCanvas, pathRef };

      // Initialize with dummy render to get locus points
      const gl = glCanvas.getContext("webgl") || glCanvas.getContext("webgl2");
      const overlayCtx = overlayCanvas.getContext("2d");

      if (!gl || !overlayCtx) {
        console.error("Failed to get rendering contexts");
        return;
      }

      const dummyOptions: RenderOptions = {
        plotSize: glCanvas.width,
        xScale: INTERNAL_X_SCALE,
        yScale: INTERNAL_Y_SCALE,
        inputPrimaries: null,
        outputPrimaries: null,
        whitepointCoords: null,
      };

      try {
        const locusPoints = await renderChromaticityDiagram(
          gl,
          overlayCtx,
          pathRef,
          dummyOptions
        );
        const planckianPoints = getPlanckianLocusPoints(1000, 15000, 100);

        setState((prev) => ({
          ...prev,
          isInitialized: true,
          locusPoints,
          planckianLocusPoints: planckianPoints,
        }));
      } catch (error) {
        console.error("Failed to initialize chromaticity diagram:", error);
      }
    },
    []
  );

  // Core rendering function - memoized to prevent recreation
  const performRender = useCallback(
    (
      colorSpaces: ColorSpace[],
      options: {
        showPlanckianLocus?: boolean;
        planckianLocusColor?: string;
        colorSpace?: "srgb" | "display-p3";
        axisLabelColor?: string;
        gridLineColor?: string;
        gridLineWidth?: number;
      },
      transform: Transform
    ) => {
      // Prevent concurrent renders
      if (isRenderingRef.current) {
        return;
      }

      const { glCanvas, overlayCanvas, pathRef } = canvasRefs.current;
      if (!glCanvas || !overlayCanvas || !pathRef || !state.isInitialized) {
        return;
      }

      isRenderingRef.current = true;

      try {
        const {
          colorSpace = "srgb",
          showPlanckianLocus = false,
          planckianLocusColor = "#000000",
        } = options;

        // Calculate visible viewport
        const INNER_WIDTH = glCanvas.width;
        const INNER_HEIGHT = glCanvas.height;

        const leftDataPoint =
          (-transform.translateX / transform.scaleX / INNER_WIDTH) *
          INTERNAL_X_SCALE;
        const rightDataPoint =
          ((INNER_WIDTH - transform.translateX) /
            transform.scaleX /
            INNER_WIDTH) *
          INTERNAL_X_SCALE;
        const topDataPoint =
          (-transform.translateY / transform.scaleY / INNER_HEIGHT) *
          INTERNAL_Y_SCALE;
        const bottomDataPoint =
          ((INNER_HEIGHT - transform.translateY) /
            transform.scaleY /
            INNER_HEIGHT) *
          INTERNAL_Y_SCALE;

        // Set up WebGL context
        let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
        let actualOutputColorSpace: "srgb" | "display-p3" = "srgb";
        let manualGammaCorrectionNeeded = true;

        if (colorSpace === "display-p3") {
          const gl2Candidate = glCanvas.getContext("webgl2", {
            colorSpace: "display-p3",
          });
          if (gl2Candidate instanceof WebGL2RenderingContext) {
            gl = gl2Candidate;
            if (gl.drawingBufferColorSpace === "display-p3") {
              actualOutputColorSpace = "display-p3";
              manualGammaCorrectionNeeded = false;
            } else {
              actualOutputColorSpace = "srgb";
              manualGammaCorrectionNeeded = true;
            }
          } else {
            const gl1Candidate = glCanvas.getContext("webgl");
            if (gl1Candidate instanceof WebGLRenderingContext) {
              gl = gl1Candidate;
            }
            actualOutputColorSpace = "srgb";
            manualGammaCorrectionNeeded = true;
          }
        } else {
          const gl2Candidate = glCanvas.getContext("webgl2");
          if (gl2Candidate instanceof WebGL2RenderingContext) {
            gl = gl2Candidate;
          } else {
            const gl1Candidate = glCanvas.getContext("webgl");
            if (gl1Candidate instanceof WebGLRenderingContext) {
              gl = gl1Candidate;
            }
          }
          actualOutputColorSpace = "srgb";
          manualGammaCorrectionNeeded = true;
        }

        const overlayCtx = overlayCanvas.getContext("2d");
        if (!gl || !overlayCtx) {
          console.error("Failed to get rendering contexts");
          return;
        }

        // Render main diagram
        const renderOptions: RenderOptions = {
          plotSize: INNER_WIDTH,
          xScale: INTERNAL_X_SCALE,
          yScale: INTERNAL_Y_SCALE,
          inputPrimaries: null, // Will be drawn separately
          outputPrimaries: null, // Will be drawn separately
          whitepointCoords: null, // Will be drawn separately
          outputTargetColorSpace: actualOutputColorSpace,
          manualGammaCorrectionRequired: manualGammaCorrectionNeeded,
          visibleXMin: leftDataPoint,
          visibleXMax: rightDataPoint,
          visibleYMin: INTERNAL_Y_SCALE - bottomDataPoint,
          visibleYMax: INTERNAL_Y_SCALE - topDataPoint,
        };

        renderChromaticityDiagram(gl, overlayCtx, pathRef, renderOptions)
          .then(() => {
            // Draw color spaces and their white points
            drawColorSpaces(overlayCtx, colorSpaces, transform);

            // Draw Planckian locus if enabled
            if (showPlanckianLocus && state.planckianLocusPoints) {
              drawPlanckianLocus(
                overlayCtx,
                state.planckianLocusPoints,
                planckianLocusColor,
                transform
              );
            }
          })
          .catch((error) => {
            console.error("Error rendering chromaticity diagram:", error);
          })
          .finally(() => {
            isRenderingRef.current = false;
          });
      } catch (error) {
        console.error("Render error:", error);
        isRenderingRef.current = false;
      }
    },
    [state.isInitialized, state.planckianLocusPoints]
  );

  // Memoized render function that uses current state
  const renderWithCurrentState = useCallback(
    (
      colorSpaces: ColorSpace[],
      options: {
        showPlanckianLocus?: boolean;
        planckianLocusColor?: string;
        colorSpace?: "srgb" | "display-p3";
        axisLabelColor?: string;
        gridLineColor?: string;
        gridLineWidth?: number;
      }
    ) => {
      performRender(colorSpaces, options, state.transform);
    },
    [performRender, state.transform]
  );

  // Immediate render function that uses provided transform (for responsiveness)
  const renderWithTransform = useCallback(
    (
      colorSpaces: ColorSpace[],
      options: {
        showPlanckianLocus?: boolean;
        planckianLocusColor?: string;
        colorSpace?: "srgb" | "display-p3";
        axisLabelColor?: string;
        gridLineColor?: string;
        gridLineWidth?: number;
      },
      transform: Transform
    ) => {
      performRender(colorSpaces, options, transform);
    },
    [performRender]
  );

  // Helper function to draw color spaces with screen-space transformation
  const drawColorSpaces = useCallback(
    (
      overlayCtx: CanvasRenderingContext2D,
      colorSpaces: ColorSpace[],
      zoomTransform: Transform
    ) => {
      const INNER_WIDTH = overlayCtx.canvas.width;
      const INNER_HEIGHT = overlayCtx.canvas.height;

      const transformToScreen = (dataX: number, dataY: number) => {
        const normalizedX = dataX / INTERNAL_X_SCALE;
        const normalizedY = (INTERNAL_Y_SCALE - dataY) / INTERNAL_Y_SCALE;
        const pixelX = normalizedX * INNER_WIDTH;
        const pixelY = normalizedY * INNER_HEIGHT;
        const screenX =
          pixelX * zoomTransform.scaleX + zoomTransform.translateX;
        const screenY =
          pixelY * zoomTransform.scaleY + zoomTransform.translateY;
        return { x: screenX, y: screenY };
      };

      colorSpaces.forEach((colorSpace, index) => {
        const defaultColors = [
          "rgba(0, 255, 0, 0.8)",
          "rgba(255, 0, 0, 0.8)",
          "rgba(0, 0, 255, 0.8)",
          "rgba(255, 255, 0, 0.8)",
          "rgba(255, 0, 255, 0.8)",
          "rgba(0, 255, 255, 0.8)",
        ];
        const triangleColor =
          colorSpace.color || defaultColors[index % defaultColors.length];

        // Draw triangle
        const rScreen = transformToScreen(
          colorSpace.rgb.r[0],
          colorSpace.rgb.r[1]
        );
        const gScreen = transformToScreen(
          colorSpace.rgb.g[0],
          colorSpace.rgb.g[1]
        );
        const bScreen = transformToScreen(
          colorSpace.rgb.b[0],
          colorSpace.rgb.b[1]
        );

        // Check if at least one point is visible
        const isVisible = [rScreen, gScreen, bScreen].some(
          (point) =>
            point.x >= -50 &&
            point.x <= INNER_WIDTH + 50 &&
            point.y >= -50 &&
            point.y <= INNER_HEIGHT + 50
        );

        if (isVisible) {
          overlayCtx.lineWidth = 2;
          overlayCtx.strokeStyle = triangleColor;
          overlayCtx.beginPath();
          overlayCtx.moveTo(rScreen.x, rScreen.y);
          overlayCtx.lineTo(gScreen.x, gScreen.y);
          overlayCtx.lineTo(bScreen.x, bScreen.y);
          overlayCtx.closePath();
          overlayCtx.stroke();
        }

        // Draw white point
        const wpScreen = transformToScreen(
          colorSpace.whitepoint.x,
          colorSpace.whitepoint.y
        );
        if (
          wpScreen.x >= -10 &&
          wpScreen.x <= INNER_WIDTH + 10 &&
          wpScreen.y >= -10 &&
          wpScreen.y <= INNER_HEIGHT + 10
        ) {
          overlayCtx.beginPath();
          overlayCtx.arc(wpScreen.x, wpScreen.y, 5, 0, 2 * Math.PI);
          overlayCtx.fillStyle = "rgba(255, 255, 255, 0.8)";
          overlayCtx.fill();
          overlayCtx.strokeStyle = "rgba(0, 0, 0, 0.5)";
          overlayCtx.lineWidth = 1;
          overlayCtx.stroke();
        }
      });
    },
    []
  );

  // Helper function to draw Planckian locus with screen-space transformation
  const drawPlanckianLocus = useCallback(
    (
      overlayCtx: CanvasRenderingContext2D,
      points: { x: number; y: number }[],
      color: string,
      zoomTransform: Transform
    ) => {
      const INNER_WIDTH = overlayCtx.canvas.width;
      const INNER_HEIGHT = overlayCtx.canvas.height;

      const transformToScreen = (dataX: number, dataY: number) => {
        const normalizedX = dataX / INTERNAL_X_SCALE;
        const normalizedY = (INTERNAL_Y_SCALE - dataY) / INTERNAL_Y_SCALE;
        const pixelX = normalizedX * INNER_WIDTH;
        const pixelY = normalizedY * INNER_HEIGHT;
        const screenX =
          pixelX * zoomTransform.scaleX + zoomTransform.translateX;
        const screenY =
          pixelY * zoomTransform.scaleY + zoomTransform.translateY;
        return { x: screenX, y: screenY };
      };

      if (points.length >= 2) {
        overlayCtx.strokeStyle = color;
        overlayCtx.lineWidth = 2;
        overlayCtx.beginPath();

        let hasVisiblePoints = false;
        points.forEach((point, index) => {
          const screenPoint = transformToScreen(point.x, point.y);
          if (
            screenPoint.x >= -100 &&
            screenPoint.x <= INNER_WIDTH + 100 &&
            screenPoint.y >= -100 &&
            screenPoint.y <= INNER_HEIGHT + 100
          ) {
            hasVisiblePoints = true;
            if (index === 0) {
              overlayCtx.moveTo(screenPoint.x, screenPoint.y);
            } else {
              overlayCtx.lineTo(screenPoint.x, screenPoint.y);
            }
          }
        });

        if (hasVisiblePoints) {
          overlayCtx.stroke();
        }
      }
    },
    []
  );

  const contextValue: ChromaticityContextValue = useMemo(
    () => ({
      state,
      actions: {
        setTransform,
        resetTransform,
        initialize,
      },
      constants: {
        xScale: INTERNAL_X_SCALE,
        yScale: INTERNAL_Y_SCALE,
      },
      renderWithCurrentState,
      renderWithTransform,
    }),
    [
      state,
      setTransform,
      resetTransform,
      initialize,
      renderWithCurrentState,
      renderWithTransform,
    ]
  );

  return (
    <ChromaticityContext.Provider value={contextValue}>
      {children}
    </ChromaticityContext.Provider>
  );
};
