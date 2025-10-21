import { Assignment } from './Assignment'
export class Exam extends Assignment {
  constructor(id: string, title: string, maxScore: number, public date: Date) {
    super(id, title, maxScore)
  }
}
