import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const importLegacyData = mutation({
  args: {
    data: v.string(), // JSON string of the legacy db
    overwrite: v.boolean(), // whether to clear existing data
  },
  handler: async (ctx, args) => {
    const legacyDB = JSON.parse(args.data);
    
    if (args.overwrite) {
      // 1. Delete all existing data
      const scores = await ctx.db.query("scores").collect();
      for (const score of scores) await ctx.db.delete(score._id);
      
      const students = await ctx.db.query("students").collect();
      for (const student of students) await ctx.db.delete(student._id);
      
      const courses = await ctx.db.query("courses").collect();
      for (const course of courses) await ctx.db.delete(course._id);
    }

    // 2. Import Courses
    // Legacy mapping: old string ID -> new Convex ID
    const courseIdMap = new Map<string, any>();
    
    for (const c of legacyDB.courses || []) {
      let existingCourseId = null;
      if (!args.overwrite) {
        // Try to find if a course with the same name already exists
        const existing = await ctx.db
          .query("courses")
          .filter((q) => q.eq(q.field("name"), c.name))
          .first();
        if (existing) existingCourseId = existing._id;
      }

      if (existingCourseId) {
        courseIdMap.set(c.id, existingCourseId);
      } else {
        const newId = await ctx.db.insert("courses", {
          name: c.name,
          target: c.target || 80,
          items: c.items || [],
        });
        courseIdMap.set(c.id, newId);
      }
    }

    // 3. Import Students
    const studentIdMap = new Map<string, any>();
    for (const s of legacyDB.students || []) {
      const mappedCourseIds = (s.courseIds || []).map((id: string) => courseIdMap.get(id)).filter(Boolean);
      
      const mappedCourseTargets = [];
      if (s.courseTargets) {
        for (const [oldCid, target] of Object.entries(s.courseTargets)) {
          const newCid = courseIdMap.get(oldCid);
          if (newCid) {
            mappedCourseTargets.push({ courseId: newCid, target: target as number });
          }
        }
      }

      const newId = await ctx.db.insert("students", {
        name: s.name,
        target: s.target || 80,
        courseIds: mappedCourseIds,
        courseTargets: mappedCourseTargets,
      });
      studentIdMap.set(s.id, newId);
    }

    // 4. Import Scores
    // scores are stored as flat objects with key `${studentId}_${itemId}`
    if (legacyDB.scores) {
      for (const [key, value] of Object.entries(legacyDB.scores)) {
        // Find the first underscore to split studentId and itemId
        const underscoreIdx = key.indexOf('_');
        if (underscoreIdx === -1) continue;
        
        const oldStudentId = key.substring(0, underscoreIdx);
        const itemId = key.substring(underscoreIdx + 1);
        
        const newStudentId = studentIdMap.get(oldStudentId);
        if (newStudentId) {
          await ctx.db.insert("scores", {
            studentId: newStudentId,
            itemId: itemId,
            score: value as number,
          });
        }
      }
    }
    
    return true;
  },
});
