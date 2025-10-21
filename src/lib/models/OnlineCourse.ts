import { Course } from './Course'
export class OnlineCourse extends Course {
  constructor(id: string, title: string, public meetingUrl: string) { super(id, title) }
  getMode() { return 'online' }
}
