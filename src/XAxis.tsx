import type React from "react";

interface XAxisProps {
	scale: number; // xScale
	plotSize: number;
	axisLabelPadding: number;
	axisLabelColor: string;
}

export const XAxis: React.FC<XAxisProps> = ({
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
		const xPosPixels = (value / scale) * plotSize;
		const positionStyle: React.CSSProperties = {
			position: "absolute",
			left: xPosPixels, // Use calculated pixel value
			top: 2, // Small padding from the top edge of the container
			fontSize: "10px",
			color: axisLabelColor,
			whiteSpace: "nowrap",
		};

		labels.push(
			<span key={`x-${value.toFixed(1)}`} style={positionStyle}>
				{value.toFixed(1)}
			</span>,
		);
	}

	return (
		<div
			className="x-axis-labels"
			style={{
				gridColumn: 2,
				gridRow: 2,
				position: "relative",
				width: plotSize, // Match plot width
				height: axisLabelPadding,
				// borderTop: '1px solid rgba(255, 255, 255, 0.2)', // Optional axis line
			}}
		>
			{labels}
		</div>
	);
};
