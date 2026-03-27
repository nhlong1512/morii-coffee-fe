import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Modal title
   */
  title: string;
  /**
   * Optional description below title
   */
  description?: string;
  /**
   * Modal content
   */
  children: React.ReactNode;
  /**
   * Optional footer content (typically action buttons)
   */
  footer?: React.ReactNode;
  /**
   * Modal size
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Whether clicking the overlay should close the modal
   */
  closeOnOverlayClick?: boolean;
  /**
   * Whether to show the close button
   */
  showCloseButton?: boolean;
  /**
   * Additional CSS classes for the content
   */
  className?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
}: ModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(sizeClasses[size], className)}
        onInteractOutside={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault();
          }
        }}
        hideCloseButton={!showCloseButton}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

Modal.displayName = "Modal";
