import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: LucideIcon;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  icon: Icon,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-card border rounded-xl p-8 text-center">
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className="w-12 h-12 text-muted-foreground/50" />
        </div>
      )}
      
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      <p className="text-muted-foreground mb-6">{message}</p>
      
      {(actionText && (actionHref || onAction)) && (
        <div>
          {actionHref ? (
            <Button asChild className="rounded-full px-8 hover:scale-105 transition-all duration-200">
              <Link href={actionHref}>{actionText}</Link>
            </Button>
          ) : onAction ? (
            <Button 
              onClick={onAction}
              className="rounded-full px-8 hover:scale-105 transition-all duration-200"
            >
              {actionText}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
} 