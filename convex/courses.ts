import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const addCourse = mutation({
  args: {
    name: v.string(),
    target: v.number(),
    items: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        weight: v.number(),
        maxScore: v.number(),
        ddl: v.string(),
        status: v.string(),
        note: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courses", {
      name: args.name,
      target: args.target,
      items: args.items,
    });
  },
});

export const updateCourse = mutation({
  args: {
    id: v.id("courses"),
    name: v.string(),
    target: v.number(),
    items: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        weight: v.number(),
        maxScore: v.number(),
        ddl: v.string(),
        status: v.string(),
        note: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const deleteCourse = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    // Note: in a real application you'd also want to clean up courseIds from students
    // and scores referencing items in this course. For simplicity, we just delete the course.
    const course = await ctx.db.get(args.id);
    if (!course) return;
    
    await ctx.db.delete(args.id);

    // Remove courseId from students
    const students = await ctx.db.query("students").collect();
    for (const student of students) {
      let changed = false;
      let newCourseIds = student.courseIds;
      if (student.courseIds.includes(args.id)) {
        newCourseIds = student.courseIds.filter(id => id !== args.id);
        changed = true;
      }
      let newCourseTargets = student.courseTargets;
      if (student.courseTargets.some(t => t.courseId === args.id)) {
        newCourseTargets = student.courseTargets.filter(t => t.courseId !== args.id);
        changed = true;
      }
      if (changed) {
        await ctx.db.patch(student._id, {
          courseIds: newCourseIds,
          courseTargets: newCourseTargets
        });
      }
    }
  },
});
