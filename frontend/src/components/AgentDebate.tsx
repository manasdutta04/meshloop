"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Search, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

interface AgentReason {
  agent: string;
  icon: string;
  stance: "primary" | "challenge" | "resolved";
  message: string;
}

interface FinalVerdict {
  root_cause: string;
  confidence: number;
  first_action: string;
}

interface AgentDebateData {
  debate: AgentReason[];
  final_verdict: FinalVerdict;
}

interface AgentDebateProps {
  debate?: AgentDebateData | null;
}

const stanceMap: Record<AgentReason["stance"], { border: string; bg: string; icon: typeof Search }> = {
  primary: { border: "border-blue-500", bg: "bg-blue-500/10", icon: Search },
  challenge: { border: "border-amber-500", bg: "bg-amber-500/10", icon: AlertTriangle },
  resolved: { border: "border-emerald-500", bg: "bg-emerald-500/10", icon: ShieldCheck },
};

const verdictColorClass = (confidence: number) => {
  if (confidence >= 80) return "bg-emerald-500";
  if (confidence >= 60) return "bg-amber-500";
  return "bg-rose-500";
};

export function AgentDebate({ debate }: AgentDebateProps) {
  const [open, setOpen] = useState(false);
  const [animatedConfidence, setAnimatedConfidence] = useState(0);

  useEffect(() => {
    if (!open) {
      setAnimatedConfidence(0);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAnimatedConfidence(debate?.final_verdict.confidence ?? 0);
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [open, debate?.final_verdict.confidence]);

  if (!debate?.debate?.length) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-zinc-950/70 p-5 backdrop-blur-xl transition-all duration-300">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Agent Reasoning</h3>
            <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-950 animate-pulse">
              LIVE
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-400">Review the agent debate thread and final recommendation from the discovery workflow.</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-200 transition hover:border-white/20 hover:text-white"
        >
          {open ? "Hide agent reasoning" : "Show agent reasoning"}
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <div className={`overflow-hidden ${open ? "mt-6" : "mt-0"}`}>
        <div className={`grid gap-4 ${open ? "" : "pointer-events-none h-0 opacity-0"}`}>
          {debate.debate.map((item, index) => {
            const stance = stanceMap[item.stance];
            const CardIcon = stance.icon;
            return (
              <article
                key={`${item.agent}-${index}`}
                style={{ transitionDelay: `${open ? index * 150 : 0}ms` }}
                className={`rounded-3xl border border-white/10 border-l-4 ${stance.border} bg-zinc-900/60 p-4 transition-all duration-500 ${
                  open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${stance.bg} ${stance.border} flex h-9 w-9 items-center justify-center rounded-2xl border`}>
                    <CardIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{item.agent}</p>
                    <p className="text-sm font-semibold text-white">{item.stance}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{item.message}</p>
              </article>
            );
          })}

          <div className="rounded-3xl border-t border-white/10 pt-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Final Verdict</p>
            <p className="mt-3 text-[0.95rem] font-semibold text-white leading-6">{debate.final_verdict.root_cause}</p>

            <div className="mt-5 flex items-end justify-between gap-4">
              <span className="text-3xl font-extrabold text-white">{debate.final_verdict.confidence}%</span>
              <div className="w-full max-w-xs text-right text-xs uppercase tracking-[0.22em] text-zinc-500">Confidence</div>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-900/80 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-600 ease-out ${verdictColorClass(debate.final_verdict.confidence)}`}
                style={{ width: `${animatedConfidence}%` }}
              />
            </div>

            <p className="mt-4 text-sm text-zinc-400">→ Recommended action: <span className="text-zinc-200">{debate.final_verdict.first_action}</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}
