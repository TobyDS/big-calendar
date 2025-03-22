import React, { cloneElement, Children, forwardRef, useMemo } from "react";
import type { ElementRef, HTMLAttributes, ReactElement, ReactNode } from "react";

import { cn } from "@/utils/helpers/cn.helper";

// ================================== //

type TAvatarGroupRef = ElementRef<"div">;
type TAvatarGroupProps = HTMLAttributes<HTMLDivElement> & { max?: number; spacing?: number };

// Helper to type check child elements
const isValidAvatarElement = (child: ReactNode): child is ReactElement<{
  className?: string;
  style?: React.CSSProperties;
}> => {
  return React.isValidElement(child) && typeof child.props === 'object';
};

const AvatarGroup = forwardRef<TAvatarGroupRef, TAvatarGroupProps>(({ className, children, max = 1, spacing = 10, ...props }, ref) => {
  const avatarItems = Children.toArray(children).filter(isValidAvatarElement);

  const renderContent = useMemo(() => {
    return (
      <>
        {avatarItems.slice(0, max).map((child, index) => {
          return cloneElement(child, {
            className: cn(child.props.className || "", "border-2 border-bg-primary"),
            style: { marginLeft: index === 0 ? 0 : -spacing, ...(child.props.style || {}) },
          });
        })}

        {avatarItems.length > max && avatarItems[0] && (
          <div
            className={cn("relative flex items-center justify-center rounded-full border-2 border-bg-primary bg-bg-tertiary", avatarItems[0].props.className || "")}
            style={{ marginLeft: -spacing }}
          >
            <p>+{avatarItems.length - max}</p>
          </div>
        )}
      </>
    );
  }, [avatarItems, max, spacing]);

  return (
    <div ref={ref} className={cn("relative flex", className)} {...props}>
      {renderContent}
    </div>
  );
});

AvatarGroup.displayName = "AvatarGroup";

// ================================== //

export { AvatarGroup };
