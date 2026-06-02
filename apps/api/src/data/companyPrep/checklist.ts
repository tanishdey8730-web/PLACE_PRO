import type { PrepChecklistItem } from "./types.js";

export function buildProductChecklist(company: string): PrepChecklistItem[] {
  return [
    { id: "dsa-arrays", label: "Arrays, strings & hashing patterns", category: "DSA" },
    { id: "dsa-trees", label: "Trees, graphs & BFS/DFS", category: "DSA" },
    { id: "dsa-dp", label: "Dynamic programming patterns", category: "DSA" },
    { id: "apt-quant", label: "Quantitative aptitude practice", category: "APTITUDE" },
    { id: "apt-logical", label: "Logical reasoning sets", category: "APTITUDE" },
    { id: "sd-fundamentals", label: "System design fundamentals", category: "SYSTEM_DESIGN" },
    { id: "sd-scalability", label: "Scalability & distributed systems", category: "SYSTEM_DESIGN" },
    { id: "hr-behavioral", label: "STAR behavioral stories", category: "HR" },
    { id: "hr-leadership", label: "Leadership & conflict questions", category: "HR" },
    { id: "core-os-db", label: "OS, DBMS & networking revision", category: "CORE" },
    { id: "mock-oa", label: "Online assessment mock", category: "GENERAL" },
    { id: "mock-interview", label: "Full mock interview", category: "GENERAL" },
    { id: `exp-research-${company.toLowerCase()}`, label: `Research ${company} interview experiences`, category: "GENERAL" },
  ];
}

export function buildServiceChecklist(company: string): PrepChecklistItem[] {
  return [
    { id: "apt-quant", label: "Quantitative aptitude (time & work, percentages)", category: "APTITUDE" },
    { id: "apt-logical", label: "Logical & verbal reasoning", category: "APTITUDE" },
    { id: "apt-di", label: "Data interpretation sets", category: "APTITUDE" },
    { id: "core-cs", label: "C/C++/Java fundamentals", category: "CORE" },
    { id: "core-db", label: "SQL & DBMS basics", category: "CORE" },
    { id: "dsa-basic", label: "Basic DSA (arrays, strings, sorting)", category: "DSA" },
    { id: "hr-intro", label: "Tell me about yourself & strengths", category: "HR" },
    { id: "hr-situational", label: "Situational & HR round prep", category: "HR" },
    { id: "gd-prep", label: "Group discussion topics practice", category: "GENERAL" },
    { id: "mock-aptitude", label: "Full aptitude mock test", category: "GENERAL" },
    { id: "resume-ats", label: "Resume ATS optimization", category: "GENERAL" },
    { id: `exp-research-${company.toLowerCase()}`, label: `Research ${company} placement pattern`, category: "GENERAL" },
  ];
}
