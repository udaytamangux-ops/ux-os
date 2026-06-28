import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Template-specific system prompts
const SYSTEM_PROMPTS: Record<string, string> = {
  web: `You are a world-class UX design writer specializing in web and digital product case studies.
Your case studies are honest, specific, and written in first person ("I", "we").
They include real design decisions, what changed, and why — not generic statements.
Never use buzzwords like "seamless", "intuitive", "user-centric", or "holistic".
Write 650–900 words. Use these exact h2 headings:
## Overview
## The Problem
## Research & Discovery
## Design Decisions
## What Changed (And Why)
## Outcome
## What I Learned`,

  mobile: `You are a world-class UX design writer specializing in mobile app case studies.
Your case studies focus on: user flows, gesture interactions, screen states, performance constraints, and cross-platform decisions.
Written in first person, honest, specific, no buzzwords. 650–900 words.
Use these exact h2 headings:
## Overview
## The Problem
## User Research
## Key Flows
## Design Decisions
## What Didn't Work
## Outcome
## Reflection`,

  branding: `You are a world-class design writer specializing in branding and identity case studies.
Focus on: visual research, typography decisions, color psychology, logo evolution, brand voice, and rollout.
Written in first person, honest, specific. 650–900 words.
Use these exact h2 headings:
## Overview
## The Brief
## Research & Direction
## Visual Identity
## Typography & Color
## Iterations
## Final System
## What I Learned`,
};

export async function POST(request: NextRequest) {
  // Verify auth
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });
  }

  // Instantiate lazily so a missing key degrades gracefully instead of
  // throwing at module load (which would break the build).
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("AI is not configured. Set ANTHROPIC_API_KEY.", { status: 503 });
  }
  const client = new Anthropic();

  const { project } = await request.json();
  const template = (project.caseStudyTemplate as string) ?? "web";
  const systemPrompt = SYSTEM_PROMPTS[template] ?? SYSTEM_PROMPTS.web;

  const userPrompt = `Write a case study for this UX project.

PROJECT DETAILS:
Name: ${project.name}
Client: ${project.client}
Category: ${project.category}
Template: ${template}

BRIEF:
Problem: ${project.brief.problem}
Goal: ${project.brief.goal}
Target Users: ${project.brief.targetUsers}
Constraints: ${project.brief.constraints}
Success Metrics: ${project.brief.successMetrics}
Business Context: ${project.brief.businessContext}

DESIGNER'S NOTES (most important — write from these):
${project.handoffNotes}

Write the case study now.`;

  // Stream the response
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  // Return as a readable stream
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
      } catch (err) {
        console.error("Case study stream error:", err);
        controller.error(err);
        return;
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
