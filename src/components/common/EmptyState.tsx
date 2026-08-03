import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="text-center py-5 px-3" role="status">
      <div
        className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-light mb-3 text-muted"
        aria-hidden="true"
      >
        {icon || <Inbox size={36} />}
      </div>
      <h3 className="fs-5 fw-bold text-dark mb-2">{title}</h3>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: '420px', fontSize: '0.9375rem' }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
