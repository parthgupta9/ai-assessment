export const QUESTION_EXTRACTION_PROMPT = `You are an expert exam processor. Extract all exam questions from the provided question paper images.

Rules:
1. Extract EVERY question in exact printed order.
2. Treat sub-parts with labels (e.g. "11 (a)", "11 (b)", "Q1.1", "Q1.2") as SEPARATE distinct question entries.
3. Preserve the exact original question label / number in the "number" field (e.g. "1", "2.", "11(a)", "Q3(b)").
4. Include full legible question text.
5. If total marks/points are explicitly stated, put them in "maxMarks" as a number.
6. Ignore non-question headers, general instructions, or institute logos.
7. Output valid JSON adhering strictly to the schema.`;

export function buildAnswerExtractionPrompt(questionNumbers: string[]): string {
  return `You are an AI assessment analyst. Map a student's handwritten answer sheet to the known exam questions listed below.

Known Question Labels:
${questionNumbers.map((num) => `- ${num}`).join("\n")}

Rules:
1. Locate every handwritten or typed answer block on the sheet.
2. Transcribe the handwriting as accurately as possible into "transcribedText".
3. Set "questionNumber" to match one of the Known Question Labels if the student explicitly or implicitly answered that question (even if answered out of order).
4. If an answer block cannot be matched to any known question, set "questionNumber" to null.
5. "regions": Box boundaries for where that answer is located. "pageIndex" is the 0-based page index. Coordinates "x", "y", "w", "h" MUST be normalized float numbers between 0.0 and 1.0 relative to page width and height (top-left is x=0, y=0).
6. Multi-page answers: If an answer spans multiple pages, provide multiple region objects in the "regions" array with their corresponding pageIndex values.
7. Do NOT generate hallucinated answers for un-answered questions.
8. Output valid JSON adhering strictly to the schema.`;
}

export function buildGradingPrompt(
  questions: { number: string; text: string; maxMarks?: number | null }[],
  answers: { questionNumber?: string | null; transcribedText: string }[]
): string {
  return `Grade the student's transcribed answers against the extracted exam questions.

Questions List:
${JSON.stringify(questions, null, 2)}

Student Answers:
${JSON.stringify(answers, null, 2)}

Rules:
1. Generate one grade item per question.
2. If no student answer matches a question, set "status" to "unanswered", "score" to 0, and "feedback" to "No answer found for this question."
3. For answered questions, set "status" to "correct", "incorrect", or "partial". Assign an appropriate score up to "maxScore".
4. Provide constructive, concise teacher feedback for each question explaining the evaluation.
5. Provide a high-level "overallFeedback" summary paragraph summarizing the student's performance.
6. Output valid JSON adhering strictly to the schema.`;
}
