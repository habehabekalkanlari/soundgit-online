import AuthGuard from "./AuthGuard";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
