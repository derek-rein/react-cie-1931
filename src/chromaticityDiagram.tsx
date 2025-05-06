import type React from "react";
import { useEffect, useRef, useState } from "react";
import { XAxis } from "./XAxis";
import { YAxis } from "./YAxis";
import type { RenderOptions } from "./chromaticityRenderer";
import { drawGrid, renderChromaticityDiagram } from "./chromaticityRenderer";
import type { Primaries, Whitepoint } from "./constants/primaries";
import { whitepoints } from "./constants/primaries";

// Re-define/Import necessary constants/types/helpers
// (Ideally, these would be shared or imported from the renderer)

export interface ChromaticityDiagramProps {
	/**
	 * Input color space
	 */
	inputColorSpace?: Primaries;
	/**
	 * Output color space
	 */
	outputColorSpace?: Primaries;
	/**
	 * Whitepoint
	 */
	whitepoint?: Whitepoint;
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
}

// Define constants for the diagram size
const PLOT_SIZE = 600;

export const ChromaticityDiagram: React.FC<ChromaticityDiagramProps> = ({
	inputColorSpace = "sRGB",
	outputColorSpace = "sRGB",
	whitepoint = "D65",
	xScale = 0.8,
	yScale = 0.9,
	axisLabelColor = "#000000",
	gridLineColor = "rgba(0, 0, 0, 0.2)",
	gridLineWidth = 1,
}) => {
	const glCanvasRef = useRef<HTMLCanvasElement>(null);
	const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
	const gridCanvasRef = useRef<HTMLCanvasElement>(null);
	const pathRef = useRef<SVGPathElement>(null);

	// Store locus points locally once fetched
	const [locusPoints, setLocusPoints] = useState<
		{ x: number; y: number }[] | null
	>(null);
	const [isLocusLoading, setIsLocusLoading] = useState(true); // Add loading state

	// Effect to fetch locus points ONCE on mount OR when scales change
	useEffect(() => {
		const glCanvas = glCanvasRef.current; // Need context for renderer potentially
		const overlayCanvas = overlayCanvasRef.current; // Need context for renderer potentially
		const path = pathRef.current; // Need path ref

		// We still need temporary contexts to potentially initialize the renderer
		// if `renderChromaticityDiagram` needs them even just for fetching.
		// This is a bit awkward and suggests `renderChromaticityDiagram` could be split.
		// For now, let's get temporary contexts.
		if (!glCanvas || !overlayCanvas || !path) {
			console.error("Canvas or path ref not available for locus fetch.");
			setIsLocusLoading(false); // Stop loading on error
			return;
		}
		// Create temporary contexts (or potentially reuse if safe)
		// Note: Getting context might reset state, this might need a more robust solution
		// like a dedicated fetch function in the renderer.
		const tempGl = glCanvas.getContext("webgl");
		const tempOverlayCtx = overlayCanvas.getContext("2d");

		if (!tempGl || !tempOverlayCtx) {
			console.error("Failed to get temporary contexts for locus fetch.");
			setIsLocusLoading(false); // Stop loading on error
			return;
		}

		// Call renderChromaticityDiagram primarily to trigger the fetch/cache
		// inside drawSpectralLocus. We pass minimal/dummy options where possible.
		// This relies on the internal caching within chromaticityRenderer.ts
		const dummyOptions: RenderOptions = {
			plotSize: PLOT_SIZE,
			xScale: xScale,
			yScale: yScale,
			inputColorSpace: "sRGB", // Dummy value
			outputColorSpace: "sRGB", // Dummy value
			whitepointCoords: null, // Dummy value
		};

		setIsLocusLoading(true);
		renderChromaticityDiagram(tempGl, tempOverlayCtx, pathRef, dummyOptions)
			.then((points) => {
				if (points) {
					setLocusPoints(points); // Store the points
				} else {
					console.error("Failed to fetch locus points.");
				}
			})
			.catch((error) => {
				console.error("Error fetching locus points:", error);
			})
			.finally(() => {
				setIsLocusLoading(false); // Mark loading as complete
				// Clear the temporary contexts if they were truly temporary?
				// Or rely on the main effect to handle the actual drawing.
				// For now, we assume the main effect will overwrite/clear as needed.
			});

		// Run only once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [xScale, yScale]); // Dependencies: include scales as they affect path calc

	// Main rendering effect - runs when props, scales change, AFTER locus points are loaded
	useEffect(() => {
		// Don't run if locus points aren't loaded yet or if refs aren't ready
		if (
			isLocusLoading ||
			!locusPoints ||
			!glCanvasRef.current ||
			!overlayCanvasRef.current ||
			!pathRef.current
		) {
			return;
		}

		const glCanvas = glCanvasRef.current;
		const overlayCanvas = overlayCanvasRef.current;

		const gl = glCanvas.getContext("webgl");
		const overlayCtx = overlayCanvas.getContext("2d");

		if (!gl || !overlayCtx) {
			console.error("Failed to get rendering contexts");
			return;
		}

		// Derive whitepoint coordinates directly from prop
		let wpCoords: { x: number; y: number } | null = null;
		if (whitepoint && whitepoints[whitepoint]) {
			const [x, y] = whitepoints[whitepoint];
			wpCoords = { x, y };
		}

		const options: RenderOptions = {
			plotSize: PLOT_SIZE,
			xScale: xScale,
			yScale: yScale,
			inputColorSpace,
			outputColorSpace,
			whitepointCoords: wpCoords, // Use derived coords
		};

		// Render the diagram. This call will now use the cached locus points internally
		// for setting the SVG path `d` attribute via the pathRef.
		renderChromaticityDiagram(gl, overlayCtx, pathRef, options).catch(
			(error) => {
				console.error("Error rendering chromaticity diagram:", error);
			},
		);

		// Dependency array now includes the whitepoint prop directly
		// And also scales, since they affect drawing
	}, [
		inputColorSpace,
		outputColorSpace,
		whitepoint,
		isLocusLoading,
		locusPoints,
		xScale,
		yScale,
	]);

	// Effect for drawing the grid - runs when scale or locus loading state changes
	useEffect(() => {
		if (isLocusLoading || !gridCanvasRef.current) {
			// Don't draw grid if loading or canvas not ready
			// Clear the canvas if needed while loading?
			const gridCanvas = gridCanvasRef.current;
			if (gridCanvas) {
				const gridCtx = gridCanvas.getContext("2d");
				gridCtx?.clearRect(0, 0, PLOT_SIZE, PLOT_SIZE);
			}
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
	}, [xScale, yScale, isLocusLoading, gridLineColor, gridLineWidth]);

	const axisLabelPadding = 20; // Space for labels

	return (
		<div
			className="chromaticity-diagram-wrapper"
			style={{
				display: "grid",
				gridTemplateColumns: `${axisLabelPadding}px 1fr`, // Col for Y labels, Col for diagram
				gridTemplateRows: `1fr ${axisLabelPadding}px`, // Row for diagram, Row for X labels
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
				className="diagram-container"
				style={{
					gridColumn: 2,
					gridRow: 1,
					position: "relative",
					width: PLOT_SIZE, // Keep diagram size fixed
					height: PLOT_SIZE,
					// maxWidth: "100%", // Controlled by grid now
					// aspectRatio: "1 / 1",
				}}
			>
				<h4>CIE 1931 Chromaticity Diagram</h4>
				{/* Add loading indicator */}
				{isLocusLoading && (
					<div
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							zIndex: 5, // Ensure loading text is on top
							color: "white",
						}}
					>
						Loading Locus...
					</div>
				)}
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
						zIndex: 2, // Grid below locus stroke and overlay
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
						zIndex: 3, // SVG stroke above grid
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
						stroke="rgba(150, 150, 150, 0.5)"
						strokeWidth="1"
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

			{/* Legend (outside the grid or positioned absolutely/relatively as needed) */}
			<div
				className="diagram-legend"
				style={{
					position: "absolute",
					bottom: -30, // Example positioning below the grid
					left: axisLabelPadding, // Align with diagram area
				}}
			>
				<p>
					CIE 1931 chromaticity diagram showing input ({inputColorSpace}) and
					output ({outputColorSpace}) color spaces.
				</p>
			</div>
		</div>
	);
};

export default ChromaticityDiagram;
