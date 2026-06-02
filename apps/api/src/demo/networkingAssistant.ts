import type { NetworkingAssistantResult } from "@placepro/shared";

export const demoNetworkingResult: NetworkingAssistantResult = {
  targetRole: "Software Engineer",
  targetCompanies: ["Google", "Microsoft", "Amazon"],
  summary:
    "Build a three-lane network: campus alumni for referrals, technical recruiters for pipeline visibility, and mentors for mock interviews. Send 5 personalized LinkedIn notes per week and track replies in PlacePro.",
  recruiters: [
    {
      id: "rec-1",
      type: "RECRUITER",
      name: "Priya Sharma",
      title: "Technical Recruiter",
      company: "Google",
      matchScore: 91,
      reason: "Leads university hiring for SWE intern and new grad roles in India",
      connectionTip: "Reference a specific Google careers post before connecting",
      linkedinUrl: "https://linkedin.com/in/example",
    },
    {
      id: "rec-2",
      type: "RECRUITER",
      name: "Michael Torres",
      title: "University Recruiting",
      company: "Microsoft",
      matchScore: 86,
      reason: "Active in campus hiring events for engineering",
      connectionTip: "Attend MSFT campus webinar and mention it in your note",
    },
  ],
  alumni: [
    {
      id: "alum-1",
      type: "ALUMNI",
      name: "Rahul Mehta",
      title: "Software Engineer",
      company: "Google",
      college: "IIT Delhi",
      matchScore: 93,
      reason: "Same college, placed within 18 months — strong referral potential",
      connectionTip: "Ask for process advice first, referral after rapport",
    },
    {
      id: "alum-2",
      type: "ALUMNI",
      name: "Sneha Patel",
      title: "SDE II",
      company: "Amazon",
      college: "IIT Delhi",
      matchScore: 88,
      reason: "Posts weekly about OA and interview prep",
      connectionTip: "Comment on her recent post before sending connection request",
    },
  ],
  mentors: [
    {
      id: "men-1",
      type: "MENTOR",
      name: "Vikram Singh",
      title: "Senior SWE Mentor",
      company: "PlacePro",
      matchScore: 90,
      reason: "Verified mentor for DSA + system design mock interviews",
      connectionTip: "Book a session via Mentors hub to refine your pitch",
      isPlatformUser: true,
    },
  ],
  recommendations: [
    {
      id: "nr-1",
      priority: "high",
      category: "LinkedIn",
      title: "Recruiter-optimized headline",
      description: "Use role + stack + achievement in 220 characters.",
      actionSteps: [
        "Update headline with target role keywords",
        "Add Featured section with best project",
        "Enable Open to Work for recruiters only",
      ],
    },
    {
      id: "nr-2",
      priority: "medium",
      category: "Referrals",
      title: "Warm intro via alumni",
      description: "One quality alumni chat beats 20 cold applications.",
      actionSteps: [
        "List 10 alumni at target companies",
        "Send 3 notes this week",
        "Track responses in placement tracker",
      ],
    },
  ],
  linkedInOutreach: [
    {
      id: "lo-1",
      targetType: "ALUMNI",
      targetName: "Rahul Mehta",
      targetTitle: "Software Engineer at Google",
      purpose: "cold_outreach",
      subjectLine: "IIT Delhi alumni — advice on Google SWE process",
      message:
        "Hi Rahul, I'm a final-year student from IIT Delhi targeting SWE roles at Google. I'd really appreciate 15 minutes of advice on what helped you most in OA and interviews. Happy to work around your schedule. Thank you!",
      tips: ["Keep connection note under 300 chars", "Do not attach resume on first touch"],
    },
    {
      id: "lo-2",
      targetType: "RECRUITER",
      targetName: "Priya Sharma",
      targetTitle: "Technical Recruiter at Google",
      purpose: "follow_up",
      message:
        "Hi Priya, I recently applied for SWE opportunities at Google. I have 300+ DSA problems solved and a distributed systems capstone. Would welcome any guidance on next steps in your pipeline.",
      tips: ["Apply before messaging", "Include one metric in the message"],
    },
  ],
  weeklyPlan: [
    "Mon: 3 alumni outreach messages",
    "Wed: Engage with recruiter content + skill endorsements",
    "Fri: 1 mentor mock + follow-ups",
    "Sun: Review reply rate and refine templates",
  ],
};
