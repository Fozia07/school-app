import { PrismaClient, Role, AttendanceStatus, ComplaintCategory, ComplaintStatus, ComplaintPriority, PaymentStatus, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

// Simple hash for demo (in production use proper hashing)
function simpleHash(password: string): string {
  return Buffer.from(password).toString('base64');
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
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

  console.log('🗑️  Cleared existing data');

  // Create users with different roles
  const users = await prisma.user.createManyAndReturn({
    data: [
      {
        email: 'admin@school.edu',
        passwordHash: simpleHash('admin123'),
        role: Role.admin,
      },
      {
        email: 'teacher1@school.edu',
        passwordHash: simpleHash('teacher123'),
        role: Role.teacher,
      },
      {
        email: 'teacher2@school.edu',
        passwordHash: simpleHash('teacher123'),
        role: Role.teacher,
      },
      {
        email: 'student1@school.edu',
        passwordHash: simpleHash('student123'),
        role: Role.student,
      },
      {
        email: 'student2@school.edu',
        passwordHash: simpleHash('student123'),
        role: Role.student,
      },
      {
        email: 'student3@school.edu',
        passwordHash: simpleHash('student123'),
        role: Role.student,
      },
    ],
  });

  console.log(`👥 Created ${users.length} users`);

  // Create teachers
  const teacher1 = await prisma.teacher.create({
    data: {
      userId: users.find(u => u.email === 'teacher1@school.edu')!.id,
      teacherId: 'T001',
      fullName: 'John Smith',
      subject: 'Mathematics',
      qualification: 'M.Sc. Mathematics',
      joiningDate: new Date('2023-01-15'),
      salary: 50000,
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      userId: users.find(u => u.email === 'teacher2@school.edu')!.id,
      teacherId: 'T002',
      fullName: 'Sarah Johnson',
      subject: 'Science',
      qualification: 'Ph.D. Physics',
      joiningDate: new Date('2022-08-20'),
      salary: 55000,
    },
  });

  console.log('👩‍🏫 Created teachers');

  // Create students
  const student1 = await prisma.student.create({
    data: {
      userId: users.find(u => u.email === 'student1@school.edu')!.id,
      studentId: 'S001',
      fullName: 'Alice Brown',
      class: '10th',
      section: 'A',
      dateOfBirth: new Date('2008-05-15'),
      parentName: 'Robert Brown',
      parentPhone: '+1234567890',
      address: '123 Main St, City',
      enrollmentDate: new Date('2023-09-01'),
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: users.find(u => u.email === 'student2@school.edu')!.id,
      studentId: 'S002',
      fullName: 'Bob Wilson',
      class: '10th',
      section: 'A',
      dateOfBirth: new Date('2008-07-22'),
      parentName: 'Mary Wilson',
      parentPhone: '+1234567891',
      address: '456 Oak Ave, City',
      enrollmentDate: new Date('2023-09-01'),
    },
  });

  const student3 = await prisma.student.create({
    data: {
      userId: users.find(u => u.email === 'student3@school.edu')!.id,
      studentId: 'S003',
      fullName: 'Charlie Davis',
      class: '9th',
      section: 'B',
      dateOfBirth: new Date('2009-03-10'),
      parentName: 'James Davis',
      parentPhone: '+1234567892',
      address: '789 Pine Rd, City',
      enrollmentDate: new Date('2023-09-01'),
    },
  });

  console.log('👩‍🎓 Created students');

  // Create classes
  const class10A = await prisma.class.create({
    data: {
      className: '10th',
      section: 'A',
      teacherId: teacher1.id,
      roomNumber: '101',
    },
  });

  const class9B = await prisma.class.create({
    data: {
      className: '9th',
      section: 'B',
      teacherId: teacher2.id,
      roomNumber: '102',
    },
  });

  console.log('🏫 Created classes');

  // Create subjects
  const subjects = await prisma.subject.createMany({
    data: [
      { name: 'Mathematics', code: 'MATH101', description: 'Algebra and Calculus' },
      { name: 'Science', code: 'SCI101', description: 'Physics and Chemistry' },
      { name: 'English', code: 'ENG101', description: 'Literature and Grammar' },
      { name: 'History', code: 'HIS101', description: 'World History' },
    ],
  });

  console.log('📚 Created subjects');

  // Create attendance records for the past week
  const attendanceRecords = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Student 1 attendance (mostly present)
    attendanceRecords.push({
      studentId: student1.id,
      date,
      status: i === 2 ? AttendanceStatus.absent : AttendanceStatus.present,
      markedBy: teacher1.id,
      remarks: i === 2 ? 'Sick leave' : '',
    });

    // Student 2 attendance (some late)
    attendanceRecords.push({
      studentId: student2.id,
      date,
      status: i === 1 ? AttendanceStatus.late : AttendanceStatus.present,
      markedBy: teacher1.id,
      remarks: i === 1 ? 'Late by 15 minutes' : '',
    });

    // Student 3 attendance
    attendanceRecords.push({
      studentId: student3.id,
      date,
      status: AttendanceStatus.present,
      markedBy: teacher2.id,
      remarks: '',
    });
  }

  await prisma.attendance.createMany({
    data: attendanceRecords,
  });

  console.log('📅 Created attendance records');

  // Create homework
  await prisma.homework.createMany({
    data: [
      {
        teacherId: teacher1.id,
        class: '10th',
        section: 'A',
        subject: 'Mathematics',
        title: 'Algebra Practice',
        description: 'Complete exercises 1-10 from chapter 5',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        teacherId: teacher1.id,
        class: '10th',
        section: 'A',
        subject: 'Mathematics',
        title: 'Geometry Assignment',
        description: 'Solve problems on triangles and circles',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        teacherId: teacher2.id,
        class: '9th',
        section: 'B',
        subject: 'Science',
        title: 'Physics Lab Report',
        description: 'Write report on Newton\'s laws experiment',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
    ],
  });

  console.log('📝 Created homework assignments');

  // Create complaints
  await prisma.complaint.createMany({
    data: [
      {
        fromUserId: student1.userId,
        toUserId: teacher1.userId,
        category: ComplaintCategory.academic,
        message: 'Having difficulty understanding quadratic equations',
        status: ComplaintStatus.pending,
        priority: ComplaintPriority.medium,
      },
      {
        fromUserId: student2.userId,
        toUserId: users.find(u => u.email === 'admin@school.edu')!.id,
        category: ComplaintCategory.facility,
        message: 'Science lab equipment needs maintenance',
        status: ComplaintStatus.in_progress,
        priority: ComplaintPriority.high,
        assignedToId: teacher2.userId,
      },
      {
        fromUserId: student3.userId,
        toUserId: teacher2.userId,
        category: ComplaintCategory.behavior,
        message: 'Issues with group project collaboration',
        status: ComplaintStatus.resolved,
        priority: ComplaintPriority.low,
        resolvedAt: new Date(),
      },
    ],
  });

  console.log('📢 Created complaints');

  // Create results
  const mathSubject = await prisma.subject.findFirst({ where: { code: 'MATH101' } });
  const sciSubject = await prisma.subject.findFirst({ where: { code: 'SCI101' } });
  
  if (mathSubject && sciSubject) {
    await prisma.result.createMany({
      data: [
        {
          studentId: student1.id,
          subjectId: mathSubject.id,
          examType: 'midterm',
          marksObtained: 85,
          totalMarks: 100,
          grade: 'A',
          examDate: new Date('2024-03-15'),
        },
        {
          studentId: student1.id,
          subjectId: sciSubject.id,
          examType: 'midterm',
          marksObtained: 78,
          totalMarks: 100,
          grade: 'B+',
          examDate: new Date('2024-03-20'),
        },
        {
          studentId: student2.id,
          subjectId: mathSubject.id,
          examType: 'midterm',
          marksObtained: 92,
          totalMarks: 100,
          grade: 'A+',
          examDate: new Date('2024-03-15'),
        },
      ],
    });
  }

  console.log('📊 Created exam results');

  // Create fees
  await prisma.fee.createMany({
    data: [
      {
        studentId: student1.id,
        term: 'Q1 2024',
        amount: 5000,
        dueDate: new Date('2024-04-30'),
        paidAmount: 5000,
        paymentStatus: PaymentStatus.paid,
        paymentDate: new Date('2024-04-15'),
        transactionId: 'TX001',
      },
      {
        studentId: student2.id,
        term: 'Q1 2024',
        amount: 5000,
        dueDate: new Date('2024-04-30'),
        paidAmount: 3000,
        paymentStatus: PaymentStatus.partial,
        paymentDate: new Date('2024-04-20'),
        transactionId: 'TX002',
      },
      {
        studentId: student3.id,
        term: 'Q1 2024',
        amount: 5000,
        dueDate: new Date('2024-04-30'),
        paidAmount: 0,
        paymentStatus: PaymentStatus.pending,
      },
    ],
  });

  console.log('💰 Created fee records');

  // Create events
  await prisma.event.createMany({
    data: [
      {
        title: 'Annual Sports Day',
        description: 'School sports competition with various events',
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        eventTime: '09:00',
        location: 'School Ground',
        organizer: 'Sports Committee',
        audience: 'all',
      },
      {
        title: 'Parent-Teacher Meeting',
        description: 'Meeting to discuss student progress',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        eventTime: '14:00',
        location: 'School Auditorium',
        organizer: 'Administration',
        audience: 'parents',
      },
      {
        title: 'Science Fair',
        description: 'Student science projects exhibition',
        eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        eventTime: '10:00',
        location: 'Science Block',
        organizer: 'Science Department',
        audience: 'students',
      },
    ],
  });

  console.log('📅 Created events');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.userId,
        title: 'Homework Due Soon',
        message: 'Mathematics homework due in 3 days',
        type: NotificationType.reminder,
        read: false,
      },
      {
        userId: teacher1.userId,
        title: 'New Complaint',
        message: 'You have a new complaint from Alice Brown',
        type: NotificationType.alert,
        read: true,
      },
      {
        userId: student2.userId,
        title: 'Fee Reminder',
        message: 'Partial payment received. Remaining amount: $2000',
        type: NotificationType.warning,
        read: false,
      },
    ],
  });

  console.log('🔔 Created notifications');

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin: admin@school.edu / admin123');
  console.log('Teacher: teacher1@school.edu / teacher123');
  console.log('Student: student1@school.edu / student123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });