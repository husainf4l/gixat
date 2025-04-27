import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Widd",
  description: "Sign Up Page",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
