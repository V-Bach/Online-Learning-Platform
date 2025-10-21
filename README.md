# Online Learning Platform (Using React + Typescript)
***This project constructed by only Bach***

This project implements:
- **Classes**: Course, Student, Teacher, Assignment, Exam
- **Inheritance**: OnlineCourse and OfflineCourse extend Course
- **Interfaces**: GradingSystem interface with implementations (SimpleGrading, WeightedGrading)

## UML - Mermaid
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


## How to run locally
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`



