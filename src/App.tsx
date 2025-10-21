import React, { useEffect, useState } from 'react'
import './styles.css'
import { Teacher } from './lib/models/Teacher'
import { Student } from './lib/models/Student'
import { Assignment } from './lib/models/Assignment'
import { Exam } from './lib/models/Exam'
import { OnlineCourse } from './lib/models/OnlineCourse'
import { OfflineCourse } from './lib/models/OfflineCourse'
import { Course } from './lib/models/Course'
import { SimpleGrading } from './lib/grading/SimpleGrading'
import { WeightedGrading } from './lib/grading/WeightedGrading'

type ID = string
const STORAGE_KEY = 'olp_v1'

function useDomain() {
  const [teachers, setTeachers] = useState<Record<ID, Teacher>>({})
  const [students, setStudents] = useState<Record<ID, Student>>({})
  const [courses, setCourses] = useState<Record<ID, Course>>({})
  const [assignments, setAssignments] = useState<Record<ID, Assignment>>({})

  useEffect(()=> {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // bootstrap sample
      const t1 = new Teacher('t1','TS Pham Minh Hoan','hoanpm@neu.edu.vn')
      const s1 = new Student('s1','Vu The Bach','11247384@st.neu.edu.vn')
      const s2 = new Student('s2','Tang Thi Ha','11247391@st.neu.edu.vn')
      const a1 = new Assignment('a1','Assignment 1',100)
      const e1 = new Exam('e1','Midterm',100,new Date())
      const c1 = new OnlineCourse('c1','Object-Oriented Programming','https://meet.example')
      t1.assignCourse(c1)
      s1.enroll(c1); s2.enroll(c1)
      c1.addAssignment(a1); c1.addAssignment(e1)
      c1.recordScore('s1',80); c1.recordScore('s1',75)
      c1.recordScore('s2',90); c1.recordScore('s2',85)
      setTeachers({[t1.id]:t1}); setStudents({[s1.id]:s1,[s2.id]:s2}); setAssignments({[a1.id]:a1,[e1.id]:e1}); setCourses({[c1.id]:c1})
      return
    }
    try {
      const parsed = JSON.parse(raw)
      // lightweight rehydration
      const tmap: Record<ID, Teacher> = {}
      for (const t of parsed.teachers||[]) tmap[t.id] = new Teacher(t.id,t.name,t.email)
      const smap: Record<ID, Student> = {}
      for (const s of parsed.students||[]) smap[s.id] = new Student(s.id,s.name,s.email)
      const amap: Record<ID, Assignment> = {}
      for (const a of parsed.assignments||[]) {
        if (a.type==='exam') amap[a.id] = new Exam(a.id,a.title,a.maxScore,new Date(a.date))
        else amap[a.id] = new Assignment(a.id,a.title,a.maxScore)
      }
      const cmap: Record<ID, Course> = {}
      for (const c of parsed.courses||[]) {
        cmap[c.id] = c.mode==='online' ? new OnlineCourse(c.id,c.title,c.meta.meetingUrl) : new OfflineCourse(c.id,c.title,c.meta.location)
      }
      // wire
      for (const c of parsed.courses||[]) {
        const course = cmap[c.id]
        if (!course) continue
        if (c.teacherId && tmap[c.teacherId]) course.setTeacher(tmap[c.teacherId])
        for (const aid of c.assignmentIds||[]) if (amap[aid]) course.addAssignment(amap[aid])
        for (const sid of c.studentIds||[]) if (smap[sid]) { course.addStudent(smap[sid]); smap[sid].enroll(course) }
        for (const [sid,scores] of Object.entries(c.scorebook||{})) {
          for (const sc of scores as number[]) course.recordScore(sid, sc)
        }
      }
      for (const t of parsed.teachers||[]) {
        if (!tmap[t.id]) continue
        for (const cid of t.courseIds||[]) if (cmap[cid]) tmap[t.id].assignCourse(cmap[cid])
      }
      setTeachers(tmap); setStudents(smap); setAssignments(amap); setCourses(cmap)
    } catch(e) { console.error('load error', e) }
  }, [])

  useEffect(()=> {
    const payload = {
      teachers: Object.values(teachers).map(t=>({id:t.id,name:t.name,email:t.email,courseIds:t.courseIds})),
      students: Object.values(students).map(s=>({id:s.id,name:s.name,email:s.email,enrolledCourseIds:s.enrolledCourseIds})),
      assignments: Object.values(assignments).map(a=>({...a, type: (a as any).date ? 'exam' : 'assignment', date: (a as any).date ? (a as any).date.toString() : undefined})),
      courses: Object.values(courses).map(c=>({id:c.id,title:c.title,mode:c.getMode(),meta: c.getMode()==='online' ? {meetingUrl:(c as any).meetingUrl} : {location:(c as any).location},teacherId:(c as any).teacher?.id ?? null, assignmentIds:c.assignments.map(a=>a.id), studentIds:c.students.map(s=>s.id), scorebook: Object.fromEntries(c.getScorebook())}))
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [teachers,students,assignments,courses])

  return { teachers, setTeachers, students, setStudents, courses, setCourses, assignments, setAssignments }
}

export default function App(){
  const domain = useDomain()
  const [selectedCourse, setSelectedCourse] = useState<string | null>(Object.keys(domain.courses)[0] ?? null)
  const [gradingMode, setGradingMode] = useState<'simple'|'weighted'>('simple')
  const [weights, setWeights] = useState('0.4,0.6')

  function createTeacher(name:string,email:string){
    const id = 't_'+Math.random().toString(36).slice(2,8)
    const t = new Teacher(id,name,email); domain.setTeachers({...domain.teachers,[id]:t})
  }
  function createStudent(name:string,email:string){
    const id = 's_'+Math.random().toString(36).slice(2,8)
    const s = new Student(id,name,email); domain.setStudents({...domain.students,[id]:s})
  }
  function createCourse(title:string,mode:'online'|'offline',meta:any,teacherId?:string){
    const id = 'c_'+Math.random().toString(36).slice(2,8)
    const c = mode==='online' ? new OnlineCourse(id,title,meta.meetingUrl) : new OfflineCourse(id,title,meta.location)
    if (teacherId && domain.teachers[teacherId]) domain.teachers[teacherId].assignCourse(c)
    domain.setCourses({...domain.courses,[id]:c}); setSelectedCourse(id)
  }
  function addAssignment(courseId:string,title:string,maxScore:number,isExam=false){
    const id = 'a_'+Math.random().toString(36).slice(2,8)
    const a = isExam ? new Exam(id,title,maxScore,new Date()) : new Assignment(id,title,maxScore)
    domain.setAssignments({...domain.assignments,[id]:a})
    const c = domain.courses[courseId]
    if (c) c.addAssignment(a)
    domain.setCourses({...domain.courses,[courseId]:c})
  }
  function enrollStudent(courseId:string,studentId:string){
    const c = domain.courses[courseId]; const s = domain.students[studentId]
    if (c && s) s.enroll(c)
    domain.setStudents({...domain.students,[studentId]:s}); domain.setCourses({...domain.courses,[courseId]:c})
  }
  function recordScore(courseId:string,studentId:string,score:number){
    const c = domain.courses[courseId]; if (!c) return
    c.recordScore(studentId, score); domain.setCourses({...domain.courses,[courseId]:c})
  }
  function computeGrades(courseId:string){
    const c = domain.courses[courseId]; if (!c) return {}
    if (gradingMode==='simple') c.setGradingSystem(new SimpleGrading())
    else c.setGradingSystem(new WeightedGrading(weights.split(',').map(s=>parseFloat(s))))
    const map = c.gradeAll()
    const out: Record<string,number> = {}
    for (const [k,v] of map.entries()) out[k]=v
    return out
  }

  return (
    <div className="container">
      <header style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:16}}>
        <div>
          <h1 style={{margin:0}}>Online Learning Platform — Preview version</h1>
          <div className="small"></div>
        </div>
        <div>
          <button className="btn ghost" onClick={()=>{ localStorage.removeItem(STORAGE_KEY); location.reload() }}>Reset</button>
        </div>
      </header>

      <main className="grid cols-3" style={{marginTop:18}}>
        <aside className="card">
          <h3>Courses</h3>
          <div style={{marginTop:8}}>
            {Object.values(domain.courses).map(c=> (
              <div key={c.id} className="list-item" style={{marginBottom:6}}>
                <div>
                  <div style={{fontWeight:600}}>{c.title} <span className="pill">{c.getMode()}</span></div>
                  <div className="small">ID: {c.id}</div>
                </div>
                <div>
                  <button className="btn ghost" onClick={()=>setSelectedCourse(c.id)}>Open</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:12}}>
            <h4 className="small">Create Teacher</h4>
            <CreatePerson onCreate={(n,e)=>createTeacher(n,e)} placeholderName="Teacher name" />
            <h4 className="small" style={{marginTop:8}}>Create Student</h4>
            <CreatePerson onCreate={(n,e)=>createStudent(n,e)} placeholderName="Student name" />
            <h4 className="small" style={{marginTop:8}}>Create Course</h4>
            <CreateCourseForm teachers={domain.teachers} onCreate={(t,m,meta,tid)=>createCourse(t,m,meta,tid)} />
          </div>
        </aside>

        <section className="card">
          {!selectedCourse ? <div>Select a course</div> :
            <CourseDetail
              course={domain.courses[selectedCourse]!}
              students={Object.values(domain.students)}
              assignments={Object.values(domain.assignments)}
              onAddAssignment={(title,maxScore,isExam)=>addAssignment(selectedCourse,title,maxScore,isExam)}
              onEnroll={(sid)=>enrollStudent(selectedCourse,sid)}
              onRecordScore={(sid,score)=>recordScore(selectedCourse,sid,score)}
              computeGrades={()=>computeGrades(selectedCourse)}
              gradingMode={gradingMode}
              setGradingMode={(m)=>setGradingMode(m)}
              weights={weights}
              setWeights={(w)=>setWeights(w)}
            />
          }
        </section>

        <aside className="card">
          <h4>Teachers</h4>
          <div style={{marginTop:8}}>
            {Object.values(domain.teachers).map(t=>(
              <div key={t.id} className="list-item" style={{marginBottom:8}}>
                <div>
                  <div style={{fontWeight:600}}>{t.name}</div>
                  <div className="small">{t.email}</div>
                </div>
                <div className="small">{t.courseIds.length} courses</div>
              </div>
            ))}
          </div>
        </aside>
      </main>

      <div className="footer">This demo is the preview version of OOP structure and grading strategies. Constructing only by Bach</div>
    </div>
  )
}

// small components
function CreatePerson({onCreate, placeholderName}:{onCreate:(n:string,e:string)=>void, placeholderName?:string}){
  const [name,setName] = useState(''); const [email,setEmail]=useState('')
  return (
    <form onSubmit={(e)=>{e.preventDefault(); if(!name||!email) return; onCreate(name,email); setName(''); setEmail('')}}>
      <input placeholder={placeholderName||'Name'} value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder='email@example.com' value={email} onChange={e=>setEmail(e.target.value)} style={{marginTop:6}} />
      <div style={{marginTop:6}}><button className='btn' type='submit'>Create</button></div>
    </form>
  )
}

function CreateCourseForm({teachers, onCreate}:{teachers: Record<string,Teacher>, onCreate:(title:string, mode:'online'|'offline', meta:any, teacherId?:string)=>void}){
  const [title,setTitle] = useState(''); const [mode,setMode] = useState<'online'|'offline'>('online'); const [meta,setMeta] = useState(''); const [tid,setTid] = useState('')
  return (
    <form onSubmit={(e)=>{e.preventDefault(); if(!title) return; onCreate(title, mode, mode==='online'?{meetingUrl:meta}:{location:meta}, tid||undefined); setTitle(''); setMeta(''); setTid('')}}>
      <input placeholder='Course title' value={title} onChange={e=>setTitle(e.target.value)} />
      <div style={{display:'flex', gap:8, marginTop:6}}>
        <select value={mode} onChange={e=>setMode(e.target.value as any)}>
          <option value='online'>Online</option>
          <option value='offline'>Offline</option>
        </select>
        <input placeholder={mode==='online'?'Meeting URL':'Location'} value={meta} onChange={e=>setMeta(e.target.value)} />
      </div>
      <select value={tid} onChange={e=>setTid(e.target.value)} style={{marginTop:6}}>
        <option value=''>No teacher</option>
        {Object.values(teachers).map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <div style={{marginTop:6}}><button className='btn' type='submit'>Create course</button></div>
    </form>
  )
}

function CourseDetail({course, students, assignments, onAddAssignment, onEnroll, onRecordScore, computeGrades, gradingMode, setGradingMode, weights, setWeights}:{course:Course, students:Student[], assignments:Assignment[], onAddAssignment:(title:string,maxScore:number,isExam:boolean)=>void, onEnroll:(sid:string)=>void, onRecordScore:(sid:string,score:number)=>void, computeGrades:()=>Record<string,number>, gradingMode:'simple'|'weighted', setGradingMode:(m:'simple'|'weighted')=>void, weights:string, setWeights:(w:string)=>void}){
  const enrolled = students.filter(s=>s.enrolledCourseIds.includes(course.id))
  const grades = computeGrades()
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
        <div>
          <h2 style={{margin:0}}>{course.title} <span className='pill'>{course.getMode()}</span></h2>
          <div className='small'>ID: {course.id} • Teacher: {(course as any).teacher?.name ?? '—'}</div>
        </div>
        <div>
          <div className='small'>Students: {enrolled.length}</div>
        </div>
      </div>

      <section style={{marginTop:12}}>
        <h4>Assignments</h4>
        <div style={{marginTop:8}}>
          {course.assignments.map(a=> <div key={a.id} className='list-item' style={{marginBottom:8}}><div><div style={{fontWeight:600}}>{a.title}</div><div className='small'>{a instanceof Exam? 'Exam' : 'Assignment'} • max {a.maxScore}</div></div></div>)}
        </div>
        <AddAssignment onAdd={onAddAssignment} />
      </section>

      <section style={{marginTop:12}}>
        <h4>Students & Scores</h4>
        <div style={{marginTop:8}}>
          {enrolled.map(s=>(
            <div key={s.id} className='list-item' style={{marginBottom:8}}>
              <div>
                <div style={{fontWeight:600}}>{s.name}</div>
                <div className='small'>{s.email}</div>
              </div>
              <div className='small'>{(course.getScorebook().get(s.id) || []).join(', ') || '—'}</div>
            </div>
          ))}
        </div>
        <EnrollForm students={students} onEnroll={onEnroll} />
        <RecordScoreForm students={enrolled} onRecord={onRecordScore} />
      </section>

      <section style={{marginTop:12}}>
        <h4>Grading</h4>
        <div style={{display:'flex', gap:8, alignItems:'center', marginTop:8}}>
          <select value={gradingMode} onChange={e=>setGradingMode(e.target.value as any)}>
            <option value='simple'>Simple Average</option>
            <option value='weighted'>Weighted</option>
          </select>
          {gradingMode==='weighted' && <input placeholder='comma weights e.g. 0.4,0.6' value={weights} onChange={e=>setWeights(e.target.value)} />}
          <button className='btn' onClick={()=>{ const g= computeGrades(); alert(Object.entries(g).map(([sid,gc])=> `${sid}: ${gc}`).join('\n')) }}>Compute</button>
        </div>

        <div style={{marginTop:12}}>
          <h5 className='small'>Computed Grades (preview)</h5>
          {Object.entries(grades).length===0 ? <div className='small'>No scores recorded yet</div> : <div>{Object.entries(grades).map(([sid,g])=> <div key={sid}>{sid}: {g}</div>)}</div>}
        </div>
      </section>
    </div>
  )
}

function AddAssignment({onAdd}:{onAdd:(title:string,maxScore:number,isExam:boolean)=>void}){
  const [title,setTitle]=useState(''); const [max,setMax]=useState(100); const [isExam,setIsExam]=useState(false)
  return (
    <form onSubmit={(e)=>{e.preventDefault(); onAdd(title,max,isExam); setTitle(''); setMax(100); setIsExam(false)}}>
      <input placeholder='Title' value={title} onChange={e=>setTitle(e.target.value)} />
      <div style={{display:'flex', gap:8, marginTop:6}}>
        <input type='number' value={max} onChange={e=>setMax(parseFloat(e.target.value)||100)} />
        <label style={{alignSelf:'center'}}><input type='checkbox' checked={isExam} onChange={e=>setIsExam(e.target.checked)} /> Exam</label>
        <button className='btn' type='submit'>Add</button>
      </div>
    </form>
  )
}

function EnrollForm({students, onEnroll}:{students:Student[], onEnroll:(sid:string)=>void}){
  const [sid,setSid]=useState('')
  return (
    <form onSubmit={(e)=>{e.preventDefault(); if(!sid) return; onEnroll(sid); setSid('')}} style={{marginTop:8}}>
      <select value={sid} onChange={e=>setSid(e.target.value)}><option value=''>Select student</option>{students.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <div style={{marginTop:6}}><button className='btn' type='submit'>Enroll</button></div>
    </form>
  )
}

function RecordScoreForm({students, onRecord}:{students:Student[], onRecord:(sid:string,score:number)=>void}){
  const [sid,setSid]=useState(''); const [score,setScore]=useState<number | ''>('')
  return (
    <form onSubmit={(e)=>{e.preventDefault(); if(!sid || score==='' ) return; onRecord(sid, Number(score)); setSid(''); setScore('')}} style={{marginTop:8}}>
      <select value={sid} onChange={e=>setSid(e.target.value)}><option value=''>Select student</option>{students.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <div style={{display:'flex', gap:8, marginTop:6}}>
        <input type='number' placeholder='score' value={score as any} onChange={e=>setScore(e.target.value as any)} />
        <button className='btn' type='submit'>Record</button>
      </div>
    </form>
  )
}
