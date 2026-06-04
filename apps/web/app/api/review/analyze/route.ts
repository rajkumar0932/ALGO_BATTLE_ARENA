import { NextResponse } from "next/server";
import { callGroq } from "@/lib/groq";

export async function POST(request: Request) {
  try {
    const { code, problemDescription, problemTitle, starterCode, verdict, passedCases, totalCases } =
      await request.json();

    if (!code || !problemDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = `You are an expert competitive programmer and technical interviewer.
Analyze the submitted solution for correctness, time complexity, space complexity,
code quality, and interview-readiness. Be specific and actionable.

The solution was submitted for the problem "${problemTitle}".
Verdict: ${verdict} (${passedCases}/${totalCases} test cases passed).

Return JSON only, no markdown, no code fences. The response must be a valid JSON object with exactly these keys:
{
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "optimalTimeComplexity": "O(...)",
  "isOptimal": true/false,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "interviewTip": "One actionable tip for how to present this in an interview",
  "alternativeApproach": "Brief description of a better or alternative approach",
  "interviewScore": 7
}

The interviewScore should be 1-10 where:
1-3: Would not pass an interview round
4-6: Might pass with follow-up discussion
7-8: Solid interview performance
9-10: Exceptional, optimal solution with clean code`;

    const userPrompt = `Problem:
${problemDescription}

Starter code signature:
${starterCode}

Submitted solution:
${code}`;

    const response = await callGroq(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.3, maxTokens: 1500, jsonMode: true }
    );

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch {
      // If Groq doesn't return valid JSON, create a fallback
      analysis = {
        timeComplexity: "Unknown",
        spaceComplexity: "Unknown",
        optimalTimeComplexity: "Unknown",
        isOptimal: false,
        strengths: ["Code was submitted successfully"],
        improvements: ["Could not analyze - please try again"],
        interviewTip: "Always explain your approach before coding",
        alternativeApproach: "Consider reviewing the problem constraints",
        interviewScore: 5,
      };
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Review analyze error:", error);

    // Return a graceful fallback if Groq is not configured
    if (error.message?.includes("GROQ_API_KEY")) {
      return NextResponse.json({
        timeComplexity: "N/A",
        spaceComplexity: "N/A",
        optimalTimeComplexity: "N/A",
        isOptimal: false,
        strengths: ["Solution was submitted"],
        improvements: ["Configure GROQ_API_KEY for AI-powered review"],
        interviewTip: "Set up your Groq API key to get personalized interview tips",
        alternativeApproach: "AI review requires a valid Groq API key",
        interviewScore: 0,
      }, { status: 200 });
    }

    return NextResponse.json({ error: "Failed to analyze solution" }, { status: 500 });
  }
}
