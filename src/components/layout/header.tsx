import { ToggleTheme } from "@/components/layout/change-theme";

export function Header() {
  return (
    <header className="mx-auto flex h-[88px] w-full max-w-screen-2xl items-center justify-center">
      <div className="my-3 flex h-14 w-full items-center justify-end px-8">
        <div className="hidden items-center gap-4 md:flex">
          <ToggleTheme />
        </div>
      </div>
    </header>
  );
}
