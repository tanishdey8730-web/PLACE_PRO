import { prisma } from "@placepro/database";

export async function gatherNetworkingContext(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      college: true,
      graduationYear: true,
      skills: true,
      linkedinUrl: true,
      bio: true,
    },
  });

  const mentors = await prisma.mentorProfile.findMany({
    where: { isVerified: true },
    take: 5,
    orderBy: { rating: "desc" },
    include: {
      user: { select: { id: true, name: true, college: true } },
    },
  });

  const recruiters = await prisma.recruiterProfile.findMany({
    take: 5,
    include: {
      user: { select: { id: true, name: true } },
      company: { select: { name: true } },
    },
  });

  const alumni = user?.college
    ? await prisma.user.findMany({
        where: {
          college: user.college,
          id: { not: userId },
          role: "STUDENT",
        },
        take: 5,
        select: { id: true, name: true, college: true, skills: true, linkedinUrl: true },
      })
    : [];

  const platformHints = [
    ...mentors.map((m) => ({
      type: "MENTOR",
      name: m.user.name,
      title: "Mentor",
      company: "PlacePro",
      college: m.user.college,
      expertise: m.expertise,
      platform_user_id: m.user.id,
    })),
    ...recruiters.map((r) => ({
      type: "RECRUITER",
      name: r.user.name,
      title: r.jobTitle ?? "Recruiter",
      company: r.company?.name,
      platform_user_id: r.user.id,
    })),
    ...alumni.map((a) => ({
      type: "ALUMNI",
      name: a.name,
      title: "Alumni",
      college: a.college,
      platform_user_id: a.id,
    })),
  ];

  return {
    user,
    platformHints,
    platformMentors: mentors.map((m) => ({
      userId: m.user.id,
      name: m.user.name,
      expertise: m.expertise,
      rating: m.rating,
      bio: m.bio,
    })),
  };
}
