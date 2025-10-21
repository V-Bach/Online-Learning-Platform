import { GradingSystem } from './GradingSystem'
import { Course } from '../models/Course'

export class SimpleGrading implements GradingSystem {
  calculateGrade(course: Course): Map<string, number> {
    const result = new Map<string, number>()
    const book = course.getScorebook()
    for (const [sid, scores] of book.entries()) {
      if (!scores || scores.length === 0) { result.set(sid, 0); continue }
      const sum = scores.reduce((a,b)=>a+b, 0)
      result.set(sid, Math.round((sum/scores.length)*100)/100)
    }
    return result
  }
}
