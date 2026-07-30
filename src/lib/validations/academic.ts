import { z } from "zod";

export const classSchema = z.object({
  name: z.string().min(1, "Class name is required").max(80),
  gradeLevel: z.string().min(1).max(20),
  section: z.string().min(1).max(20),
});
export type ClassInput = z.infer<typeof classSchema>;

export const lessonPathwayConfigSchema = z.object({
  pathwayId: z.string().min(1, "Select a pathway"),
  title: z.string().min(1, "Pathway title is required").max(120),
  instructions: z.string().min(1, "Instructions are required"),
  requirements: z.string().max(2000).optional().or(z.literal("")),
  rubric: z.string().max(4000).optional().or(z.literal("")),
  points: z.coerce.number().int().min(1).max(1000).default(100),
  dueDateOverride: z.coerce.date().optional(),
  allowResubmission: z.boolean().default(false),
  required: z.boolean().default(true),
});
export type LessonPathwayConfigInput = z.infer<typeof lessonPathwayConfigSchema>;

export const lessonSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().min(1, "Description is required").max(2000),
  objectives: z.string().max(2000).optional().or(z.literal("")),
  subject: z.string().max(80).optional().or(z.literal("")),
  classIds: z.array(z.string().min(1)).min(1, "Select at least one class"),
  studentIds: z.array(z.string().min(1)).optional().default([]),
  availableAt: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  publishAt: z.coerce.date().optional(),
  closeAt: z.coerce.date().optional(),
  timezone: z.string().default("UTC"),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "CLOSED", "ARCHIVED"]).default("DRAFT"),
  pathways: z.array(lessonPathwayConfigSchema).min(1, "Add at least one pathway"),
});
export type LessonInput = z.infer<typeof lessonSchema>;

// Editing an existing lesson doesn't re-select classes/students or rebuild
// the pathway list wholesale — those have their own dedicated endpoints —
// so the edit form validates against a narrower subset of fields.
export const lessonUpdateSchema = lessonSchema
  .omit({ classIds: true, studentIds: true, pathways: true })
  .partial();
export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>;

export const submissionCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000),
});

export const gradeSchema = z.object({
  score: z.coerce.number().min(0),
  feedback: z.string().max(4000).optional().or(z.literal("")),
  feedbackFileUrl: z.string().url().optional().or(z.literal("")),
});

export const announcementSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(5000),
  classId: z.string().optional(),
  studentId: z.string().optional(),
  pinned: z.boolean().optional(),
  priority: z.enum(["NORMAL", "IMPORTANT", "URGENT"]).default("NORMAL"),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "EXPIRED"]).default("DRAFT"),
  scheduledAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  links: z.array(z.string().url()).optional().default([]),
});

export const lessonResourceSchema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileType: z.string().min(1),
  fileSizeBytes: z.number().int().positive(),
  description: z.string().max(500).optional().or(z.literal("")),
});

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "image/png",
  "image/jpeg",
  "video/mp4",
];

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB
