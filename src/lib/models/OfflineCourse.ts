import { Course } from './Course'
export class OfflineCourse extends Course {
  constructor(id: string, title: string, public location: string) { super(id, title) }
  getMode() { return 'offline' }
}
