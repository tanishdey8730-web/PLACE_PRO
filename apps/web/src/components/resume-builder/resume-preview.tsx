"use client";

import type { ResumeContent, ResumeBuilderTemplateId } from "@placepro/shared";
import { cn } from "@/lib/utils";

export function ResumePreview({
  content,
  template,
  className,
}: {
  content: ResumeContent;
  template: ResumeBuilderTemplateId;
  className?: string;
}) {
  const { personal } = content;

  if (template === "modern") {
    return (
      <div className={cn("flex min-h-[600px] text-sm bg-white text-gray-900 rounded-lg overflow-hidden shadow-inner", className)}>
        <aside className="w-1/3 bg-slate-800 text-white p-5 space-y-4">
          <h1 className="text-lg font-bold leading-tight">{personal.fullName || "Your Name"}</h1>
          <p className="text-xs text-slate-300">{personal.email}</p>
          <p className="text-xs text-slate-300">{personal.phone}</p>
          <p className="text-xs text-slate-300">{personal.location}</p>
          {content.skills.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-blue-300 mb-2">Skills</h2>
              <ul className="text-xs space-y-1">
                {content.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
        <main className="flex-1 p-5 space-y-4">
          <ResumeSections content={content} accent="border-blue-500" />
        </main>
      </div>
    );
  }

  if (template === "professional") {
    return (
      <div className={cn("min-h-[600px] bg-white text-gray-900 p-6 rounded-lg shadow-inner font-serif", className)}>
        <header className="text-center border-b-2 border-gray-800 pb-4 mb-4">
          <h1 className="text-2xl font-bold tracking-wide">{personal.fullName || "Your Name"}</h1>
          <p className="text-sm mt-1 text-gray-600">
            {[personal.email, personal.phone, personal.location].filter(Boolean).join(" · ")}
          </p>
        </header>
        <ResumeSections content={content} accent="border-gray-800" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-[600px] bg-white text-gray-900 p-6 rounded-lg shadow-inner text-sm", className)}>
      <header className="mb-4">
        <h1 className="text-xl font-bold">{personal.fullName || "Your Name"}</h1>
        <p className="text-xs text-gray-600 mt-1">
          {[personal.email, personal.phone, personal.location, personal.github, personal.linkedin]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </header>
      <ResumeSections content={content} accent="border-gray-400" />
    </div>
  );
}

function ResumeSections({ content, accent }: { content: ResumeContent; accent: string }) {
  const { personal } = content;
  return (
    <div className="space-y-3 text-xs">
      {personal.summary && (
        <section>
          <h2 className={cn("font-bold uppercase text-[10px] tracking-wider border-b pb-0.5 mb-1", accent)}>
            Summary
          </h2>
          <p>{personal.summary}</p>
        </section>
      )}
      {templateSkills(content, accent)}
      {content.education.length > 0 && (
        <section>
          <h2 className={cn("font-bold uppercase text-[10px] tracking-wider border-b pb-0.5 mb-1", accent)}>
            Education
          </h2>
          {content.education.map((e) => (
            <p key={`${e.school}-${e.year}`} className="font-semibold">
              {e.school} — {e.degree} ({e.year}){e.gpa ? `, ${e.gpa}` : ""}
            </p>
          ))}
        </section>
      )}
      <BulletSection title="Experience" items={content.experience.map((e) => ({ head: `${e.role}, ${e.company}`, sub: `${e.start}–${e.end}`, bullets: e.bullets }))} accent={accent} />
      <BulletSection title="Internships" items={content.internships.map((i) => ({ head: `${i.role}, ${i.company}`, sub: `${i.start}–${i.end}`, bullets: i.bullets }))} accent={accent} />
      <BulletSection title="Projects" items={content.projects.map((p) => ({ head: p.name, sub: p.tech, bullets: p.bullets }))} accent={accent} />
      {content.achievements.length > 0 && (
        <section>
          <h2 className={cn("font-bold uppercase text-[10px] tracking-wider border-b pb-0.5 mb-1", accent)}>
            Achievements
          </h2>
          <ul className="list-disc pl-4 space-y-0.5">
            {content.achievements.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function templateSkills(content: ResumeContent, accent: string) {
  if (content.skills.length === 0) return null;
  return (
    <section>
      <h2 className={cn("font-bold uppercase text-[10px] tracking-wider border-b pb-0.5 mb-1", accent)}>
        Skills
      </h2>
      <p>{content.skills.join(" · ")}</p>
    </section>
  );
}

function BulletSection({
  title,
  items,
  accent,
}: {
  title: string;
  items: { head: string; sub?: string; bullets: string[] }[];
  accent: string;
}) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className={cn("font-bold uppercase text-[10px] tracking-wider border-b pb-0.5 mb-1", accent)}>
        {title}
      </h2>
      {items.map((item) => (
        <div key={item.head} className="mb-2">
          <p className="font-semibold">{item.head}</p>
          {item.sub && <p className="text-gray-500 italic">{item.sub}</p>}
          <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
            {item.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
