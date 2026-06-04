import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Interview data for each seeded problem (by slug)
const interviewData: Record<
  string,
  { company: string; role: string; round: string; frequency: number; year: number; source: string }[]
> = {
  "two-sum": [
    { company: "Google", role: "SWE Intern", round: "Phone Screen", frequency: 5, year: 2024, source: "LeetCode Discuss" },
    { company: "Amazon", role: "SDE I", round: "OA", frequency: 5, year: 2025, source: "Blind" },
    { company: "Meta", role: "SWE Intern", round: "Phone Screen", frequency: 4, year: 2024, source: "LeetCode Discuss" },
    { company: "Apple", role: "SWE II", round: "Onsite", frequency: 3, year: 2024, source: "Glassdoor" },
    { company: "Microsoft", role: "SDE I", round: "OA", frequency: 4, year: 2025, source: "LeetCode Discuss" },
    { company: "Bloomberg", role: "SWE Intern", round: "Phone Screen", frequency: 3, year: 2024, source: "Blind" },
    { company: "Uber", role: "SDE I", round: "Phone Screen", frequency: 2, year: 2023, source: "Glassdoor" },
    { company: "Goldman Sachs", role: "SWE Intern", round: "OA", frequency: 3, year: 2025, source: "LeetCode Discuss" },
  ],
  "valid-parentheses": [
    { company: "Amazon", role: "SDE I", round: "OA", frequency: 5, year: 2025, source: "LeetCode Discuss" },
    { company: "Google", role: "SWE II", round: "Phone Screen", frequency: 4, year: 2024, source: "Blind" },
    { company: "Meta", role: "SWE Intern", round: "Phone Screen", frequency: 3, year: 2024, source: "LeetCode Discuss" },
    { company: "Microsoft", role: "SDE I", round: "OA", frequency: 4, year: 2025, source: "Glassdoor" },
    { company: "Bloomberg", role: "SWE II", round: "Onsite", frequency: 4, year: 2024, source: "Blind" },
    { company: "Stripe", role: "SWE II", round: "Phone Screen", frequency: 2, year: 2023, source: "Glassdoor" },
  ],
  "longest-substring-without-repeating-characters": [
    { company: "Amazon", role: "SDE II", round: "Onsite", frequency: 5, year: 2025, source: "Blind" },
    { company: "Google", role: "SWE III", round: "Onsite", frequency: 4, year: 2024, source: "LeetCode Discuss" },
    { company: "Meta", role: "SWE II", round: "Onsite", frequency: 4, year: 2024, source: "Blind" },
    { company: "Microsoft", role: "SDE II", round: "Onsite", frequency: 3, year: 2024, source: "Glassdoor" },
    { company: "Netflix", role: "Senior SWE", round: "Onsite", frequency: 2, year: 2023, source: "Blind" },
    { company: "Spotify", role: "SWE II", round: "Phone Screen", frequency: 2, year: 2024, source: "Glassdoor" },
    { company: "Adobe", role: "SDE I", round: "OA", frequency: 3, year: 2025, source: "LeetCode Discuss" },
  ],
  "three-sum": [
    { company: "Google", role: "SWE III", round: "Onsite", frequency: 5, year: 2024, source: "LeetCode Discuss" },
    { company: "Meta", role: "SWE II", round: "Onsite", frequency: 5, year: 2025, source: "Blind" },
    { company: "Amazon", role: "SDE II", round: "Onsite", frequency: 4, year: 2024, source: "Blind" },
    { company: "Apple", role: "Senior SWE", round: "Onsite", frequency: 3, year: 2024, source: "Glassdoor" },
    { company: "Uber", role: "SDE II", round: "Onsite", frequency: 3, year: 2023, source: "Glassdoor" },
    { company: "Coinbase", role: "SWE II", round: "Phone Screen", frequency: 2, year: 2024, source: "LeetCode Discuss" },
  ],
  "merge-k-sorted-lists": [
    { company: "Google", role: "Senior SWE", round: "Onsite", frequency: 4, year: 2024, source: "LeetCode Discuss" },
    { company: "Meta", role: "SWE III", round: "Onsite", frequency: 3, year: 2024, source: "Blind" },
    { company: "Amazon", role: "SDE III", round: "Onsite", frequency: 4, year: 2025, source: "Blind" },
    { company: "Microsoft", role: "Senior SDE", round: "Onsite", frequency: 3, year: 2024, source: "Glassdoor" },
    { company: "LinkedIn", role: "Senior SWE", round: "Onsite", frequency: 3, year: 2023, source: "LeetCode Discuss" },
    { company: "Oracle", role: "SDE II", round: "Onsite", frequency: 2, year: 2024, source: "Glassdoor" },
  ],
};

// Problem tags by slug
const problemTags: Record<string, string[]> = {
  "two-sum": ["hash-map", "array"],
  "valid-parentheses": ["stack", "string"],
  "longest-substring-without-repeating-characters": ["sliding-window", "hash-map", "string"],
  "three-sum": ["two-pointers", "sorting", "array"],
  "merge-k-sorted-lists": ["divide-and-conquer", "heap", "merge-sort"],
};

async function seedInterviews() {
  console.log("🌱 Seeding interview data + problem tags...\n");

  // Clear existing interview data
  await prisma.problemInterview.deleteMany();
  console.log("  ✓ Cleared existing interview data");

  for (const [slug, interviews] of Object.entries(interviewData)) {
    const problem = await prisma.problem.findUnique({ where: { slug } });
    if (!problem) {
      console.log(`  ⚠ Problem '${slug}' not found, skipping`);
      continue;
    }

    // Seed interviews
    await prisma.problemInterview.createMany({
      data: interviews.map((i) => ({
        problemId: problem.id,
        ...i,
      })),
    });

    // Update tags
    const tags = problemTags[slug] || [];
    await prisma.problem.update({
      where: { id: problem.id },
      data: { tags },
    });

    console.log(
      `  ✓ ${problem.title}: ${interviews.length} interview sightings, tags: [${tags.join(", ")}]`
    );
  }

  console.log(`\n✅ Seeded interview data for ${Object.keys(interviewData).length} problems!`);
}

seedInterviews()
  .catch((e) => {
    console.error("❌ Interview seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
