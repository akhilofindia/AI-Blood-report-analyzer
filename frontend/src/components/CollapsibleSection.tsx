import React, { useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="medical-card animate-fade-in">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group"
        aria-expanded={isOpen}
      >
        <div className="section-title">
          <div className="p-2 rounded-lg bg-accent">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <span>{title}</span>
          <span className="text-xs text-muted-foreground font-normal ml-2">
            (Optional)
          </span>
        </div>
        <div
          className={`p-2 rounded-lg bg-secondary transition-all duration-200 ${
            isOpen ? "rotate-180" : ""
          } group-hover:bg-accent`}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-[500px] opacity-100 mt-5" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default CollapsibleSection;
