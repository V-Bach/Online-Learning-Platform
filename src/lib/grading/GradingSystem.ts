import { Course } from '../models/Course'

export interface GradingSystem {
  calculateGrade(course: Course): Map<string, number>
}
