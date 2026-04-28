import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByStudent = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scores")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

export const setScore = mutation({
  args: {
    studentId: v.id("students"),
    itemId: v.string(),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scores")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { score: args.score });
    } else {
      await ctx.db.insert("scores", {
        studentId: args.studentId,
        itemId: args.itemId,
        score: args.score,
      });
    }
  },
});

export const deleteScore = mutation({
  args: {
    studentId: v.id("students"),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scores")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
