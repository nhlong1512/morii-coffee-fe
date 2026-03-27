import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface FormFieldProps {
  /**
   * Field label displayed above the input
   */
  label: string;
  /**
   * Field name (used for form state management)
   */
  name: string;
  /**
   * Input type
   */
  type?: "text" | "email" | "password" | "tel" | "number" | "date" | "textarea";
  /**
   * Current value of the field
   */
  value: string;
  /**
   * Error message to display (if any)
   */
  error?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  /**
   * Whether the field is in loading state
   */
  isLoading?: boolean;
  /**
   * Change handler
   */
  onChange: (value: string) => void;
  /**
   * Blur handler (for validation)
   */
  onBlur?: () => void;
  /**
   * Additional CSS classes for the wrapper
   */
  className?: string;
  /**
   * Additional CSS classes for the input
   */
  inputClassName?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  error,
  placeholder,
  required = false,
  disabled = false,
  isLoading = false,
  onChange,
  onBlur,
  className,
  inputClassName,
}: FormFieldProps) {
  const hasError = Boolean(error);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
        </Label>
      )}

      <div className="relative">
        {type === "textarea" ? (
          <Textarea
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled || isLoading}
            className={cn(
              "min-h-[100px] resize-y",
              hasError && "border-destructive focus-visible:ring-destructive",
              inputClassName
            )}
          />
        ) : (
          <Input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled || isLoading}
            className={cn(
              hasError && "border-destructive focus-visible:ring-destructive",
              inputClassName
            )}
          />
        )}

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <LoadingSpinner size="sm" variant="spinner" />
          </div>
        )}
      </div>

      {hasError && (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

FormField.displayName = "FormField";
