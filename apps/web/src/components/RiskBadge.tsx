import { RiskBand } from '@risk-calculator/shared';

interface RiskBadgeProps {
  band: RiskBand;
  className?: string;
}

export function RiskBadge({ band, className = '' }: RiskBadgeProps) {
  const getBadgeClasses = (band: RiskBand) => {
    switch (band) {
      case 'Low':
        return 'risk-badge risk-badge-low';
      case 'Moderate':
        return 'risk-badge risk-badge-moderate';
      case 'High':
        return 'risk-badge risk-badge-high';
      case 'Extreme':
        return 'risk-badge risk-badge-extreme';
      default:
        return 'risk-badge risk-badge-low';
    }
  };

  return (
    <span className={`${getBadgeClasses(band)} ${className}`}>{band}</span>
  );
}

