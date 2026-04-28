import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("students").collect();
  },
});

export const addStudent = mutation({
  args: {
    name: v.string(),
    target: v.number(),
    courseIds: v.array(v.id("courses")),
    courseTargets: v.array(
      v.object({
        courseId: v.id("courses"),
        target: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("students", {
      name: args.name,
      target: args.target,
      courseIds: args.courseIds,
      courseTargets: args.courseTargets,
    });
  },
});

export const updateStudent = mutation({
  args: {
    id: v.id("students"),
    name: v.string(),
    target: v.number(),
    courseIds: v.array(v.id("courses")),
    courseTargets: v.array(
      v.object({
        courseId: v.id("courses"),
        target: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const deleteStudent = mutation({
  args: { id: v.id("students") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    // also delete all scores associated with this student
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_student", (q) => q.eq("studentId", args.id))
      .collect();
    for (const score of scores) {
      await ctx.db.delete(score._id);
    }
  },
});
