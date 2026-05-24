import bcrypt from 'bcrypt';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

function sampleScripts() {
  const scripts: Array<{
    title: string;
    body: string;
    language: string;
    category: string;
    difficulty: string;
    estimatedDurationSeconds: number;
    batchNumber: number;
    orderIndex: number;
  }> = [];

  const batch1 = [
    {
      title: 'Clear Morning Update',
      body:
        'Good morning. This is an AutoBidGo voice training reading. Today, I will speak clearly and at a steady pace.\n\nI am reading every sentence exactly as shown. I will pause briefly between phrases, and I will keep the volume consistent.\n\nThe goal is a clean recording with no background noise, no skipped words, and no added words. If I make a mistake, I will stop and re-record.\n\nThank you for reviewing this submission and for helping AutoBidGo improve the quality of its AI systems.',
      category: 'General',
      difficulty: 'Easy'
    },
    {
      title: 'Navigation Instructions',
      body:
        'In this AutoBidGo reading task, imagine you are giving directions to a friend.\n\nStart at the main entrance of the building. Walk straight for twenty meters until you reach the reception desk. Turn left, and continue down the hallway. The third door on the right is the meeting room.\n\nIf the door is closed, knock once and wait. Speak politely, and introduce yourself before entering.\n\nDirections should be clear, specific, and easy to follow. Maintain a calm and confident tone throughout the recording.',
      category: 'Instructions',
      difficulty: 'Easy'
    },
    {
      title: 'Customer Support Tone',
      body:
        'Hello, and thank you for contacting AutoBidGo support. I understand your concern, and I am here to help.\n\nFirst, please confirm the email address on your account. Next, describe the issue in one sentence. If you can, share when it started and what you have already tried.\n\nWe will review the details and respond with the next steps. If the problem affects urgent work, we can prioritize your request.\n\nThank you for your patience and for contributing to the AutoBidGo training program.',
      category: 'Support',
      difficulty: 'Medium'
    },
    {
      title: 'Reading Numbers and Dates',
      body:
        'This AutoBidGo script helps with numbers, dates, and formatting.\n\nToday is March 14, 2026. The meeting starts at 9:30 a.m. and ends at 11:00 a.m. The total duration is one hour and thirty minutes.\n\nThe project milestone is due on April 2. The reference code is A B G dash 2048.\n\nPlease speak every character clearly, including letters, hyphens, and pauses between segments.',
      category: 'Numeric',
      difficulty: 'Medium'
    },
    {
      title: 'Calm Professional Introduction',
      body:
        'My name is recorded for AutoBidGo. I am speaking naturally, clearly, and without rushing.\n\nI will keep my microphone at a consistent distance. I will avoid tapping, breathing directly into the mic, and moving the device while recording.\n\nThis recording should sound steady and professional. If there is sudden noise, I will re-record before submitting.\n\nAutoBidGo uses approved readings to evaluate speech clarity and improve voice-enabled experiences.',
      category: 'General',
      difficulty: 'Easy'
    },
    {
      title: 'Short Story – The Package',
      body:
        'A small package arrived at the front desk with a handwritten label. The box was light, but it rattled softly when I moved it.\n\nI checked the address twice and signed the delivery form. Then I carried it to the office and placed it carefully on the table.\n\nInside was a note that said, "Open this when you are ready." I took a breath, turned the box over, and looked for a seam.\n\nSome messages arrive quietly, but they still change your day.',
      category: 'Story',
      difficulty: 'Medium'
    },
    {
      title: 'Quality Checklist',
      body:
        'Before I submit this AutoBidGo recording, I will do a quick quality check.\n\nOne: Did I read every line exactly as written?\nTwo: Is the audio clear, with no music, no TV, and no loud background noise?\nThree: Did I maintain a steady speaking pace and a natural tone?\nFour: Are there any long silences or repeated sentences?\n\nIf the recording is not clean, I will delete it and record again. High-quality audio helps AutoBidGo review faster and approve more scripts.',
      category: 'Guidelines',
      difficulty: 'Easy'
    },
    {
      title: 'Workplace Announcement',
      body:
        'Attention everyone. This is a brief workplace announcement.\n\nThe building will undergo maintenance on Friday evening. Please save your work and shut down your computer before leaving. If you have personal items in the shared area, label them clearly.\n\nIf you need after-hours access, contact your manager in advance. Safety is our priority, and the maintenance team will secure all entrances.\n\nThank you for your cooperation and for supporting a smooth schedule.',
      category: 'Announcement',
      difficulty: 'Easy'
    },
    {
      title: 'Tech Summary',
      body:
        'AutoBidGo collects high-quality voice recordings for AI training and evaluation. Each script is designed to test different speaking patterns, from casual conversation to precise instructions.\n\nFor the best results, record in a quiet room and speak clearly. Avoid clipping, echo, and sudden changes in volume.\n\nAfter you submit, an authorized admin will review your audio for clarity, completeness, and accuracy. Approved recordings contribute to better models and unlock earnings for the contributor.\n\nThank you for being part of AutoBidGo.',
      category: 'Technical',
      difficulty: 'Medium'
    },
    {
      title: 'Polite Scheduling',
      body:
        'Hello. I would like to schedule a call at a time that works for you.\n\nAre you available on Tuesday between two and four in the afternoon? If not, please suggest two alternative time windows. I can adjust my schedule and confirm quickly.\n\nWhen we meet, I will share the agenda in advance and keep the discussion focused. If we need more time, we can plan a follow-up session.\n\nThank you. I appreciate your time.',
      category: 'Conversation',
      difficulty: 'Easy'
    }
  ];

  const batch2 = [
    {
      title: 'Product Description',
      body:
        'AutoBidGo is building secure tools that help teams manage structured work at scale. In this reading, focus on crisp consonants and a steady tempo.\n\nThe product experience should feel professional, reliable, and clear. When I speak, I will keep the tone calm and informative.\n\nIf I need to pause, I will pause naturally without long gaps.\n\nThis recording helps AutoBidGo evaluate voice quality across different speaking styles.',
      category: 'General',
      difficulty: 'Easy'
    },
    {
      title: 'Travel Update',
      body:
        'Here is a short travel update. My flight departs at six fifteen in the morning. I plan to arrive at the airport two hours early.\n\nI will bring one carry-on bag and a small backpack. After landing, I will take the train to the city center.\n\nIf there are delays, I will notify the team and share an updated arrival time.\n\nThank you for your flexibility and clear communication.',
      category: 'Story',
      difficulty: 'Easy'
    },
    {
      title: 'Precision Reading',
      body:
        'Please read this sentence carefully: The quick brown fox jumps over the lazy dog.\n\nNow read this one: She sells seashells by the seashore.\n\nNow read this one: Unique New York, unique New York.\n\nThese phrases test clarity and articulation. Maintain a natural voice, but pronounce each word cleanly. This script is part of the AutoBidGo voice training set.',
      category: 'Articulation',
      difficulty: 'Medium'
    },
    {
      title: 'Safety Reminder',
      body:
        'This is a safety reminder. Keep walkways clear and store items away from exits. Report hazards immediately, even if they seem minor.\n\nIf you notice a spill, place a warning sign and notify the appropriate staff. When lifting heavy objects, bend your knees and keep your back straight.\n\nA safe environment protects everyone. Thank you for being attentive and responsible.',
      category: 'Guidelines',
      difficulty: 'Easy'
    },
    {
      title: 'Short Reflection',
      body:
        'Sometimes the best results come from small improvements repeated every day. In this recording, I will focus on steady breathing and consistent volume.\n\nI will avoid rushing at the end of sentences. I will keep the pace comfortable and conversational.\n\nClarity matters more than speed. A clean recording is easier to review and more useful for training.\n\nThis reflection is included in the AutoBidGo script library.',
      category: 'General',
      difficulty: 'Easy'
    },
    {
      title: 'Formal Email Reading',
      body:
        'Subject: Confirmation of next steps.\n\nHello. Thank you for your message. I have reviewed the details and confirmed the timeline. The next step is to complete the requested form and submit it by end of day Thursday.\n\nIf you have questions, reply to this email with the specific section you need help with. I will respond as soon as possible.\n\nKind regards,\nAutoBidGo Team',
      category: 'Business',
      difficulty: 'Medium'
    },
    {
      title: 'Weather Report',
      body:
        'Here is a brief weather report. Skies will be partly cloudy this afternoon with light winds from the west.\n\nTemperatures will peak near twenty-four degrees Celsius. In the evening, expect cooler air and a chance of light rain.\n\nIf you are traveling, allow extra time and keep a jacket nearby.\n\nThank you for listening to this AutoBidGo recording task.',
      category: 'Announcement',
      difficulty: 'Easy'
    },
    {
      title: 'Checking for Accuracy',
      body:
        'Accuracy is important in AutoBidGo voice training. I will read each word exactly as it appears.\n\nIf the script says "cannot," I will not say "can\'t." If the script includes a number, I will read the full number.\n\nAfter recording, I will listen once before submitting. If I hear missing words, repeated phrases, or strong background noise, I will record again.\n\nThis helps ensure faster approvals and consistent results.',
      category: 'Guidelines',
      difficulty: 'Medium'
    },
    {
      title: 'Simple Dialogue',
      body:
        'Person A: Hi. Are you free to talk for a minute?\nPerson B: Yes, but I only have a short window.\nPerson A: No problem. I have two quick questions and then I will let you go.\nPerson B: Go ahead.\n\nRead this dialogue with natural timing, but keep the audio clean and evenly paced. This is an AutoBidGo script used to capture conversational rhythm.',
      category: 'Conversation',
      difficulty: 'Easy'
    },
    {
      title: 'Closing Statement',
      body:
        'This is the final script in this set. I will finish with the same clarity and attention as the first recording.\n\nThank you for reviewing my work. I appreciate the opportunity to contribute to AutoBidGo.\n\nI confirm that this audio is my own voice, recorded in real time, with no synthetic voice tools.\n\nI will submit only clean, complete recordings that follow the guidelines.',
      category: 'General',
      difficulty: 'Easy'
    }
  ];

  const build = (items: typeof batch1, batchNumber: number) => {
    items.forEach((s, i) => {
      scripts.push({
        title: s.title,
        body: s.body,
        language: 'English',
        category: s.category,
        difficulty: s.difficulty,
        estimatedDurationSeconds: 60,
        batchNumber,
        orderIndex: i + 1
      });
    });
  };

  build(batch1, 1);
  build(batch2, 2);
  return scripts;
}

async function main() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'Admin123!';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRole.admin,
      status: UserStatus.active,
      mustChangePassword: false,
      passwordHash
    },
    create: {
      role: UserRole.admin,
      email: adminEmail,
      passwordHash,
      mustChangePassword: false,
      isProfileComplete: true,
      status: UserStatus.active
    }
  });

  await prisma.adminContact.upsert({
    where: { id: 'seed-admin-contact' },
    update: {
      adminId: admin.id,
      displayName: 'AutoBidGo Admin Team',
      email: 'admin@example.com',
      phone: '+1 555-0100',
      whatsapp: '+1 555-0100',
      isActive: true
    },
    create: {
      id: 'seed-admin-contact',
      adminId: admin.id,
      displayName: 'AutoBidGo Admin Team',
      email: 'admin@example.com',
      phone: '+1 555-0100',
      whatsapp: '+1 555-0100',
      isActive: true
    }
  });

  const scripts = sampleScripts();
  for (const s of scripts) {
    await prisma.script.upsert({
      where: {
        // composite unique not defined; simulate unique with batch+order for seed
        id: `${s.batchNumber}-${s.orderIndex}`
      },
      update: {
        title: s.title,
        body: s.body,
        language: s.language,
        category: s.category,
        difficulty: s.difficulty,
        estimatedDurationSeconds: s.estimatedDurationSeconds,
        batchNumber: s.batchNumber,
        orderIndex: s.orderIndex,
        isActive: true
      },
      create: {
        id: `${s.batchNumber}-${s.orderIndex}`,
        title: s.title,
        body: s.body,
        language: s.language,
        category: s.category,
        difficulty: s.difficulty,
        estimatedDurationSeconds: s.estimatedDurationSeconds,
        batchNumber: s.batchNumber,
        orderIndex: s.orderIndex,
        isActive: true
      }
    });
  }

  console.log('Seed complete:', { adminEmail, adminPassword, scripts: scripts.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
