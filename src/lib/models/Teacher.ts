import { Person } from './Person'
import { Course } from './Course'

export class Teacher extends Person {
  public courseIds: string[] = []

  assignCourse(course: Course) {
    if (!this.courseIds.includes(course.id)) this.courseIds.push(course.id)
    course.setTeacher(this)
  }
}
