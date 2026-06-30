const { PrismaClient, Role, AttendanceStatus, ComplaintCategory, ComplaintStatus, ComplaintPriority, PaymentStatus, NotificationType } = require('@prisma/client');

const prisma = new PrismaClient();

// Simple hash for demo (in production use proper hashing)
function simpleHash(password) {
  return Buffer.from(password).toString('base64');
}

async function main() {
  console.log('🌱 Starting seed...');

  try {
    // Clear existing data in correct order (respecting foreign key constraints)
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

    // Find user IDs
    const adminUser = users.find(u => u.email === 'admin@school.edu');
    const teacher1User = users.find(u => u.email === 'teacher1@school.edu');
    const teacher2User = users.find(u => u.email === 'teacher2@school.edu');
    const student1User = users.find(u => u.email === 'student1@school.edu');
    const student2User = users.find(u => u.email === 'student2@school.edu');
    const student3User = users.find(u => u.email === 'student3@school.edu');

    // Create teachers
    const teacher1 = await prisma.teacher.create({
      data: {
        userId: teacher1User.id,
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
        userId: teacher2User.id,
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
        userId: student1User.id,
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
        userId: student2User.id,
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
        userId: student3User.id,
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
    await prisma.class.create({
      data: {
        className: '10th',
        section: 'A',
        teacherId: teacher1.id,
        roomNumber: '101',
      },
    });

    await prisma.class.create({
      data: {
        className: '9th',
        section: 'B',
        teacherId: teacher2.id,
        roomNumber: '102',
      },
    });

    console.log('🏫 Created classes');

    // Create subjects
    await prisma.subject.createMany({
      data: [
        { name: 'Mathematics', code: 'MATH101', description: 'Algebra and Calculus' },
        { name: 'Science', code: 'SCI101', description: 'Physics and Chemistry' },
        { name: 'English', code: 'ENG101', description: 'Literature and Grammar' },
        { name: 'History', code: 'HIS101', description: 'World History' },
      ],
    });

    console.log('📚 Created subjects');

    // Create a few attendance records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    await prisma.attendance.createMany({
      data: [
        {
          studentId: student1.id,
          date: today,
          status: AttendanceStatus.present,
          markedBy: teacher1.id,
          remarks: '',
        },
        {
          studentId: student2.id,
          date: today,
          status: AttendanceStatus.late,
          markedBy: teacher1.id,
          remarks: 'Late by 10 minutes',
        },
        {
          studentId: student1.id,
          date: yesterday,
          status: AttendanceStatus.absent,
          markedBy: teacher1.id,
          remarks: 'Sick leave',
        },
      ],
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
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        {
          teacherId: teacher2.id,
          class: '9th',
          section: 'B',
          subject: 'Science',
          title: 'Physics Lab Report',
          description: 'Write report on Newton\'s laws experiment',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    console.log('📝 Created homework assignments');

    // Create complaints
    await prisma.complaint.createMany({
      data: [
        {
          fromUserId: student1User.id,
          toUserId: teacher1User.id,
          category: ComplaintCategory.academic,
          message: 'Having difficulty understanding quadratic equations',
          status: ComplaintStatus.pending,
          priority: ComplaintPriority.medium,
        },
        {
          fromUserId: student2User.id,
          toUserId: adminUser.id,
          category: ComplaintCategory.facility,
          message: 'Science lab equipment needs maintenance',
          status: ComplaintStatus.in_progress,
          priority: ComplaintPriority.high,
          assignedTo: teacher2User.id,
        },
      ],
    });

    console.log('📢 Created complaints');

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
      ],
    });

    console.log('💰 Created fee records');

    // Create events
    await prisma.event.createMany({
      data: [
        {
          title: 'Annual Sports Day',
          description: 'School sports competition with various events',
          eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          eventTime: '09:00',
          location: 'School Ground',
          organizer: 'Sports Committee',
          audience: 'all',
        },
      ],
    });

    console.log('📅 Created events');

    console.log('✅ Seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@school.edu / admin123');
    console.log('Teacher: teacher1@school.edu / teacher123');
    console.log('Student: student1@school.edu / student123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });