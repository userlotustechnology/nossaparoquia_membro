import { classNames } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, padding = false }: CardProps) {
  return (
    <div
      className={classNames(
        'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm',
        padding && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div
      className={classNames(
        'flex items-center justify-between border-b border-gray-200 px-6 py-4',
        className,
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={classNames('px-6 py-4', className)}>{children}</div>
  );
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={classNames(
        'border-t border-gray-200 bg-gray-50 px-6 py-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Card;
