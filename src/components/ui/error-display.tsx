import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function ErrorDisplay({
  title = "Error",
  message,
  actionText,
  actionHref,
  onAction,
}: ErrorDisplayProps) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="font-medium text-destructive">{title}</h3>
          <p className="text-destructive/80">{message}</p>
          
          {(actionText && (actionHref || onAction)) && (
            <div className="pt-2">
              {actionHref ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={actionHref}>{actionText}</Link>
                </Button>
              ) : onAction ? (
                <Button variant="outline" size="sm" onClick={onAction}>
                  {actionText}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 