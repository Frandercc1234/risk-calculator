import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { api } from '../lib/api';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency } from '@risk-calculator/shared';

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  });

  const { data: recentRisks, isLoading: risksLoading } = useQuery({
    queryKey: ['risks', { page: 1, pageSize: 5 }],
    queryFn: () => api.getRisks({ page: 1, pageSize: 5 }),
  });

  if (statsLoading || risksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your risk assessments and latest entries
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Risks
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.total || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Qualitative
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.byType?.qualitative || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalculatorIcon className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Quantitative
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.byType?.quantitative || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Avg Inherent
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.avgInherent
                    ? formatCurrency(stats.avgInherent)
                    : '$0'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Bands */}
      {stats?.byBand && Object.keys(stats.byBand).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Risk Distribution
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(stats.byBand).map(([band, count]) => (
              <div key={band} className="text-center">
                <RiskBadge band={band as any} className="text-sm" />
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Risks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Risk Assessments
          </h3>
          <Link
            to="/risks"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View all →
          </Link>
        </div>

        {recentRisks?.data && recentRisks.data.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inherent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Residual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRisks.data.map((risk) => (
                  <tr key={risk.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {risk.type === 'qualitative'
                        ? (risk.input as any).assetName
                        : `Asset (${formatCurrency((risk.input as any).assetValue)})`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="capitalize">{risk.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {risk.type === 'qualitative' ? (
                        <RiskBadge band={(risk.output as any).inherentBand} />
                      ) : (
                        formatCurrency((risk.output as any).aleInherent)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {risk.type === 'qualitative' ? (
                        <RiskBadge band={(risk.output as any).residualBand} />
                      ) : (
                        formatCurrency((risk.output as any).aleResidual)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(risk.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No risks yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first risk assessment.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link to="/qualitative" className="btn btn-primary">
                Qualitative Risk
              </Link>
              <Link to="/quantitative" className="btn btn-secondary">
                Quantitative Risk
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

