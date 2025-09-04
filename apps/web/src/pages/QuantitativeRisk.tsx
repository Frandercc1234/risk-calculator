import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  quantitativeRiskInputSchema,
  assessQuantitativeRisk,
  formatCurrency,
} from '@risk-calculator/shared';
import type { QuantitativeRiskInput } from '@risk-calculator/shared';
import { api } from '../lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function QuantitativeRisk() {
  const [preview, setPreview] = useState<any>(null);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [showSimulation, setShowSimulation] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuantitativeRiskInput>({
    resolver: zodResolver(quantitativeRiskInputSchema),
    defaultValues: {
      assetValue: 1000000,
      exposureFactor: 0.3,
      annualizedRateOfOccurrence: 2.0,
      controlCost: 0,
      controlEffectiveness: 0,
      detectionCapability: 0,
    },
  });

  const watchedValues = watch();

  const createMutation = useMutation({
    mutationFn: api.createQuantitativeRisk,
    onSuccess: () => {
      toast.success('Quantitative risk assessment saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save risk assessment');
    },
  });

  const simulationMutation = useMutation({
    mutationFn: api.runQuantitativeSimulation,
    onSuccess: (data) => {
      setSimulationData(data);
      setShowSimulation(true);
      toast.success('Simulation completed!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to run simulation');
    },
  });

  const onSubmit = (data: QuantitativeRiskInput) => {
    createMutation.mutate(data);
  };

  const runSimulation = () => {
    const input = {
      ...watchedValues,
      controlEffectivenessRange: [0, 1] as [number, number],
      detectionCapabilityRange: [0, 1] as [number, number],
      scenarios: 10,
    };
    simulationMutation.mutate(input);
  };

  // Update preview when form values change
  React.useEffect(() => {
    if (
      watchedValues.assetValue &&
      watchedValues.exposureFactor &&
      watchedValues.annualizedRateOfOccurrence !== undefined
    ) {
      try {
        const result = assessQuantitativeRisk(watchedValues);
        setPreview(result);
      } catch (error) {
        setPreview(null);
      }
    }
  }, [watchedValues]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Quantitative Risk Assessment
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Calculate financial risk using asset value, exposure factor, and
          annualized rate of occurrence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Risk Assessment Form
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Asset Value (AV)</label>
              <input
                type="number"
                step="1000"
                className="input"
                {...register('assetValue', { valueAsNumber: true })}
                placeholder="1000000"
              />
              {errors.assetValue && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.assetValue.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Exposure Factor (EF) - 0 to 1</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className="input"
                {...register('exposureFactor', { valueAsNumber: true })}
                placeholder="0.3"
              />
              {errors.exposureFactor && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.exposureFactor.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">
                Annualized Rate of Occurrence (ARO)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="input"
                {...register('annualizedRateOfOccurrence', {
                  valueAsNumber: true,
                })}
                placeholder="2.0"
              />
              {errors.annualizedRateOfOccurrence && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.annualizedRateOfOccurrence.message}
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">
                Control Factors (Optional)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="label">Control Cost (per year)</label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    className="input"
                    {...register('controlCost', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.controlCost && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.controlCost.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Control Effectiveness (0-1)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      className="input"
                      {...register('controlEffectiveness', {
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
                      {...register('detectionCapability', {
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
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn btn-primary w-full"
              >
                {createMutation.isPending
                  ? 'Saving...'
                  : 'Save Risk Assessment'}
              </button>

              <button
                type="button"
                onClick={runSimulation}
                disabled={simulationMutation.isPending}
                className="btn btn-secondary w-full"
              >
                {simulationMutation.isPending
                  ? 'Running Simulation...'
                  : 'Run Scenarios'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          {preview && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Risk Assessment Results
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Single Loss Expectancy (SLE)
                  </h3>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(preview.sle)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    AV × EF = {formatCurrency(watchedValues.assetValue)} ×{' '}
                    {watchedValues.exposureFactor}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Annualized Loss Expectancy (Inherent)
                  </h3>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(preview.aleInherent)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    SLE × ARO = {formatCurrency(preview.sle)} ×{' '}
                    {watchedValues.annualizedRateOfOccurrence}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Annualized Loss Expectancy (Residual)
                  </h3>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(preview.aleResidual)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ALE × (1 - CE) × (1 - DC×0.5)
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Net Risk (Residual)
                  </h3>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(preview.netRisk)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ALE (Residual) + Control Cost
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Simulation Chart */}
          {showSimulation && simulationData.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Control Effectiveness vs ALE (Residual)
              </h2>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="controlEffectiveness"
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        'ALE (Residual)',
                      ]}
                      labelFormatter={(value) =>
                        `Control Effectiveness: ${(value * 100).toFixed(1)}%`
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="aleResidual"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>
                  This chart shows how the residual ALE changes as control
                  effectiveness increases from 0% to 100%.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

