import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  qualitativeRiskInputSchema,
  assessQualitativeRisk,
} from "@risk-calculator/shared";
import type { QualitativeRiskInput } from "@risk-calculator/shared";
import { api } from "../lib/api";
import { RiskBadge } from "../components/RiskBadge";
import { Heatmap } from "../components/Heatmap";

export function QualitativeRisk() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QualitativeRiskInput>({
    resolver: zodResolver(qualitativeRiskInputSchema),
    defaultValues: {
      assetName: "",
      threatDescription: "",
      likelihood: 3,
      impact: 3,
      controlEffectiveness: 0,
      detectionCapability: 0,
    },
  });

  // Observa solo los campos necesarios (evita proxy completo de watch())
  const assetName = watch("assetName");
  const threatDescription = watch("threatDescription");
  const likelihood = watch("likelihood");
  const impact = watch("impact");
  const controlEffectiveness = watch("controlEffectiveness");
  const detectionCapability = watch("detectionCapability");

  // Calcula el preview de forma derivada (sin setState ni useEffect)
  const preview = useMemo(() => {
    try {
      if (!likelihood || !impact) return null;
      return assessQualitativeRisk({
        assetName: assetName || "",
        threatDescription: threatDescription || "",
        likelihood,
        impact,
        controlEffectiveness,
        detectionCapability,
      });
    } catch {
      return null;
    }
  }, [
    assetName,
    threatDescription,
    likelihood,
    impact,
    controlEffectiveness,
    detectionCapability,
  ]);

  const createMutation = useMutation({
    mutationFn: api.createQualitativeRisk,
    onSuccess: () => {
      toast.success("Qualitative risk assessment saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["risks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to save risk assessment");
    },
  });

  const onSubmit = (data: QualitativeRiskInput) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Qualitative Risk Assessment
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Assess risk using likelihood and impact scales with optional control
          factors
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="card">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Risk Assessment Form
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Asset Name</label>
              <input
                type="text"
                className="input"
                {...register("assetName")}
                placeholder="e.g., Customer Database"
              />
              {errors.assetName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.assetName.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Threat Description</label>
              <textarea
                className="input"
                rows={3}
                {...register("threatDescription")}
                placeholder="Describe the potential threat or vulnerability"
              />
              {errors.threatDescription && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.threatDescription.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Likelihood (1-5)</label>
                <select
                  className="input"
                  {...register("likelihood", { valueAsNumber: true })}
                >
                  <option value={1}>1 - Very Low</option>
                  <option value={2}>2 - Low</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - High</option>
                  <option value={5}>5 - Very High</option>
                </select>
                {errors.likelihood && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.likelihood.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Impact (1-5)</label>
                <select
                  className="input"
                  {...register("impact", { valueAsNumber: true })}
                >
                  <option value={1}>1 - Very Low</option>
                  <option value={2}>2 - Low</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - High</option>
                  <option value={5}>5 - Very High</option>
                </select>
                {errors.impact && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.impact.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="mb-3 font-medium text-gray-900 text-md">
                Control Factors (Optional)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Control Effectiveness (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    className="input"
                    {...register("controlEffectiveness", {
                      valueAsNumber: true,
                    })}
                    placeholder="0.0"
                  />
                  {errors.controlEffectiveness && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.controlEffectiveness.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Detection Capability (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    className="input"
                    {...register("detectionCapability", {
                      valueAsNumber: true,
                    })}
                    placeholder="0.0"
                  />
                  {errors.detectionCapability && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.detectionCapability.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full btn btn-primary"
              >
                {createMutation.isPending
                  ? "Saving..."
                  : "Save Risk Assessment"}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          {preview && (
            <>
              <div className="card">
                <h2 className="mb-4 text-lg font-medium text-gray-900">
                  Risk Assessment Results
                </h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700">
                      Inherent Risk
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {preview.inherentSeverity}
                      </div>
                      <RiskBadge band={preview.inherentBand} />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Likelihood: {likelihood} × Impact: {impact}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700">
                      Residual Risk
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {preview.residualSeverity}
                      </div>
                      <RiskBadge band={preview.residualBand} />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Residual Likelihood:{" "}
                      {preview.residualLikelihood.toFixed(1)} × Residual Impact:{" "}
                      {preview.residualImpact.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <Heatmap
                  inherentPoint={{ likelihood, impact }}
                  residualPoint={{
                    likelihood: Math.round(preview.residualLikelihood),
                    impact: Math.round(preview.residualImpact),
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
