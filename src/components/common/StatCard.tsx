import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'primary' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'var(--primary-50)',
  iconColor = 'var(--primary-600)',
  badgeText,
  badgeVariant = 'success',
}) => {
  const getBadgeClass = () => {
    switch (badgeVariant) {
      case 'warning':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'danger':
        return 'bg-danger-subtle text-danger-emphasis border border-danger-subtle';
      case 'primary':
        return 'bg-primary-subtle text-primary-emphasis border border-primary-subtle';
      case 'success':
      default:
        return 'bg-success-subtle text-success-emphasis border border-success-subtle';
    }
  };

  return (
    <div className="stat-card" role="region" aria-label={`Indicador de ${title}`}>
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <span
            className="text-secondary text-uppercase fw-semibold"
            style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
          >
            {title}
          </span>
          <h2 className="display-heading my-1 fs-3 fw-bold" style={{ color: 'var(--neutral-900)' }}>
            {value}
          </h2>
          {subtitle && (
            <p className="text-muted mb-0 small" style={{ fontSize: '0.8125rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="stat-icon-wrapper"
          style={{ backgroundColor: iconBgColor, color: iconColor }}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
      {badgeText && (
        <div className="mt-3 pt-2 border-top border-light">
          <span className={`badge rounded-pill ${getBadgeClass()}`}>{badgeText}</span>
        </div>
      )}
    </div>
  );
};
