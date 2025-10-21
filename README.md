# Online Learning Platform — React + TypeScript (OOP)

This project is an educational, frontend-only prototype that implements:
- **Classes**: Course, Student, Teacher, Assignment, Exam
- **Inheritance**: OnlineCourse and OfflineCourse extend Course
- **Interfaces**: GradingSystem interface with implementations (SimpleGrading, WeightedGrading)
- Clean, friendly UI and well-structured TypeScript code

## UML (Mermaid)
```mermaid
classDiagram
  class Person {
    +string id
    +string name
    +string email
  }
  Person <|-- Student
  Person <|-- Teacher

  class Course {
    +string id
    +string title
    +Teacher? teacher
    +Assignment[] assignments
    +Student[] students
    +recordScore(studentId, score)
    +gradeAll() : Map
    <<abstract>>
  }
  Course <|-- OnlineCourse
  Course <|-- OfflineCourse

  class Assignment
  class Exam
  Assignment <|-- Exam

  class GradingSystem {
    <<interface>>
    +calculateGrade(course) : Map
  }
  GradingSystem <|.. SimpleGrading
  GradingSystem <|.. WeightedGrading
```

## Run locally
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`

## Notes
- This is frontend-only. For a real platform add backend, auth, DB, and file storage.
- Code organized under `src/` into `models`, `grading`, and `components`.
