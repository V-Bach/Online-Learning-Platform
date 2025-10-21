import { Person } from './Person'
import { Course } from './Course'

export class Student extends Person {
  public enrolledCourseIds: string[] = []
  public grades: Map<string, number> = new Map()

  enroll(course: Course) {
    if (!this.enrolledCourseIds.includes(course.id)) {
      this.enrolledCourseIds.push(course.id)
      course.addStudent(this)
    }
  }

  receiveGrade(courseId: string, grade: number) {
    this.grades.set(courseId, grade)
  }
}
