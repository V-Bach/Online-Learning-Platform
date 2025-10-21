import { Teacher } from './Teacher'
import { Student } from './Student'
import { Assignment } from './Assignment'
import { GradingSystem } from '../grading/GradingSystem'

export abstract class Course {
  public assignments: Assignment[] = []
  public students: Student[] = []
  protected scorebook: Map<string, number[]> = new Map()
  protected gradingSystem?: GradingSystem
  public teacher?: Teacher

  constructor(public id: string, public title: string, teacher?: Teacher) {
    this.teacher = teacher
  }

  setTeacher(t: Teacher) { this.teacher = t }

  addStudent(s: Student) {
    if (!this.students.includes(s)) {
      this.students.push(s)
      this.scorebook.set(s.id, [])
    }
  }

  addAssignment(a: Assignment) {
    this.assignments.push(a)
  }

  recordScore(studentId: string, score: number) {
    const arr = this.scorebook.get(studentId)
    if (!arr) throw new Error('Student not enrolled')
    arr.push(score)
  }

  getScorebook() { return this.scorebook }

  setGradingSystem(gs: GradingSystem) { this.gradingSystem = gs }

  gradeAll() {
    if (!this.gradingSystem) throw new Error('No grading system set')
    return this.gradingSystem.calculateGrade(this)
  }

  abstract getMode(): string
}
