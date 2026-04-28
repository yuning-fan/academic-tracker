import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  students: defineTable({
    name: v.string(),
    target: v.number(), // default target for the student
    courseIds: v.array(v.id("courses")),
    courseTargets: v.array(
      v.object({
        courseId: v.id("courses"),
        target: v.number(),
      })
    ),
  }),

  courses: defineTable({
    name: v.string(),
    target: v.number(), // global default target for the course
    items: v.array(
      v.object({
        id: v.string(), // client-generated unique id for the item
        name: v.string(),
        weight: v.number(),
        maxScore: v.number(),
        ddl: v.string(),
        status: v.string(), // 'upcoming' | 'pending' | 'locked' | 'missing' | 'final'
        note: v.string(),
      })
    ),
  }),

  scores: defineTable({
    studentId: v.id("students"),
    itemId: v.string(), // refers to course item's id
    score: v.number(),
  }).index("by_student", ["studentId"]),
});
