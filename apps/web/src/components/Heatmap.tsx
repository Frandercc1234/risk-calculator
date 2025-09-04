import React from "react";
import { getHeatmapCellColor } from "@risk-calculator/shared";

interface HeatmapProps {
  inherentPoint?: { likelihood: number; impact: number };
  residualPoint?: { likelihood: number; impact: number };
  className?: string;
}

export function Heatmap({
  inherentPoint,
  residualPoint,
  className = "",
}: HeatmapProps) {
  const renderCell = (likelihood: number, impact: number) => {
    const color = getHeatmapCellColor(likelihood, impact);
    const isInherent =
      inherentPoint?.likelihood === likelihood &&
      inherentPoint?.impact === impact;
    const isResidual =
      residualPoint?.likelihood === likelihood &&
      residualPoint?.impact === impact;

    let borderClass = "";
    if (isInherent && isResidual) {
      borderClass = "ring-4 ring-blue-500";
    } else if (isInherent) {
      borderClass = "ring-2 ring-blue-400";
    } else if (isResidual) {
      borderClass = "ring-2 ring-orange-400";
    }

    return (
      <div
        key={`${likelihood}-${impact}`}
        className={`w-12 h-12 border border-gray-300 ${borderClass} flex items-center justify-center text-xs font-medium text-white`}
        style={{ backgroundColor: color }}
        title={`Likelihood: ${likelihood}, Impact: ${impact}`}
      >
        {isInherent && isResidual
          ? "B"
          : isInherent
            ? "I"
            : isResidual
              ? "R"
              : ""}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-medium text-gray-900">Risk Heatmap</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {inherentPoint && (
            <div className="flex items-center">
              <div className="w-3 h-3 mr-2 bg-blue-400 rounded"></div>
              <span>Inherent</span>
            </div>
          )}
          {residualPoint && (
            <div className="flex items-center">
              <div className="w-3 h-3 mr-2 bg-orange-400 rounded"></div>
              <span>Residual</span>
            </div>
          )}
          {inherentPoint && residualPoint && (
            <div className="flex items-center">
              <div className="w-3 h-3 mr-2 bg-blue-500 rounded"></div>
              <span>Both</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1">
        {/* Header row */}
        <div></div>
        {[1, 2, 3, 4, 5].map((impact) => (
          <div
            key={impact}
            className="text-xs font-medium text-center text-gray-600"
          >
            {impact}
          </div>
        ))}

        {/* Data rows */}
        {[5, 4, 3, 2, 1].map((likelihood) => (
          <React.Fragment key={likelihood}>
            <div className="flex items-center justify-center text-xs font-medium text-center text-gray-600">
              {likelihood}
            </div>
            {[1, 2, 3, 4, 5].map((impact) => renderCell(likelihood, impact))}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Impact →</span>
          <span>Likelihood ↑</span>
        </div>
      </div>
    </div>
  );
}
