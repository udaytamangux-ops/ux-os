import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rowToProject } from "@/lib/supabase/db";
import { PHASES } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getProject(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("portfolio_slug", slug)
    .eq("is_portfolio_public", true)
    .single();
  if (error || !data) return null;
  return rowToProject(data);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Case Study" };
  return {
    title: `${project.name} — UX Case Study`,
    description: `${project.category} case study for ${project.client}.`,
  };
}

interface Section {
  heading: string;
  body: string[];
}

function parseCaseStudy(text: string): Section[] {
  if (!text.trim()) return [];
  const parts = text.split(/\n##\s+/);
  const sections: Section[] = [];
  parts.forEach((part, i) => {
    const lines = part.split("\n").filter((l) => l.trim());
    if (!lines.length) return;
    if (i === 0 && !/^##\s/.test(text)) {
      // Intro text before the first heading
      sections.push({ heading: "", body: lines.filter((l) => !l.startsWith("#")) });
    } else {
      sections.push({ heading: lines[0].replace(/^#+\s*/, ""), body: lines.slice(1) });
    }
  });
  return sections.filter((s) => s.heading || s.body.length);
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const sections = parseCaseStudy(project.caseStudy ?? "");

  return (
    <div style={{ background: "#F8F8FC", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ background: "white", borderBottom: "1px solid #EBEBF0", padding: "16px 0" }}>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontFamily: "var(--font-display, sans-serif)", fontWeight: 600, fontSize: 14, color: "#333" }}>
            UX Case Study
          </div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>{new Date(project.createdAt).getFullYear()}</div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 0" }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "monospace",
            color: "#6B7280",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          {project.category || "Case Study"}
        </div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#111",
            lineHeight: 1.2,
            marginBottom: 12,
            fontFamily: "Georgia, serif",
            textWrap: "balance",
          }}
        >
          {project.name}
        </h1>
        <p style={{ fontSize: 16, color: "#666", marginBottom: 32 }}>Client: {project.client}</p>

        {/* Phase completion strip */}
        <div style={{ display: "flex", gap: 4, marginBottom: 48 }}>
          {PHASES.map((ph) => {
            const done = project.completedPhases.includes(ph.id);
            return (
              <div key={ph.id} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ height: 3, borderRadius: 3, background: done ? "#244D7A" : "#E8E8F0" }} />
                <div style={{ fontSize: 9, color: "#6B7280", fontFamily: "monospace" }}>{ph.short}</div>
              </div>
            );
          })}
        </div>

        {/* Case Study Content */}
        <div style={{ paddingBottom: 80 }}>
          {sections.length === 0 && (
            <p style={{ fontSize: 15, color: "#6B7280" }}>This case study has not been written yet.</p>
          )}
          {sections.map((section, i) => (
            <div key={i} style={{ marginBottom: 40 }}>
              {section.heading && (
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: 14,
                    fontFamily: "Georgia, serif",
                    textWrap: "balance",
                  }}
                >
                  {section.heading}
                </h2>
              )}
              {section.body.map((para, j) => (
                <p key={j} style={{ fontSize: 16, lineHeight: 1.75, color: "#333", marginBottom: 16, textWrap: "pretty" }}>
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "white", borderTop: "1px solid #EBEBF0", padding: "24px 0" }}>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "0 24px",
            fontSize: 12,
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          Built with UX OS
        </div>
      </footer>
    </div>
  );
}
