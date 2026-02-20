import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    orgName: z
      .string()
      .min(2, "Organization name must be at least 2 characters"),
    orgDomain: z
      .string()
      .min(3, "Domain must be at least 3 characters")
      .regex(
        /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Enter a valid domain (e.g., iitd.ac.in)"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const CERTIFICATE_TYPES = [
  { value: "course_completion", label: "Course Completion" },
  { value: "degree_diploma",    label: "Degree / Diploma" },
  { value: "achievement_award", label: "Achievement / Award" },
  { value: "workshop_seminar",  label: "Workshop / Seminar" },
  { value: "internship",        label: "Internship" },
] as const;

export const issueCertificateSchema = z.object({
  recipientName: z
    .string()
    .min(2, "Recipient name must be at least 2 characters"),
  recipientEmail: z.string().email("Enter a valid email address"),
  courseName: z.string().min(2, "Course name must be at least 2 characters"),
  issueDate: z.string().min(1, "Issue date is required"),
  certificateType: z
    .enum([
      "course_completion",
      "degree_diploma",
      "achievement_award",
      "workshop_seminar",
      "internship",
    ])
    .default("course_completion"),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .default({}),
});

export const verifySchema = z.object({
  hash: z
    .string()
    .min(1, "Enter a certificate hash or ID")
    .refine(
      (val) => val.startsWith("0x") || val.length >= 6,
      "Enter a valid certificate hash (starts with 0x) or certificate ID"
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
