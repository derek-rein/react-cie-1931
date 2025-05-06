import type React from "react";

interface YAxisProps {
	scale: number; // yScale
	plotSize: number;
	axisLabelPadding: number;
	axisLabelColor: string;
}

export const YAxis: React.FC<YAxisProps> = ({
	scale,
	plotSize,
	axisLabelPadding,
	axisLabelColor,
}) => {
	const labels = [];
	const numSteps = Math.floor(scale / 0.1);

	for (let i = 1; i <= numSteps; i++) {
		const value = i * 0.1;
		// Position calculation in pixels
		const yPosPixels = ((scale - value) / scale) * plotSize;
		const positionStyle: React.CSSProperties = {
			position: "absolute",
			top: yPosPixels, // Use calculated pixel value
			right: 2, // Small padding from the right edge of the container
			fontSize: "10px",
			color: axisLabelColor,
			whiteSpace: "nowrap",
		};

		labels.push(
			<span key={`y-${value.toFixed(1)}`} style={positionStyle}>
				{value.toFixed(1)}
			</span>,
		);
	}

	return (
		<div
			className="y-axis-labels"
			style={{
				gridColumn: 1,
				gridRow: 1,
				position: "relative",
				height: plotSize, // Match plot height
				width: axisLabelPadding,
				// borderRight: '1px solid rgba(255, 255, 255, 0.2)', // Optional axis line
			}}
		>
			{labels}
		</div>
	);
};
