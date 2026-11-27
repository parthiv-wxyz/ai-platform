import {
  codingTaskInputSchema,
  type ClassifiedTask,
  type CodingTaskInput,
  type TaskType,
} from "@/lib/ai/tasks/types";

type Rule = {
  taskType: TaskType;
  name: string;
  patterns: readonly RegExp[];
};

const RULES: readonly Rule[] = [
  {
    taskType: "DEBUGGING",
    name: "error-or-failure-language",
    patterns: [/\b(error|bug|exception|stack trace|failing|failure|broken)\b/i],
  },
  {
    taskType: "CODE_REVIEW",
    name: "review-language",
    patterns: [/\b(review|audit|security review|maintainability)\b/i],
  },
  {
    taskType: "TEST_GENERATION",
    name: "test-language",
    patterns: [
      /\b(unit tests?|integration tests?|test cases|coverage|specs?)\b/i,
    ],
  },
  {
    taskType: "REFACTORING",
    name: "refactor-language",
    patterns: [/\b(refactor|restructure|extract|rename|clean up|cleanup)\b/i],
  },
  {
    taskType: "ARCHITECTURE_DESIGN",
    name: "architecture-language",
    patterns: [
      /\b(architecture|architect|system design|components?|data flow|implementation plan)\b/i,
    ],
  },
  {
    taskType: "CODEBASE_ANALYSIS",
    name: "repository-language",
    patterns: [
      /\b(repository|repo|codebase|dependency graph|project structure|where is)\b/i,
    ],
  },
  {
    taskType: "CODE_GENERATION",
    name: "implementation-language",
    patterns: [
      /\b(implement|create|build|write|generate (?:a|an|the)? ?(?:function|class|component|endpoint|implementation)|add a feature)\b/i,
    ],
  },
];

export function classifyCodingTask(
  rawTask: CodingTaskInput | unknown,
): ClassifiedTask {
  const task = codingTaskInputSchema.parse(rawTask);
  if (task.taskType !== undefined) {
    return {
      taskId: task.taskId,
      taskType: task.taskType,
      confidence: 1,
      reason: "Task type was explicitly selected by the user.",
      matchedRules: ["explicit-task-type"],
      needsClarification: false,
    };
  }

  const text = [
    task.input,
    task.sourceCode,
    task.errorLogs,
    task.repositoryContext,
  ]
    .filter((value): value is string => value !== undefined)
    .join("\n");
  const matches = RULES.map((rule) => ({
    ...rule,
    matched: rule.patterns.some((pattern) => pattern.test(text)),
  })).filter((rule) => rule.matched);

  if (matches.length !== 1) {
    return {
      taskId: task.taskId,
      taskType: "UNKNOWN",
      confidence: matches.length === 0 ? 0 : 0.4,
      reason:
        matches.length === 0
          ? "No coding task rule matched the request."
          : "Multiple coding task rules matched the request equally.",
      matchedRules: matches.map((match) => match.name),
      needsClarification: true,
    };
  }

  const match = matches[0];
  return {
    taskId: task.taskId,
    taskType: match.taskType,
    confidence: 0.8,
    reason: `Matched the ${match.name} rule.`,
    matchedRules: [match.name],
    needsClarification: false,
  };
}
