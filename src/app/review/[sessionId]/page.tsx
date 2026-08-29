"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AssessmentAppLayout } from "@/components/layout/AssessmentAppLayout";
import { ExtractionProgressIndicator } from "@/components/common/ExtractionProgressIndicator";
import { AnswerMappingWorkspace } from "@/components/assessment-flow/AnswerMappingWorkspace";
import { AssessmentGradingOverview } from "@/components/assessment-flow/AssessmentGradingOverview";
import { ScoreOverrideModal } from "@/components/assessment/ScoreOverrideModal";
import {
  loadAssessmentSessionClientAsync,
  saveAssessmentSessionClient,
} from "@/services/storage/client-session";
import type {
  PublicAssessmentSessionDTO,
  QuestionEvaluationGrade,
} from "@/types/assessment-extraction";

export default function AssessmentReviewPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<PublicAssessmentSessionDTO | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      if (!sessionId) return;

      const cached = await loadAssessmentSessionClientAsync(sessionId);
      if (cached?.result) {
        if (!isCancelled) {
          setSession(cached);
          setLoadError(null);
        }
        return;
      }

      try {
        const res = await fetch(`/api/assessment-pipeline/${sessionId}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as PublicAssessmentSessionDTO & {
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || "Assessment session not found.");
        }
        if (!isCancelled) {
          saveAssessmentSessionClient(data);
          setSession(data);
          setLoadError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Session not found. Please upload again."
          );
        }
      }
    }

    void loadData();
    return () => {
      isCancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!session?.result?.questions.length) return;
    if (!selectedQuestionId) {
      setSelectedQuestionId(session.result.questions[0].id);
    }
  }, [session, selectedQuestionId]);

  const answeredQuestionIdsSet = useMemo(() => {
    const set = new Set<string>();
    for (const ans of session?.result?.answers ?? []) {
      if (ans.questionId) set.add(ans.questionId);
    }
    return set;
  }, [session]);

  const activeHighlights = useMemo(() => {
    if (!session?.result || !selectedQuestionId) return [];
    return session.result.answers
      .filter((ans) => ans.questionId === selectedQuestionId)
      .flatMap((ans) => ans.regions);
  }, [session, selectedQuestionId]);

  const selectedQuestion = session?.result?.questions.find(
    (q) => q.id === selectedQuestionId
  );
  const questionBadgeLabel = selectedQuestion
    ? `Q${selectedQuestion.number.replace(/\.$/, "")}`
    : "Q";

  async function handleRetryPipeline() {
    if (!sessionId) return;
    setLoadError(null);
    try {
      const res = await fetch(`/api/assessment-pipeline/${sessionId}/reprocess`, {
        method: "POST",
      });
      const data = (await res.json()) as PublicAssessmentSessionDTO & {
        error?: string;
      };
      if (!res.ok) {
        setLoadError(data.error || "Reprocessing failed.");
        return;
      }
      saveAssessmentSessionClient(data);
      setSession(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Retry failed.");
    }
  }

  function handleSaveGradeOverride(updatedGrade: QuestionEvaluationGrade) {
    if (!session || !session.result) return;
    const nextGrades = session.result.grades.map((g) =>
      g.questionId === updatedGrade.questionId ? updatedGrade : g
    );

    const updatedSession: PublicAssessmentSessionDTO = {
      ...session,
      result: {
        ...session.result,
        grades: nextGrades,
      },
    };

    setSession(updatedSession);
    saveAssessmentSessionClient(updatedSession);
  }

  if (loadError && !session) {
    return (
      <AssessmentAppLayout>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1eb] text-2xl text-[#ff5a1f] shadow-sm">
            📄
          </div>
          <h2 className="text-xl font-bold text-[#111]">Assessment Session Not Found</h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-[#6b7280]">
            This session may have expired or was opened on a different browser. Please upload the question paper and answer sheet on the upload portal.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2a2a2a] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#111] transition shadow-sm"
          >
            ← Go to Upload Portal
          </Link>
        </div>
      </AssessmentAppLayout>
    );
  }

  if (!session) {
    return (
      <AssessmentAppLayout collapsed>
        <ExtractionProgressIndicator
          phase="queued"
          message="Loading assessment session..."
        />
      </AssessmentAppLayout>
    );
  }

  const result = session.result;
  const isProcessing = session.status !== "done" && session.status !== "error";
  const answerSheetPages = session.answerSheetPages ?? [];

  if (isProcessing || session.status === "error") {
    return (
      <AssessmentAppLayout collapsed>
        <ExtractionProgressIndicator
          phase={session.status}
          message={session.message}
          error={session.error}
          onRetry={session.status === "error" ? () => void handleRetryPipeline() : undefined}
        />
      </AssessmentAppLayout>
    );
  }

  const editingQuestion = session.result?.questions.find(
    (q) => q.id === editingQuestionId
  );
  const editingGrade = session.result?.grades.find(
    (g) => g.questionId === editingQuestionId
  );

  return (
    <AssessmentAppLayout
      collapsed
      onOpenGradingSummary={() => setIsOverviewOpen(true)}
    >
      {result ? (
        <>
          <AnswerMappingWorkspace
            result={result}
            answerSheetPages={answerSheetPages}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={setSelectedQuestionId}
            answeredQuestionIdsSet={answeredQuestionIdsSet}
            activeHighlights={activeHighlights}
            questionBadgeLabel={questionBadgeLabel}
            onEditGrade={(qId) => setEditingQuestionId(qId)}
          />

          {/* Grading Summary Modal */}
          {isOverviewOpen ? (
            <AssessmentGradingOverview
              result={result}
              questionPaperName={session.questionPaperName}
              answerSheetName={session.answerSheetName}
              onClose={() => setIsOverviewOpen(false)}
            />
          ) : null}

          {/* Grade Override Modal */}
          {editingQuestion && editingGrade ? (
            <ScoreOverrideModal
              question={editingQuestion}
              grade={editingGrade}
              onSave={handleSaveGradeOverride}
              onClose={() => setEditingQuestionId(null)}
            />
          ) : null}
        </>
      ) : (
        <ExtractionProgressIndicator />
      )}
    </AssessmentAppLayout>
  );
}
