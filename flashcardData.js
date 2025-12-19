const flashcardData = [
  {
    id: 1,
    korean: "안녕하세요",
    romanization: "annyeonghaseyo",
    english: "Hello",
    koreanAudio: "audio/hello_ko.mp3",
    englishAudio: "audio/hello_en.mp3",
  },
  {
    id: 2,
    korean: "안녕",
    romanization: "annyeong",
    english: "Hi / Hello (casual)",
    koreanAudio: "audio/Hi_ko.mp3",
    englishAudio: "audio/Hi_en.mp3",
  },
  {
    id: 3,
    korean: "감사합니다",
    romanization: "gamsahamnida",
    english: "Thank you",
    koreanAudio: "audio/thank_you_ko.mp3",
    englishAudio: "audio/thank_you_en.mp3",
  },
  {
    id: 4,
    korean: "죄송합니다",
    romanization: "joesonghamnida",
    english: "I'm sorry",
    koreanAudio: "audio/i'm_sorry_ko.mp3",
    englishAudio: "audio/i'm_sorry_en.mp3",
  },
  {
    id: 5,
    korean: "사랑",
    romanization: "sarang",
    english: "Love",
    koreanAudio: "audio/love_ko.mp3",
    englishAudio: "audio/love_en.mp3",
  },
  {
    id: 6,
    korean: "어디",
    romanization: "eodi",
    english: "Where",
    koreanAudio: "audio/where_ko.mp3",
    englishAudio: "audio/where_en.mp3",
  },
  {
    id: 7,
    korean: "뭐",
    romanization: "mwo",
    english: "What",
    koreanAudio: "audio/what_ko.mp3",
    englishAudio: "audio/what_en.mp3",
  },
  {
    id: 8,
    korean: "친구",
    romanization: "chingu",
    english: "Friend",
    koreanAudio: "audio/friend_ko.mp3",
    englishAudio: "audio/friend_en.mp3",
  },
  {
    id: 9,
    korean: "가족",
    romanization: "gajok",
    english: "Family",
    koreanAudio: "audio/family_ko.mp3",
    englishAudio: "audio/family_en.mp3",
  },
  {
    id: 10,
    korean: "학교",
    romanization: "hakgyo",
    english: "School",
    koreanAudio: "audio/school_ko.mp3",
    englishAudio: "audio/school_en.mp3",
  },
  {
    id: 11,
    korean: "집",
    romanization: "jip",
    english: "Home",
    koreanAudio: "audio/home_ko.mp3",
    englishAudio: "audio/home_en.mp3",
  },
  {
    id: 12,
    korean: "음식",
    romanization: "eumsik",
    english: "Food",
    koreanAudio: "audio/food_ko.mp3",
    englishAudio: "audio/food_en.mp3",
  },
  {
    id: 13,
    korean: "물",
    romanization: "mul",
    english: "Water",
    koreanAudio: "audio/water_ko.mp3",
    englishAudio: "audio/water_en.mp3",
  },
  {
    id: 14,
    korean: "책",
    romanization: "chaek",
    english: "Book",
    koreanAudio: "audio/book_ko.mp3",
    englishAudio: "audio/book_en.mp3",
  },
  {
    id: 15,
    korean: "시간",
    romanization: "sigan",
    english: "Time",
    koreanAudio: "audio/time_ko.mp3",
    englishAudio: "audio/time_en.mp3",
  },
  {
    id: 16,
    korean: "아름다운",
    romanization: "areumdaun",
    english: "Beautiful",
    koreanAudio: "audio/beautiful_ko.mp3",
    englishAudio: "audio/beautiful_en.mp3",
  },
  {
    id: 17,
    korean: "좋아요",
    romanization: "joayo",
    english: "I like it / Good",
    koreanAudio: "audio/good_ko.mp3",
    englishAudio: "audio/good_en.mp3",
  },
  {
    id: 18,
    korean: "네",
    romanization: "ne",
    english: "Yes",
    koreanAudio: "audio/yes_ko.mp3",
    englishAudio: "audio/yes_en.mp3",
  },
  {
    id: 19,
    korean: "아니요",
    romanization: "aniyo",
    english: "No",
    koreanAudio: "audio/no_ko.mp3",
    englishAudio: "audio/no_en.mp3",
  },
  {
    id: 20,
    korean: "알다",
    romanization: "alda",
    english: "To know (dictionary form)",
    koreanAudio: "audio/to_know_ko.mp3",
    englishAudio: "audio/to_know_en.mp3",
  },
  {
    id: 21,
    korean: "알았어",
    romanization: "arasseo",
    english: "Okay / Got it (casual)",
    koreanAudio: "audio/okay_ko.mp3",
    englishAudio: "audio/okay_en.mp3",
  },
  {
    id: 22,
    korean: "누구",
    romanization: "nugu",
    english: "Who",
    koreanAudio: "audio/who_ko.mp3",
    englishAudio: "audio/who_en.mp3",
  },
  {
    id: 23,
    korean: "그러다",
    romanization: "geureoda",
    english: "To be so / To do so (dictionary form)",
    koreanAudio: "audio/to_do_so_ko.mp3",
    englishAudio: "audio/to_do_so_en.mp3",
  },
  {
    id: 24,
    korean: "그래",
    romanization: "geurae",
    english: "Okay / You’re right (casual)",
    koreanAudio: "audio/alright_ko.mp3",
    englishAudio: "audio/alright_en.mp3",
  },
  {
    id: 25,
    korean: "아이고",
    romanization: "aigo",
    english: "Oh no / Oh my (exclamation)",
    koreanAudio: "audio/oh_no_ko.mp3",
    englishAudio: "audio/oh_no_en.mp3",
  },
  {
    id: 26,
    korean: "아이구",
    romanization: "aigu",
    english: "Oh dear / Geez (variant of 아이고)",
    koreanAudio: "audio/oh_dear_ko.mp3",
    englishAudio: "audio/oh_dear_en.mp3",
  },
  {
    id: 27,
    korean: "괜찮아",
    romanization: "gwaenchan-a",
    english: "It’s okay / I’m fine (casual)",
    koreanAudio: "audio/it's_okay_ko.mp3",
    englishAudio: "audio/it's_okay_en.mp3",
  },
  {
    id: 28,
    korean: "가요",
    romanization: "gayo",
    english: "go",
    koreanAudio: "audio/go_ko.mp3",
    englishAudio: "audio/go_en.mp3",
  },
  {
    id: 29,
    korean: "와요",
    romanization: "wayo",
    english: "come",
    koreanAudio: "audio/come_ko.mp3",
    englishAudio: "audio/come_en.mp3",
  },
  {
    id: 30,
    korean: "먹어요",
    romanization: "meogeoyo",
    english: "eat",
    koreanAudio: "audio/eat_ko.mp3",
    englishAudio: "audio/eat_en.mp3",
  },
  {
    id: 31,
    korean: "마셔요",
    romanization: "masyeoyo",
    english: "drink",
    koreanAudio: "audio/drink_ko.mp3",
    englishAudio: "audio/drink_en.mp3",
  },
  {
    id: 32,
    korean: "봐요",
    romanization: "bwayo",
    english: "see",
    koreanAudio: "audio/see_ko.mp3",
    englishAudio: "audio/see_en.mp3",
  },
  {
    id: 33,
    korean: "들어요",
    romanization: "deureoyo",
    english: "listen",
    koreanAudio: "audio/listen_ko.mp3",
    englishAudio: "audio/listen_en.mp3",
  },
  {
    id: 34,
    korean: "말해요",
    romanization: "malhaeyo",
    english: "speak",
    koreanAudio: "audio/speak_ko.mp3",
    englishAudio: "audio/speak_en.mp3",
  },
  {
    id: 35,
    korean: "배워요",
    romanization: "baewoyo",
    english: "learn",
    koreanAudio: "audio/learn_ko.mp3",
    englishAudio: "audio/learn_en.mp3",
  },
  {
    id: 36,
    korean: "알아요",
    romanization: "arayo",
    english: "know",
    koreanAudio: "audio/know_ko.mp3",
    englishAudio: "audio/know_en.mp3",
  },
  {
    id: 37,
    korean: "몰라요",
    romanization: "mollayo",
    english: "don't know",
    koreanAudio: "audio/dont_know_ko.mp3",
    englishAudio: "audio/dont_know_en.mp3",
  },
  {
    id: 38,
    korean: "줘요",
    romanization: "jwoyo",
    english: "give",
    koreanAudio: "audio/give_ko.mp3",
    englishAudio: "audio/give_en.mp3",
  },
  {
    id: 39,
    korean: "기다려요",
    romanization: "gidaryeoyo",
    english: "wait",
    koreanAudio: "audio/wait_ko.mp3",
    englishAudio: "audio/wait_en.mp3",
  },
  {
    id: 40,
    korean: "좋아해요",
    romanization: "joahaeyo",
    english: "like",
    koreanAudio: "audio/like_ko.mp3",
    englishAudio: "audio/like_en.mp3",
  },
  {
    id: 41,
    korean: "사랑해요",
    romanization: "saranghaeyo",
    english: "love",
    koreanAudio: "audio/love_pc_ko.mp3",
    englishAudio: "audio/love_pc_en.mp3",
  },
  {
    id: 42,
    korean: "일해요",
    romanization: "ilhaeyo",
    english: "work",
    koreanAudio: "audio/work_ko.mp3",
    englishAudio: "audio/work_en.mp3",
  },
];

// Spaced repetition update function for Easy/Medium/Hard ratings
function updateSpacedRepetition(card, rating) {
  if (!card.easeFactor) card.easeFactor = 2.5;
  if (!card.interval) card.interval = 1;
  if (!card.repetition) card.repetition = 0;

  let q;
  if (rating === "easy") q = 5;
  else if (rating === "medium") q = 3;
  else q = 1; // hard

  if (q >= 3) {
    if (card.repetition === 0) card.interval = 1;
    else if (card.repetition === 1) card.interval = 6;
    else card.interval = Math.round(card.interval * card.easeFactor);
    card.repetition += 1;
  } else {
    card.repetition = 0;
    card.interval = 1;
  }

  card.easeFactor = Math.max(
    1.3,
    card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  const now = new Date();
  card.dueDate = new Date(now.setDate(now.getDate() + card.interval));
  return card;
}

// Example usage:
// updateSpacedRepetition(flashcardData[0], "easy");
