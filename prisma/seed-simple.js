const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

const dbUrl = 'file:' + path.resolve(__dirname, '..', 'dev.db');
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

function simpleHash(password) {
  return Buffer.from(password).toString('base64');
}

async function main() {
  console.log('Starting database seed...');

  console.log('Clearing existing data...');
  await prisma.chatMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.result.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  console.log('Database cleared');

  console.log('Creating users...');
  const adminUser = await prisma.user.create({ data: { email: 'admin@school.edu', passwordHash: simpleHash('admin123'), role: 'admin' } });
  const t1u = await prisma.user.create({ data: { email: 'teacher1@school.edu', passwordHash: simpleHash('teacher123'), role: 'teacher' } });
  const t2u = await prisma.user.create({ data: { email: 'teacher2@school.edu', passwordHash: simpleHash('teacher123'), role: 'teacher' } });
  const t3u = await prisma.user.create({ data: { email: 'teacher3@school.edu', passwordHash: simpleHash('teacher123'), role: 'teacher' } });
  const s1u = await prisma.user.create({ data: { email: 'student1@school.edu', passwordHash: simpleHash('student123'), role: 'student' } });
  const s2u = await prisma.user.create({ data: { email: 'student2@school.edu', passwordHash: simpleHash('student123'), role: 'student' } });
  const s3u = await prisma.user.create({ data: { email: 'student3@school.edu', passwordHash: simpleHash('student123'), role: 'student' } });
  const s4u = await prisma.user.create({ data: { email: 'student4@school.edu', passwordHash: simpleHash('student123'), role: 'student' } });
  const s5u = await prisma.user.create({ data: { email: 'student5@school.edu', passwordHash: simpleHash('student123'), role: 'student' } });
  const s6u = await prisma.user.create({ data: { email: 'student6@school.edu', passwordHash: simpleHash('student123'), role: 'student' } });
  console.log('Created 10 users');

  console.log('Creating teachers...');
  const t1 = await prisma.teacher.create({ data: { userId: t1u.id, teacherId: 'T001', fullName: 'John Smith', subject: 'Mathematics', qualification: 'M.Sc. Mathematics', joiningDate: new Date('2023-01-15'), salary: 50000 } });
  const t2 = await prisma.teacher.create({ data: { userId: t2u.id, teacherId: 'T002', fullName: 'Sarah Johnson', subject: 'Science', qualification: 'Ph.D. Physics', joiningDate: new Date('2022-08-20'), salary: 55000 } });
  const t3 = await prisma.teacher.create({ data: { userId: t3u.id, teacherId: 'T003', fullName: 'Emily Davis', subject: 'English', qualification: 'M.A. English Literature', joiningDate: new Date('2023-06-01'), salary: 48000 } });
  console.log('Created 3 teachers');

  console.log('Creating students...');
  const s1 = await prisma.student.create({ data: { userId: s1u.id, studentId: 'S001', fullName: 'Alice Brown', class: '10th', section: 'A', dateOfBirth: new Date('2008-05-15'), parentName: 'Robert Brown', parentPhone: '+1234567890', address: '123 Main St', enrollmentDate: new Date('2023-09-01') } });
  const s2 = await prisma.student.create({ data: { userId: s2u.id, studentId: 'S002', fullName: 'Bob Wilson', class: '10th', section: 'A', dateOfBirth: new Date('2008-07-22'), parentName: 'Mary Wilson', parentPhone: '+1234567891', address: '456 Oak Ave', enrollmentDate: new Date('2023-09-01') } });
  const s3 = await prisma.student.create({ data: { userId: s3u.id, studentId: 'S003', fullName: 'Charlie Davis', class: '10th', section: 'A', dateOfBirth: new Date('2008-03-10'), parentName: 'James Davis', parentPhone: '+1234567892', address: '789 Pine Rd', enrollmentDate: new Date('2023-09-01') } });
  const s4 = await prisma.student.create({ data: { userId: s4u.id, studentId: 'S004', fullName: 'Diana Evans', class: '9th', section: 'B', dateOfBirth: new Date('2009-11-20'), parentName: 'Paul Evans', parentPhone: '+1234567893', address: '321 Elm St', enrollmentDate: new Date('2023-09-01') } });
  const s5 = await prisma.student.create({ data: { userId: s5u.id, studentId: 'S005', fullName: 'Edward Fox', class: '9th', section: 'B', dateOfBirth: new Date('2009-02-14'), parentName: 'Lisa Fox', parentPhone: '+1234567894', address: '654 Birch Ln', enrollmentDate: new Date('2023-09-01') } });
  const s6 = await prisma.student.create({ data: { userId: s6u.id, studentId: 'S006', fullName: 'Fiona Green', class: '10th', section: 'A', dateOfBirth: new Date('2008-09-05'), parentName: 'George Green', parentPhone: '+1234567895', address: '987 Cedar Ct', enrollmentDate: new Date('2023-09-01') } });
  console.log('Created 6 students');

  console.log('Creating classes...');
  await prisma.class.create({ data: { className: '10th', section: 'A', teacherId: t1.id, roomNumber: '101' } });
  await prisma.class.create({ data: { className: '9th', section: 'B', teacherId: t2.id, roomNumber: '102' } });
  await prisma.class.create({ data: { className: '10th', section: 'B', teacherId: t3.id, roomNumber: '103' } });
  await prisma.class.create({ data: { className: '9th', section: 'A', teacherId: t1.id, roomNumber: '104' } });
  console.log('Created 4 classes');

  console.log('Creating subjects...');
  await prisma.subject.createMany({ data: [
    { name: 'Mathematics', code: 'MATH101', description: 'Algebra and Calculus' },
    { name: 'Science', code: 'SCI101', description: 'Physics and Chemistry' },
    { name: 'English', code: 'ENG101', description: 'Literature and Grammar' },
    { name: 'History', code: 'HIS101', description: 'World History' },
    { name: 'Computer Science', code: 'CS101', description: 'Programming Fundamentals' },
    { name: 'Urdu', code: 'URD101', description: 'Urdu Language and Literature' },
  ]});
  console.log('Created 6 subjects');

  const math = await prisma.subject.findFirst({ where: { code: 'MATH101' } });
  const sci = await prisma.subject.findFirst({ where: { code: 'SCI101' } });
  const eng = await prisma.subject.findFirst({ where: { code: 'ENG101' } });
  const his = await prisma.subject.findFirst({ where: { code: 'HIS101' } });
  const cs = await prisma.subject.findFirst({ where: { code: 'CS101' } });
  const urd = await prisma.subject.findFirst({ where: { code: 'URD101' } });

  console.log('Creating attendance records...');
  const attendanceData = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    [s1, s2, s6].forEach((st, idx) => {
      let status = 'present', remarks = '';
      if (i === 2 && idx === 0) { status = 'absent'; remarks = 'Sick leave'; }
      else if (i === 1 && idx === 1) { status = 'late'; remarks = 'Late by 10 min'; }
      else if (i === 5 && idx === 2) { status = 'excused'; remarks = 'Family event'; }
      attendanceData.push({ studentId: st.id, date, status, markedById: t1.id, remarks });
    });
    [s4, s5].forEach((st) => {
      let status = 'present', remarks = '';
      if (i === 0 && st.id === s4.id) { status = 'absent'; remarks = 'Doctor appointment'; }
      else if (i === 3 && st.id === s5.id) { status = 'late'; remarks = 'Late by 5 min'; }
      attendanceData.push({ studentId: st.id, date, status, markedById: t2.id, remarks });
    });
  }
  await prisma.attendance.createMany({ data: attendanceData });
  console.log(`Created ${attendanceData.length} attendance records`);

  console.log('Creating homework...');
  await prisma.homework.createMany({ data: [
    { teacherId: t1.id, class: '10th', section: 'A', subject: 'Mathematics', title: 'Algebra Practice', description: 'Complete exercises 1-10 from chapter 5', dueDate: new Date(Date.now() + 3 * 86400000) },
    { teacherId: t1.id, class: '10th', section: 'A', subject: 'Mathematics', title: 'Geometry Assignment', description: 'Solve problems on triangles and circles', dueDate: new Date(Date.now() + 7 * 86400000) },
    { teacherId: t2.id, class: '9th', section: 'B', subject: 'Science', title: 'Physics Lab Report', description: "Write report on Newton's laws experiment", dueDate: new Date(Date.now() + 5 * 86400000) },
    { teacherId: t3.id, class: '10th', section: 'B', subject: 'English', title: 'Essay: Climate Change', description: 'Write a 500-word essay on climate change', dueDate: new Date(Date.now() + 10 * 86400000) },
    { teacherId: t1.id, class: '10th', section: 'A', subject: 'Mathematics', title: 'Quadratic Equations', description: 'Solve 15 quadratic equation problems', dueDate: new Date(Date.now() - 2 * 86400000) },
    { teacherId: t2.id, class: '9th', section: 'B', subject: 'Science', title: 'Chemistry Worksheet', description: 'Complete balancing chemical equations', dueDate: new Date(Date.now() - 1 * 86400000) },
  ]});
  console.log('Created 6 homework assignments');

  console.log('Creating complaints...');
  await prisma.complaint.createMany({ data: [
    { fromUserId: s1u.id, toUserId: t1u.id, category: 'academic', message: 'Having difficulty understanding quadratic equations', status: 'pending', priority: 'medium' },
    { fromUserId: s2u.id, toUserId: adminUser.id, category: 'facility', message: 'Science lab equipment needs maintenance', status: 'in_progress', priority: 'high', assignedToId: t2u.id },
    { fromUserId: s3u.id, toUserId: t2u.id, category: 'behavior', message: 'Issues with group project collaboration', status: 'resolved', priority: 'low', resolvedAt: new Date() },
    { fromUserId: s4u.id, toUserId: t3u.id, category: 'academic', message: 'Need extra help with English grammar', status: 'pending', priority: 'medium' },
    { fromUserId: s5u.id, toUserId: adminUser.id, category: 'facility', message: 'Broken fan in classroom 9-B', status: 'pending', priority: 'high' },
  ]});
  console.log('Created 5 complaints');

  console.log('Creating exam results...');
  const allSubjects = [math, sci, eng, his, cs, urd].filter(Boolean);
  const allStudents = [s1, s2, s3, s4, s5, s6];
  let resultCount = 0;
  for (const st of allStudents) {
    for (const sub of allSubjects) {
      if (!sub) continue;
      const marks = Math.floor(Math.random() * 41) + 50;
      const pct = (marks / 100) * 100;
      let grade = 'F';
      if (pct >= 90) grade = 'A+';
      else if (pct >= 80) grade = 'A';
      else if (pct >= 70) grade = 'B+';
      else if (pct >= 60) grade = 'B';
      else if (pct >= 50) grade = 'C';
      else if (pct >= 40) grade = 'D';
      try {
        await prisma.result.create({ data: { studentId: st.id, subjectId: sub.id, examType: 'midterm', marksObtained: marks, totalMarks: 100, grade, examDate: new Date('2024-03-15') } });
        resultCount++;
      } catch (e) {}
    }
  }
  console.log(`Created ${resultCount} exam results`);

  console.log('Creating fee records...');
  await prisma.fee.createMany({ data: [
    { studentId: s1.id, term: 'Q1 2024', amount: 5000, dueDate: new Date('2024-04-30'), paidAmount: 5000, paymentStatus: 'paid', paymentDate: new Date('2024-04-15'), transactionId: 'TX001' },
    { studentId: s2.id, term: 'Q1 2024', amount: 5000, dueDate: new Date('2024-04-30'), paidAmount: 3000, paymentStatus: 'partial', paymentDate: new Date('2024-04-20'), transactionId: 'TX002' },
    { studentId: s3.id, term: 'Q1 2024', amount: 5000, dueDate: new Date('2024-04-30'), paidAmount: 0, paymentStatus: 'pending' },
    { studentId: s4.id, term: 'Q1 2024', amount: 4500, dueDate: new Date('2024-04-30'), paidAmount: 4500, paymentStatus: 'paid', paymentDate: new Date('2024-04-10'), transactionId: 'TX003' },
    { studentId: s5.id, term: 'Q1 2024', amount: 4500, dueDate: new Date('2024-04-30'), paidAmount: 1500, paymentStatus: 'partial', paymentDate: new Date('2024-04-25'), transactionId: 'TX004' },
    { studentId: s6.id, term: 'Q1 2024', amount: 5000, dueDate: new Date('2024-04-30'), paidAmount: 0, paymentStatus: 'pending' },
    { studentId: s1.id, term: 'Q2 2024', amount: 5500, dueDate: new Date('2024-08-31'), paidAmount: 5500, paymentStatus: 'paid', paymentDate: new Date('2024-08-20'), transactionId: 'TX005' },
    { studentId: s2.id, term: 'Q2 2024', amount: 5500, dueDate: new Date('2024-08-31'), paidAmount: 0, paymentStatus: 'pending' },
  ]});
  console.log('Created 8 fee records');

  console.log('Creating events...');
  await prisma.event.createMany({ data: [
    { title: 'Annual Sports Day', description: 'School sports competition with various events', eventDate: new Date(Date.now() + 14 * 86400000), eventTime: '09:00', location: 'School Ground', organizer: 'Sports Committee', audience: 'all' },
    { title: 'Parent-Teacher Meeting', description: 'Meeting to discuss student progress', eventDate: new Date(Date.now() + 7 * 86400000), eventTime: '14:00', location: 'School Auditorium', organizer: 'Administration', audience: 'all' },
    { title: 'Science Fair', description: 'Student science projects exhibition', eventDate: new Date(Date.now() + 21 * 86400000), eventTime: '10:00', location: 'Science Block', organizer: 'Science Department', audience: 'students' },
    { title: 'Independence Day Celebration', description: 'Flag hoisting and cultural performances', eventDate: new Date(Date.now() + 30 * 86400000), eventTime: '08:00', location: 'School Ground', organizer: 'Cultural Committee', audience: 'all' },
  ]});
  console.log('Created 4 events');

  console.log('Creating notifications...');
  await prisma.notification.createMany({ data: [
    { userId: s1u.id, title: 'Homework Due Soon', message: 'Mathematics homework due in 3 days', type: 'reminder', read: false },
    { userId: t1u.id, title: 'New Complaint', message: 'You have a new complaint from Alice Brown', type: 'alert', read: true },
    { userId: s2u.id, title: 'Fee Reminder', message: 'Partial payment received. Remaining: $2000', type: 'warning', read: false },
    { userId: adminUser.id, title: 'New Student Enrolled', message: 'Fiona Green enrolled in class 10-A', type: 'info', read: true },
    { userId: t3u.id, title: 'Homework Overdue', message: 'Students have not submitted the essay assignment', type: 'warning', read: false },
  ]});
  console.log('Created 5 notifications');

  console.log('Creating chat messages...');
  await prisma.chatMessage.createMany({ data: [
    { senderId: s1u.id, receiverId: t1u.id, message: 'Hello Sir, I have a question about the algebra homework.', timestamp: new Date(Date.now() - 86400000), read: true },
    { senderId: t1u.id, receiverId: s1u.id, message: 'Sure Alice, what do you need help with?', timestamp: new Date(Date.now() - 86000000), read: true },
    { senderId: s1u.id, receiverId: t1u.id, message: "I don't understand exercise 5 about quadratic equations.", timestamp: new Date(Date.now() - 85000000), read: true },
    { senderId: t1u.id, receiverId: s1u.id, message: "I'll explain it in class tomorrow. Please review chapter 4 first.", timestamp: new Date(Date.now() - 84000000), read: false },
    { senderId: s2u.id, receiverId: adminUser.id, message: 'The science lab microscope is broken. Can we get it fixed?', timestamp: new Date(Date.now() - 72000000), read: true },
    { senderId: adminUser.id, receiverId: s2u.id, message: "Thanks for reporting. I've assigned it to Teacher Sarah.", timestamp: new Date(Date.now() - 70000000), read: true },
    { senderId: s4u.id, receiverId: t3u.id, message: "Ma'am, can you suggest extra reading for improving my English?", timestamp: new Date(Date.now() - 36000000), read: false },
  ]});
  console.log('Created 7 chat messages');

  console.log('\nDatabase seeding completed successfully!');
  console.log('\nTest Credentials:');
  console.log('========================================');
  console.log('Admin:     admin@school.edu / admin123');
  console.log('Teacher 1: teacher1@school.edu / teacher123 (Mathematics, 10-A)');
  console.log('Teacher 2: teacher2@school.edu / teacher123 (Science, 9-B)');
  console.log('Teacher 3: teacher3@school.edu / teacher123 (English, 10-B)');
  console.log('Student 1: student1@school.edu / student123 (Alice Brown, 10-A)');
  console.log('Student 2: student2@school.edu / student123 (Bob Wilson, 10-A)');
  console.log('Student 3: student3@school.edu / student123 (Charlie Davis, 10-A)');
  console.log('Student 4: student4@school.edu / student123 (Diana Evans, 9-B)');
  console.log('Student 5: student5@school.edu / student123 (Edward Fox, 9-B)');
  console.log('Student 6: student6@school.edu / student123 (Fiona Green, 10-A)');
  console.log('========================================');
}

main()
  .catch((e) => { console.error('Error during seeding:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
