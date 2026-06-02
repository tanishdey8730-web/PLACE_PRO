import type { CoverLetterGenerateResult } from "@placepro/shared";

export const demoCoverLetterResult: CoverLetterGenerateResult = {
  id: "demo-cover-letter",
  companyName: "Google",
  jobTitle: "Software Engineer",
  template: "professional",
  documents: {
    coverLetter: {
      subject: "Application for Software Engineer — Alex Johnson",
      salutation: "Dear Hiring Manager,",
      body:
        "I am excited to apply for the Software Engineer position at Google. With experience building full-stack applications using Java, Python, and React, I have delivered features used by hundreds of users and improved API performance by 35%.\n\n" +
        "My resume outlines projects in distributed systems and data structures that align with Google's engineering bar. I would welcome the opportunity to contribute to your team and grow alongside world-class engineers.",
      closing: "Sincerely,",
      signature: "Alex Johnson",
    },
    internshipApplication: {
      subject: "Summer Internship Application — Software Engineer Intern",
      salutation: "Dear Google Recruiting Team,",
      body:
        "I am writing to apply for the Software Engineer Intern role at Google. I am pursuing B.Tech in Computer Science with strong foundations in algorithms, systems, and collaborative software development.\n\n" +
        "I have completed internships and projects involving scalable backends and would be thrilled to learn from Google's mentorship culture. I am available for the full internship period and flexible on location.",
      closing: "Best regards,",
      signature: "Alex Johnson",
    },
    referralRequest: {
      subject: "Referral request — Software Engineer at Google",
      salutation: "Hi,",
      body:
        "I hope you're doing well. I saw the Software Engineer opening at Google and noticed you're connected with the team. I would really appreciate any advice or referral if you feel my background is a fit.\n\n" +
        "I've attached my resume — highlights include full-stack development, DSA strength, and internship experience. Thank you for considering, and no pressure at all.",
      closing: "Thanks,",
      signature: "Alex Johnson",
    },
    hrFollowUp: {
      subject: "Following up on Software Engineer application",
      salutation: "Dear HR Team,",
      body:
        "Thank you for reviewing my application for the Software Engineer role at Google. I wanted to express my continued enthusiasm for the opportunity.\n\n" +
        "Please let me know if you need any additional materials. I look forward to the next steps in the process.",
      closing: "Sincerely,",
      signature: "Alex Johnson",
    },
  },
};
