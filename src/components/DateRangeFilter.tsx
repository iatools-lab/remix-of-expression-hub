import { useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  placeholder = "Filtrer par date",
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const label =
    value?.from && value?.to
      ? `${format(value.from, "dd MMM", { locale: fr })} → ${format(value.to, "dd MMM yyyy", { locale: fr })}`
      : value?.from
      ? `Depuis ${format(value.from, "dd MMM yyyy", { locale: fr })}`
      : placeholder;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 justify-start text-left font-normal bg-card",
              !value?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5 mr-2" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      {value?.from && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(undefined)}
          aria-label="Effacer le filtre"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}

/** Helper: filter a list by a date range applied to a property accessor. */
export function inRange(iso: string, range?: DateRange): boolean {
  if (!range?.from) return true;
  const t = new Date(iso).getTime();
  if (t < range.from.getTime()) return false;
  if (range.to && t > range.to.getTime() + 24 * 3600 * 1000 - 1) return false;
  return true;
}
