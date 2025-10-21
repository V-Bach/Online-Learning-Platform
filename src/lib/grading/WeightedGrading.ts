import { GradingSystem } from './GradingSystem'
import { Course } from '../models/Course'

export class WeightedGrading implements GradingSystem {
  constructor(private weights: number[]) {}

  calculateGrade(course: Course): Map<string, number> {
    const result = new Map<string, number>()
    const book = course.getScorebook()
    for (const [sid, scores] of book.entries()) {
      let total = 0; let wsum = 0
      for (let i=0;i<scores.length;i++){
        const w = this.weights[i] ?? 1
        total += (scores[i] * w)
        wsum += w
      }
      result.set(sid, wsum===0?0:Math.round((total/wsum)*100)/100)
    }
    return result
  }
}
