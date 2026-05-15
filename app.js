(() => {
  "use strict";

  const STORAGE_KEY = "nadritalk.web.v2";
  const APP_VERSION = "20260516bc";
  const REALTIME_REFRESH_MS = 15 * 60 * 1000;
  const REALTIME_STALE_MS = 10 * 60 * 1000;
  const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
  const STATUS_LABELS = {
    onsite: "현지에 있어요",
    going: "가는 중이에요",
    visited: "다녀왔어요"
  };
  const REWARD_POINTS = {
    chat: 10,
    photo: 30,
    highlight: 25,
    like: 5
  };
  const PRICE_PRESETS = [0, 20000, 50000, 100000];
  const WEATHER_CODE_LABELS = new Map([
    [0, "맑음"],
    [1, "대체로 맑음"],
    [2, "구름 조금"],
    [3, "흐림"],
    [45, "안개"],
    [48, "안개"],
    [51, "이슬비"],
    [53, "이슬비"],
    [55, "이슬비"],
    [61, "비"],
    [63, "비"],
    [65, "강한 비"],
    [71, "눈"],
    [73, "눈"],
    [75, "강한 눈"],
    [80, "소나기"],
    [81, "소나기"],
    [82, "강한 소나기"],
    [95, "뇌우"],
    [96, "뇌우"],
    [99, "뇌우"]
  ]);

  const seedPlaces = [
    {
      id: "p-museum",
      name: "서울상상나라",
      category: "어린이 박물관",
      region: "서울 광진",
      address: "서울 광진구 능동로 216 어린이대공원 안",
      phone: "02-6450-9500",
      latitude: 37.5498,
      longitude: 127.0818,
      distanceKm: 6.4,
      indoorOutdoor: "indoor",
      cost: "paid",
      ageBand: "3-8세",
      ageMin: 3,
      ageMax: 8,
      agePolicy: {
        admission: { minAge: 0, maxAge: 12, label: "어린이 동반 입장 가능" },
        facility: { minAge: 3, maxAge: 8, label: "주요 체험 권장 3-8세" },
        discounts: [
          { minAge: 0, maxAge: 2, label: "36개월 미만 무료 대상" },
          { minAge: 3, maxAge: 12, label: "어린이 요금 적용" }
        ]
      },
      interests: ["체험", "미술", "역할놀이"],
      image: "assets/place-museum.webp",
      imageCredit: "Pexels / Daka",
      rating: 4.7,
      hours: "10:00-18:00, 월요일 휴관",
      price: "어린이 4,000원, 보호자 4,000원",
      priceRange: { min: 4000, max: 4000, label: "1인 4천원" },
      description: "영유아부터 초등 저학년까지 손으로 만지고 움직이며 놀 수 있는 체험형 전시 공간입니다.",
      facilities: {
        parking: "어린이대공원 주차장 이용",
        stroller: "전 구역 가능",
        nursing: "수유실 있음",
        food: "주변 매점, 카페"
      },
      tips: ["오전 첫 타임 추천", "사전 예약 확인", "여벌 옷 준비"],
      crowd: "보통",
      talkActive: 18,
      favoriteCount: 42,
      mapX: 58,
      mapY: 30
    },
    {
      id: "p-park",
      name: "노을가족공원",
      category: "야외 공원",
      region: "서울 마포",
      address: "서울 마포구 하늘공원로 108",
      phone: "02-300-5501",
      latitude: 37.5683,
      longitude: 126.8786,
      distanceKm: 3.1,
      indoorOutdoor: "outdoor",
      cost: "free",
      ageBand: "4-12세",
      ageMin: 4,
      ageMax: 12,
      agePolicy: {
        admission: { minAge: 0, maxAge: null, label: "연령 제한 없이 입장 가능" },
        facility: { minAge: 4, maxAge: 12, label: "산책, 잔디 놀이 권장 4-12세" },
        discounts: [
          { minAge: 0, maxAge: null, label: "입장 무료" }
        ]
      },
      interests: ["자연", "산책", "자전거"],
      image: "assets/place-park.webp",
      imageCredit: "Pixabay / khangptruong",
      rating: 4.5,
      hours: "상시 개방, 일부 시설 계절 운영",
      price: "무료",
      priceRange: { min: 0, max: 0, label: "무료" },
      description: "넓은 잔디와 산책로가 있어 뛰어놀기 좋고, 해 질 무렵 가족 사진을 남기기 좋은 야외 장소입니다.",
      facilities: {
        parking: "공영주차장 있음",
        stroller: "주요 동선 가능",
        nursing: "수유실 제한적",
        food: "간식 지참 권장"
      },
      tips: ["바람막이 준비", "오후 주차 혼잡", "돗자리 추천"],
      crowd: "여유",
      talkActive: 9,
      favoriteCount: 31,
      mapX: 34,
      mapY: 58
    },
    {
      id: "p-science",
      name: "부천어린이과학관",
      category: "과학 체험",
      region: "경기 부천",
      address: "경기 부천시 길주로 660",
      phone: "032-625-3500",
      latitude: 37.5037,
      longitude: 126.8021,
      distanceKm: 18.2,
      indoorOutdoor: "indoor",
      cost: "paid",
      ageBand: "6-12세",
      ageMin: 6,
      ageMax: 12,
      agePolicy: {
        admission: { minAge: 0, maxAge: null, label: "보호자 동반 입장 가능" },
        facility: { minAge: 6, maxAge: 12, label: "실험, 전시 체험 권장 6-12세" },
        discounts: [
          { minAge: 0, maxAge: 6, label: "미취학 요금 확인 필요" },
          { minAge: 7, maxAge: 12, label: "어린이 요금 적용" }
        ]
      },
      interests: ["과학", "실험", "로봇"],
      image: "assets/place-science.webp",
      imageCredit: "Pixabay / adventurous_blondine",
      rating: 4.6,
      hours: "09:30-17:30, 월요일 휴관",
      price: "어린이 3,000원, 보호자 4,000원",
      priceRange: { min: 3000, max: 4000, label: "1인 3천-4천원" },
      description: "초등 아이가 좋아하는 실험, 우주, 공룡 콘텐츠를 짧은 동선 안에서 경험할 수 있습니다.",
      facilities: {
        parking: "건물 주차 가능",
        stroller: "가능",
        nursing: "1층 안내데스크 문의",
        food: "근처 식당가"
      },
      tips: ["실험 프로그램 선착순", "초등 저학년 이상 추천", "비 오는 날 대체 코스"],
      crowd: "혼잡",
      talkActive: 24,
      favoriteCount: 58,
      mapX: 72,
      mapY: 68
    },
    {
      id: "p-playroom",
      name: "문래키즈스튜디오",
      category: "실내 놀이",
      region: "서울 영등포",
      address: "서울 영등포구 문래로 89",
      phone: "02-2670-0000",
      latitude: 37.5172,
      longitude: 126.8946,
      distanceKm: 1.7,
      indoorOutdoor: "indoor",
      cost: "paid",
      ageBand: "2-6세",
      ageMin: 2,
      ageMax: 6,
      agePolicy: {
        admission: { minAge: 1, maxAge: 7, label: "영유아 동반 입장 가능" },
        facility: { minAge: 2, maxAge: 6, label: "놀이 시설 권장 2-6세" },
        discounts: [
          { minAge: 1, maxAge: 1, label: "영아 이용 조건 확인" },
          { minAge: 2, maxAge: 6, label: "어린이 기본요금 적용" }
        ]
      },
      interests: ["실내놀이", "역할놀이", "미술"],
      image: "assets/place-playroom.webp",
      imageCredit: "Pexels / BI ravencrow",
      rating: 4.4,
      hours: "10:00-19:00, 예약제",
      price: "2시간 15,000원부터",
      priceRange: { min: 15000, max: 25000, label: "2시간 1.5만원부터" },
      description: "미취학 아이에게 맞춘 조용한 실내 놀이 공간입니다. 보호자 휴식 좌석이 충분합니다.",
      facilities: {
        parking: "건물 내 1시간 지원",
        stroller: "입구 보관",
        nursing: "작은 수유 공간",
        food: "보호자 음료 가능"
      },
      tips: ["예약 10분 전 도착", "평일 오전 여유", "양말 착용"],
      crowd: "보통",
      talkActive: 15,
      favoriteCount: 36,
      mapX: 44,
      mapY: 43
    },
    {
      id: "p-sports",
      name: "한강어린이스포츠마당",
      category: "체육 놀이",
      region: "서울 송파",
      address: "서울 송파구 올림픽로 424",
      phone: "02-410-1114",
      latitude: 37.5207,
      longitude: 127.1215,
      distanceKm: 12.6,
      indoorOutdoor: "outdoor",
      cost: "free",
      ageBand: "5-12세",
      ageMin: 5,
      ageMax: 12,
      agePolicy: {
        admission: { minAge: 0, maxAge: null, label: "연령 제한 없이 입장 가능" },
        facility: { minAge: 5, maxAge: 12, label: "체육 놀이 권장 5-12세" },
        discounts: [
          { minAge: 0, maxAge: null, label: "입장 무료" }
        ]
      },
      interests: ["체육", "자전거", "야외놀이"],
      image: "assets/place-park.webp",
      imageCredit: "Pixabay / khangptruong",
      rating: 4.2,
      hours: "09:00-18:00, 우천 시 일부 제한",
      price: "무료",
      priceRange: { min: 0, max: 0, label: "무료" },
      description: "가볍게 뛰고 자전거를 타며 에너지를 쓰기 좋은 야외 체육 놀이 공간입니다.",
      facilities: {
        parking: "공영주차장 이용",
        stroller: "주요 동선 가능",
        nursing: "인근 안내소 문의",
        food: "간식 지참 권장"
      },
      tips: ["운동화 추천", "물 챙기기", "오전 시간 여유"],
      crowd: "보통",
      talkActive: 5,
      favoriteCount: 17,
      mapX: 52,
      mapY: 64
    },
    {
      id: "p-show",
      name: "어린이주말극장",
      category: "공연",
      region: "서울 종로",
      address: "서울 종로구 대학로 57",
      phone: "02-745-0000",
      latitude: 37.5806,
      longitude: 127.0037,
      distanceKm: 9.8,
      indoorOutdoor: "indoor",
      cost: "paid",
      ageBand: "4-10세",
      ageMin: 4,
      ageMax: 10,
      agePolicy: {
        admission: { minAge: 4, maxAge: 12, label: "4세 이상 관람 권장" },
        facility: { minAge: 4, maxAge: 10, label: "아동 공연 권장 4-10세" },
        discounts: [
          { minAge: 4, maxAge: 12, label: "어린이 예매가 확인" }
        ]
      },
      interests: ["공연", "음악", "역할놀이"],
      image: "assets/place-art.webp",
      imageCredit: "Pixabay / RosieKliskey",
      rating: 4.4,
      hours: "토/일 공연 시간별 운영",
      price: "어린이 12,000원부터",
      priceRange: { min: 12000, max: 25000, label: "1.2만원부터" },
      description: "짧은 러닝타임의 어린이 공연을 중심으로 주말 실내 나들이에 맞춘 공간입니다.",
      facilities: {
        parking: "인근 공영주차장 이용",
        stroller: "입구 보관",
        nursing: "공연장 문의",
        food: "공연장 내 음식 제한"
      },
      tips: ["공연 시작 20분 전 도착", "좌석 예매 확인", "소음 민감한 아이는 자리 선택"],
      crowd: "보통",
      talkActive: 7,
      favoriteCount: 24,
      mapX: 48,
      mapY: 34
    },
    {
      id: "p-etc",
      name: "동네나들이라운지",
      category: "기타",
      region: "서울 성동",
      address: "서울 성동구 왕십리로 100",
      phone: "02-2200-0000",
      latitude: 37.5464,
      longitude: 127.0445,
      distanceKm: 7.9,
      indoorOutdoor: "indoor",
      cost: "paid",
      ageBand: "3-12세",
      ageMin: 3,
      ageMax: 12,
      agePolicy: {
        admission: { minAge: 0, maxAge: null, label: "보호자 동반 입장 가능" },
        facility: { minAge: 3, maxAge: 12, label: "복합 활동 권장 3-12세" },
        discounts: [
          { minAge: 0, maxAge: 2, label: "영유아 요금 확인 필요" },
          { minAge: 3, maxAge: 12, label: "어린이 요금 적용" }
        ]
      },
      interests: ["체험", "휴식", "실내놀이"],
      image: "assets/place-playroom.webp",
      imageCredit: "Pexels / BI ravencrow",
      rating: 4.1,
      hours: "10:00-18:00",
      price: "어린이 8,000원부터",
      priceRange: { min: 8000, max: 15000, label: "8천원부터" },
      description: "작은 놀이, 책, 휴식 공간이 섞인 복합형 가족 나들이 공간입니다.",
      facilities: {
        parking: "건물 주차 확인 필요",
        stroller: "가능",
        nursing: "문의 필요",
        food: "간단 음료 가능"
      },
      tips: ["사전 운영 여부 확인", "짧은 방문에 적합", "실내 대체 코스"],
      crowd: "여유",
      talkActive: 4,
      favoriteCount: 12,
      mapX: 39,
      mapY: 39
    },
    {
      id: "p-art",
      name: "작은미술탐험관",
      category: "예술 체험",
      region: "경기 용인",
      address: "경기 용인시 수지구 포은대로 499",
      phone: "031-260-3300",
      latitude: 37.3223,
      longitude: 127.0952,
      distanceKm: 28.4,
      indoorOutdoor: "indoor",
      cost: "paid",
      ageBand: "3-9세",
      ageMin: 3,
      ageMax: 9,
      agePolicy: {
        admission: { minAge: 0, maxAge: null, label: "보호자 동반 입장 가능" },
        facility: { minAge: 3, maxAge: 9, label: "관찰, 미술 체험 권장 3-9세" },
        discounts: [
          { minAge: 0, maxAge: 2, label: "영유아 요금 확인 필요" },
          { minAge: 3, maxAge: 12, label: "어린이 요금 적용" }
        ]
      },
      interests: ["미술", "관찰", "역할놀이"],
      image: "assets/place-art.webp",
      imageCredit: "Pixabay / RosieKliskey",
      rating: 4.3,
      hours: "10:30-18:00",
      price: "어린이 5,000원",
      priceRange: { min: 5000, max: 5000, label: "어린이 5천원" },
      description: "아이 눈높이에 맞춘 작은 전시와 관찰형 놀이가 결합된 실내 문화 체험 장소입니다.",
      facilities: {
        parking: "주차 가능",
        stroller: "일부 구간 제한",
        nursing: "문의 필요",
        food: "외부 음식 제한"
      },
      tips: ["전시 설명 시간 확인", "조용한 관람 가능", "사진 촬영 구역 확인"],
      crowd: "여유",
      talkActive: 6,
      favoriteCount: 19,
      mapX: 63,
      mapY: 52
    }
  ];

  const seedReviews = [
    {
      id: "r-1",
      placeId: "p-museum",
      author: "하준맘",
      rating: 5,
      childAge: "5세",
      summary: "체험이 많아서 두 시간이 금방 갔어요.",
      body: "예약하고 오전에 갔더니 대기가 거의 없었습니다. 유모차 동선도 편했고 아이가 역할놀이 구역을 가장 좋아했어요.",
      checklist: ["주차 보통", "청결 좋음", "아이 만족 높음"],
      verified: true,
      createdAt: "2026-05-11T09:30:00.000Z"
    },
    {
      id: "r-2",
      placeId: "p-park",
      author: "주말아빠",
      rating: 4,
      childAge: "8세",
      summary: "뛰어놀기 좋지만 바람이 강합니다.",
      body: "돗자리와 바람막이는 꼭 챙기세요. 주차는 오후가 되면 자리가 빠르게 줄어듭니다.",
      checklist: ["주차 보통", "대기 없음", "야외 만족"],
      verified: false,
      createdAt: "2026-05-10T05:20:00.000Z"
    },
    {
      id: "r-3",
      placeId: "p-science",
      author: "민서네",
      rating: 5,
      childAge: "9세",
      summary: "초등 아이가 직접 해볼 수 있어요.",
      body: "로봇 체험은 사전 확인이 필요합니다. 내부 동선은 짧지만 전시 밀도가 높아서 집중해서 보기 좋았습니다.",
      checklist: ["주차 좋음", "체험 좋음", "혼잡 보통"],
      verified: true,
      createdAt: "2026-05-09T12:04:00.000Z"
    }
  ];

  const seedMessages = [
    {
      id: "m-1",
      placeId: "p-museum",
      author: "현장체크",
      status: "onsite",
      verified: true,
      text: "지금 2층 체험존은 대기 10분 정도입니다. 유모차는 입구 쪽에 많이 세워두고 있어요.",
      createdAt: "2026-05-14T01:20:00.000Z",
      hidden: false,
      likes: 8
    },
    {
      id: "m-2",
      placeId: "p-museum",
      author: "도착중",
      status: "going",
      verified: false,
      text: "주차장 진입 줄이 있는지 아시는 분 있을까요?",
      createdAt: "2026-05-14T01:24:00.000Z",
      hidden: false,
      likes: 1
    },
    {
      id: "m-5",
      placeId: "p-museum",
      author: "서윤아빠",
      status: "visited",
      verified: true,
      text: "어제 오후 3시쯤은 1층 물놀이 체험 쪽이 붐볐고, 4층은 비교적 여유 있었습니다.",
      createdAt: "2026-05-13T06:12:00.000Z",
      hidden: false,
      likes: 5
    },
    {
      id: "m-6",
      placeId: "p-museum",
      author: "쌍둥이맘",
      status: "visited",
      verified: true,
      text: "수유실은 깨끗했고 전자레인지도 사용할 수 있었어요. 점심 전후에는 엘리베이터 대기가 조금 있습니다.",
      createdAt: "2026-05-13T03:40:00.000Z",
      hidden: false,
      likes: 7
    },
    {
      id: "m-7",
      placeId: "p-museum",
      author: "현장체크",
      status: "onsite",
      verified: true,
      text: "오늘 오전 첫 타임은 입장 줄이 짧습니다. 예약 확인 화면만 미리 열어두면 바로 들어가요.",
      createdAt: "2026-05-14T00:05:00.000Z",
      hidden: false,
      likes: 6
    },
    {
      id: "m-8",
      placeId: "p-museum",
      author: "라온네",
      status: "going",
      verified: false,
      text: "어린이대공원 정문 쪽 주차장보다 후문 쪽이 조금 빠르다는 안내를 받았습니다.",
      createdAt: "2026-05-14T00:42:00.000Z",
      hidden: false,
      likes: 3
    },
    {
      id: "m-9",
      placeId: "p-museum",
      author: "다녀온집",
      status: "visited",
      verified: true,
      text: "미술 체험은 옷에 묻을 수 있어서 여벌 상의가 있으면 마음이 편합니다.",
      createdAt: "2026-05-12T09:15:00.000Z",
      hidden: false,
      likes: 4
    },
    {
      id: "m-3",
      placeId: "p-science",
      author: "다녀온집",
      status: "visited",
      verified: true,
      text: "실험 프로그램은 오늘 오전 회차가 마감됐고 오후 회차는 현장 대기 받는다고 안내받았습니다.",
      createdAt: "2026-05-14T00:55:00.000Z",
      hidden: false,
      likes: 9
    },
    {
      id: "m-4",
      placeId: "p-playroom",
      author: "문래거주",
      status: "onsite",
      verified: true,
      text: "현재 내부는 여유 있습니다. 두 돌 아이도 놀 만한 낮은 구조물이 많아요.",
      createdAt: "2026-05-14T01:10:00.000Z",
      hidden: false,
      likes: 4
    }
  ];

  const seedMessageLikes = new Map(seedMessages.map((message) => [message.id, message.likes || 0]));

  const defaultState = {
    user: null,
    children: [],
    savedPlaceIds: [],
    extraPlaces: [],
    reviews: seedReviews,
    messages: seedMessages,
    likedMessageIds: [],
    rewardedLikeIds: [],
    creatorRewardPoints: {},
    creatorRewardLog: [],
    rewardPoints: 0,
    rewardLog: [],
    reports: [],
    realtime: {
      weatherByPlaceId: {},
      updatedAt: "",
      source: "Open-Meteo",
      status: "idle",
      error: ""
    }
  };

  const ui = {
    view: "home",
    selectedPlaceId: "p-museum",
    detailTab: "info",
    query: "",
    filters: {
      age: "profile",
      indoorOutdoor: "all",
      priceMin: "",
      priceMax: "",
      priceOptions: [],
      category: "all"
    },
    chatStatus: "going",
    aiQuestion: "",
    aiQuestionMessageId: "",
    recommendationPage: 0,
    rewardExpanded: false
  };

  const main = document.querySelector("#main-content");
  const toast = document.querySelector("#toast");
  const headerUserLabel = document.querySelector("#headerUserLabel");
  const installButton = document.querySelector("#installButton");
  let installPromptEvent = null;
  let toastTimer = null;
  let state = loadState();

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return structuredClone(defaultState);
      const parsed = JSON.parse(stored);
      return {
        ...structuredClone(defaultState),
        ...parsed,
        children: Array.isArray(parsed.children) ? parsed.children : [],
        savedPlaceIds: Array.isArray(parsed.savedPlaceIds) ? parsed.savedPlaceIds : [],
        extraPlaces: Array.isArray(parsed.extraPlaces) ? parsed.extraPlaces : [],
        reviews: normalizeReviews(Array.isArray(parsed.reviews) ? parsed.reviews : seedReviews),
        messages: normalizeMessages(Array.isArray(parsed.messages) ? parsed.messages : seedMessages),
        likedMessageIds: Array.isArray(parsed.likedMessageIds) ? parsed.likedMessageIds : [],
        rewardedLikeIds: Array.isArray(parsed.rewardedLikeIds) ? parsed.rewardedLikeIds : [],
        creatorRewardPoints: parsed.creatorRewardPoints && typeof parsed.creatorRewardPoints === "object" ? parsed.creatorRewardPoints : {},
        creatorRewardLog: Array.isArray(parsed.creatorRewardLog) ? parsed.creatorRewardLog : [],
        rewardPoints: Number.isFinite(Number(parsed.rewardPoints)) ? Number(parsed.rewardPoints) : 0,
        rewardLog: Array.isArray(parsed.rewardLog) ? parsed.rewardLog : [],
        reports: normalizeReports(Array.isArray(parsed.reports) ? parsed.reports : []),
        realtime: normalizeRealtime(parsed.realtime)
      };
    } catch (error) {
      console.warn("Saved state could not be loaded.", error);
      return structuredClone(defaultState);
    }
  }

  function normalizeMessages(messages) {
    return messages.map((message) => ({
      ...message,
      hidden: Boolean(message.hidden),
      likes: Number.isFinite(Number(message.likes)) ? Number(message.likes) : seedMessageLikes.get(message.id) || 0
    }));
  }

  function normalizeReviews(reviews) {
    return reviews.map((review) => ({
      ...review,
      checklist: Array.isArray(review.checklist) ? review.checklist : [],
      hidden: Boolean(review.hidden),
      photoUrl: review.photoUrl || ""
    }));
  }

  function normalizeReports(reports) {
    return reports.map((report) => ({
      ...report,
      status: report.status || "open",
      reason: report.reason || "사용자 신고"
    }));
  }

  function normalizeRealtime(value) {
    const fallback = structuredClone(defaultState.realtime);
    if (!value || typeof value !== "object") return fallback;
    return {
      ...fallback,
      ...value,
      weatherByPlaceId: value.weatherByPlaceId && typeof value.weatherByPlaceId === "object" ? value.weatherByPlaceId : {},
      source: value.source || fallback.source,
      status: value.status || fallback.status,
      error: value.error || ""
    };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.warn("Saved state could not be persisted.", error);
      showToast("브라우저 저장 공간이 부족합니다. 큰 사진을 줄인 뒤 다시 시도하세요.");
      return false;
    }
  }

  function places() {
    return [...seedPlaces, ...state.extraPlaces].filter((place) => place.status !== "hidden");
  }

  function getPlace(placeId) {
    return places().find((place) => place.id === placeId) || places()[0];
  }

  function shouldRefreshRealtime(force = false) {
    if (force) return true;
    const updatedAt = Date.parse(state.realtime?.updatedAt || "");
    if (!Number.isFinite(updatedAt)) return true;
    return Date.now() - updatedAt > REALTIME_STALE_MS;
  }

  function realtimeTargets() {
    return places().filter(hasCoordinates);
  }

  function buildOpenMeteoUrl(targets) {
    const params = new URLSearchParams({
      latitude: targets.map((place) => Number(place.latitude).toFixed(5)).join(","),
      longitude: targets.map((place) => Number(place.longitude).toFixed(5)).join(","),
      current: "temperature_2m,precipitation,weather_code,wind_speed_10m",
      timezone: "Asia/Seoul",
      forecast_days: "1"
    });
    return `${OPEN_METEO_FORECAST_URL}?${params.toString()}`;
  }

  function normalizeOpenMeteoResponse(payload) {
    return Array.isArray(payload) ? payload : [payload];
  }

  function weatherFromOpenMeteoRow(row, fetchedAt) {
    const current = row?.current || {};
    return {
      source: "Open-Meteo",
      updatedAt: fetchedAt,
      providerUpdatedAt: current.time || "",
      temperature: roundWeatherValue(current.temperature_2m, 1),
      precipitation: roundWeatherValue(current.precipitation, 1) || 0,
      weatherCode: Number(current.weather_code),
      windSpeed: roundWeatherValue(current.wind_speed_10m, 1)
    };
  }

  async function updateRealtimeData(force = false) {
    if (!shouldRefreshRealtime(force)) return;
    const targets = realtimeTargets();
    if (!targets.length) return;
    try {
      const response = await fetch(buildOpenMeteoUrl(targets), { cache: "no-store" });
      if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
      const rows = normalizeOpenMeteoResponse(await response.json());
      const fetchedAt = new Date().toISOString();
      const weatherByPlaceId = { ...(state.realtime?.weatherByPlaceId || {}) };
      targets.forEach((place, index) => {
        weatherByPlaceId[place.id] = weatherFromOpenMeteoRow(rows[index], fetchedAt);
      });
      state.realtime = {
        weatherByPlaceId,
        updatedAt: fetchedAt,
        source: "Open-Meteo",
        status: "ok",
        error: ""
      };
      saveState();
      render();
    } catch (error) {
      console.info("Realtime update failed.", error);
      state.realtime = {
        ...normalizeRealtime(state.realtime),
        status: "error",
        error: "실시간 날씨 업데이트 실패"
      };
      saveState();
      render();
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function compactDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function googleMapEmbedUrl(place) {
    const query = encodeURIComponent(`${place.name} ${place.address}`);
    return `https://www.google.com/maps?q=${query}&output=embed`;
  }

  function googleDirectionsUrl(place) {
    const destination = encodeURIComponent(place.address || place.name);
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  }

  function phoneHref(phone) {
    return `tel:${String(phone || "").replace(/[^\d+]/g, "")}`;
  }

  function renderPhoneInfo(place) {
    if (!place.phone || !String(place.phone).match(/\d/)) return "확인 필요";
    return `<a class="phone-link" href="${phoneHref(place.phone)}">${escapeHtml(place.phone)}</a>`;
  }

  function hasCoordinates(place) {
    return Number.isFinite(Number(place.latitude)) && Number.isFinite(Number(place.longitude));
  }

  function weatherCodeLabel(code) {
    const value = Number(code);
    return WEATHER_CODE_LABELS.get(value) || "날씨 확인";
  }

  function roundWeatherValue(value, digits = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    const factor = 10 ** digits;
    return Math.round(number * factor) / factor;
  }

  function realtimeWeatherFor(place) {
    return state.realtime?.weatherByPlaceId?.[place.id] || null;
  }

  function realtimeWeatherLabel(place) {
    const weather = realtimeWeatherFor(place);
    if (!weather) return "";
    const temperature = roundWeatherValue(weather.temperature);
    const precipitation = roundWeatherValue(weather.precipitation, 1);
    const label = weatherCodeLabel(weather.weatherCode);
    const rainText = precipitation && precipitation > 0 ? ` · 강수 ${precipitation}mm` : "";
    return `${label}${temperature === null ? "" : ` ${temperature}°C`}${rainText}`;
  }

  function realtimeWeatherUpdatedText(place) {
    const weather = realtimeWeatherFor(place);
    if (!weather?.updatedAt) return "";
    return compactDate(weather.updatedAt);
  }

  function renderRealtimeWeatherTag(place) {
    const label = realtimeWeatherLabel(place);
    if (!label) return "";
    return `<span class="tag realtime-tag">${escapeHtml(label)}</span>`;
  }

  function renderRealtimeWeatherInfo(place) {
    if (!hasCoordinates(place)) return "위치 좌표 필요";
    const label = realtimeWeatherLabel(place);
    if (!label) {
      const status = state.realtime?.status === "error" ? "업데이트 실패" : "자동 업데이트 대기";
      return `<span class="realtime-info">${escapeHtml(status)}</span>`;
    }
    const updated = realtimeWeatherUpdatedText(place);
    return `
      <span class="realtime-info">
        ${escapeHtml(label)}
        ${updated ? `<small>Open-Meteo · ${escapeHtml(updated)} 갱신</small>` : ""}
      </span>
    `;
  }

  function realtimeWeatherScore(place) {
    const weather = realtimeWeatherFor(place);
    if (!weather) return 0;
    const precipitation = Number(weather.precipitation || 0);
    const windSpeed = Number(weather.windSpeed || 0);
    const temperature = Number(weather.temperature);
    const badOutdoorWeather = precipitation > 0 || windSpeed >= 25 || temperature <= 3 || temperature >= 32;
    if (place.indoorOutdoor === "outdoor") return badOutdoorWeather ? -24 : 8;
    return badOutdoorWeather ? 10 : 0;
  }

  function rewardCopy(type) {
    const labels = {
      chat: "현장 톡 정보",
      photo: "현장 사진",
      highlight: "AI 하이라이트 채택",
      like: "도움 받은 톡 좋아요"
    };
    return labels[type] || "참여";
  }

  function creatorRewardPointsFor(author) {
    return Math.max(0, Number(state.creatorRewardPoints?.[author] || 0));
  }

  function currentUserRewardPoints() {
    if (!state.user) return Number(state.rewardPoints || 0);
    return Number(state.rewardPoints || 0) + creatorRewardPointsFor(state.user.nickname);
  }

  function rewardBreakdown() {
    const totals = {
      photo: 0,
      chat: 0,
      highlight: 0,
      like: 0
    };
    (state.rewardLog || []).forEach((reward) => {
      if (Object.prototype.hasOwnProperty.call(totals, reward.type)) {
        totals[reward.type] += Number(reward.points || 0);
      }
    });
    if (state.user) {
      (state.creatorRewardLog || [])
        .filter((reward) => reward.recipient === state.user.nickname)
        .forEach((reward) => {
          totals.like += Number(reward.points || 0);
        });
    }
    return [
      { type: "photo", label: rewardCopy("photo"), points: totals.photo },
      { type: "chat", label: rewardCopy("chat"), points: totals.chat },
      { type: "highlight", label: rewardCopy("highlight"), points: totals.highlight },
      { type: "like", label: rewardCopy("like"), points: totals.like }
    ];
  }

  function awardReward(type, placeId) {
    const points = REWARD_POINTS[type] || 0;
    if (!points || !state.user) return 0;
    const place = getPlace(placeId);
    state.rewardPoints = Number(state.rewardPoints || 0) + points;
    state.rewardLog.unshift({
      id: uid("reward"),
      type,
      placeId,
      placeName: place?.name || "장소",
      points,
      label: rewardCopy(type),
      createdAt: new Date().toISOString()
    });
    state.rewardLog = state.rewardLog.slice(0, 50);
    return points;
  }

  function awardLikeReward(message) {
    if (!message || !state.user || state.rewardedLikeIds.includes(message.id)) return 0;
    if (message.author === state.user.nickname) return 0;
    const points = REWARD_POINTS.like;
    state.rewardedLikeIds.push(message.id);
    state.creatorRewardPoints = {
      ...(state.creatorRewardPoints || {}),
      [message.author]: creatorRewardPointsFor(message.author) + points
    };
    state.creatorRewardLog.unshift({
      id: uid("creator-reward"),
      type: "like",
      recipient: message.author,
      likedBy: state.user.nickname,
      placeId: message.placeId,
      placeName: getPlace(message.placeId)?.name || "장소",
      points,
      label: rewardCopy("like"),
      createdAt: new Date().toISOString()
    });
    state.creatorRewardLog = state.creatorRewardLog.slice(0, 80);
    return points;
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result || "")));
      reader.addEventListener("error", () => reject(reader.error));
      reader.readAsDataURL(file);
    });
  }

  async function readPhotoGps(file) {
    if (!(file instanceof File) || !file.type.includes("jpeg")) return null;
    try {
      return extractGpsFromExif(await file.arrayBuffer());
    } catch (error) {
      console.warn("GPS metadata could not be read.", error);
      return null;
    }
  }

  function extractGpsFromExif(buffer) {
    const view = new DataView(buffer);
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return null;
    let offset = 2;
    while (offset + 4 < view.byteLength) {
      if (view.getUint8(offset) !== 0xff) return null;
      const marker = view.getUint8(offset + 1);
      const size = view.getUint16(offset + 2, false);
      if (marker === 0xe1 && readAscii(view, offset + 4, 6) === "Exif\0\0") {
        return parseGpsIfd(view, offset + 10);
      }
      offset += size + 2;
    }
    return null;
  }

  function parseGpsIfd(view, tiffOffset) {
    const littleEndian = readAscii(view, tiffOffset, 2) === "II";
    if (view.getUint16(tiffOffset + 2, littleEndian) !== 0x002a) return null;
    const firstIfdOffset = view.getUint32(tiffOffset + 4, littleEndian);
    const gpsIfdOffset = findIfdTagValue(view, tiffOffset + firstIfdOffset, tiffOffset, littleEndian, 0x8825);
    if (!gpsIfdOffset) return null;
    const gpsIfd = tiffOffset + gpsIfdOffset;
    const latRef = readGpsAsciiTag(view, gpsIfd, tiffOffset, littleEndian, 0x0001);
    const latValues = readGpsRationalTag(view, gpsIfd, tiffOffset, littleEndian, 0x0002);
    const lngRef = readGpsAsciiTag(view, gpsIfd, tiffOffset, littleEndian, 0x0003);
    const lngValues = readGpsRationalTag(view, gpsIfd, tiffOffset, littleEndian, 0x0004);
    if (!latRef || !lngRef || latValues.length < 3 || lngValues.length < 3) return null;
    const latitude = gpsToDecimal(latValues, latRef);
    const longitude = gpsToDecimal(lngValues, lngRef);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude };
  }

  function readAscii(view, offset, length) {
    if (offset < 0 || offset + length > view.byteLength) return "";
    return Array.from({ length }, (_, index) => String.fromCharCode(view.getUint8(offset + index))).join("");
  }

  function findIfdTagValue(view, ifdOffset, tiffOffset, littleEndian, targetTag) {
    const count = view.getUint16(ifdOffset, littleEndian);
    for (let index = 0; index < count; index += 1) {
      const entry = ifdOffset + 2 + index * 12;
      if (view.getUint16(entry, littleEndian) === targetTag) {
        return view.getUint32(entry + 8, littleEndian);
      }
    }
    return 0;
  }

  function readGpsAsciiTag(view, ifdOffset, tiffOffset, littleEndian, targetTag) {
    const entry = findIfdEntry(view, ifdOffset, littleEndian, targetTag);
    if (!entry) return "";
    const count = view.getUint32(entry + 4, littleEndian);
    const valueOffset = count <= 4 ? entry + 8 : tiffOffset + view.getUint32(entry + 8, littleEndian);
    return readAscii(view, valueOffset, count).replace(/\0/g, "");
  }

  function readGpsRationalTag(view, ifdOffset, tiffOffset, littleEndian, targetTag) {
    const entry = findIfdEntry(view, ifdOffset, littleEndian, targetTag);
    if (!entry) return [];
    const count = view.getUint32(entry + 4, littleEndian);
    const valueOffset = tiffOffset + view.getUint32(entry + 8, littleEndian);
    return Array.from({ length: count }, (_, index) => {
      const offset = valueOffset + index * 8;
      const numerator = view.getUint32(offset, littleEndian);
      const denominator = view.getUint32(offset + 4, littleEndian);
      return denominator ? numerator / denominator : 0;
    });
  }

  function findIfdEntry(view, ifdOffset, littleEndian, targetTag) {
    const count = view.getUint16(ifdOffset, littleEndian);
    for (let index = 0; index < count; index += 1) {
      const entry = ifdOffset + 2 + index * 12;
      if (view.getUint16(entry, littleEndian) === targetTag) return entry;
    }
    return 0;
  }

  function gpsToDecimal(values, ref) {
    const decimal = Number(values[0] || 0) + Number(values[1] || 0) / 60 + Number(values[2] || 0) / 3600;
    return ["S", "W"].includes(ref.toUpperCase()) ? -decimal : decimal;
  }

  function setView(view) {
    ui.view = view;
    if (view !== "detail") ui.detailTab = "info";
    render();
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openPlace(placeId, tab = "chat") {
    ui.selectedPlaceId = placeId;
    ui.detailTab = tab;
    setView("detail");
  }

  function requireUser(action) {
    if (state.user) return true;
    showToast(`${action}하려면 먼저 로그인하세요.`);
    setView("my");
    return false;
  }

  function primaryChild() {
    return state.children.find((child) => child.isPrimary) || state.children[0] || null;
  }

  function getChildAge(child) {
    if (!child?.birthMonth) return null;
    const [year, month] = child.birthMonth.split("-").map(Number);
    if (!year || !month) return null;
    const now = new Date();
    return Math.max(0, now.getFullYear() - year - (now.getMonth() + 1 < month ? 1 : 0));
  }

  function activeAgeValue() {
    if (ui.filters.age !== "profile") return ui.filters.age;
    const age = getChildAge(primaryChild());
    return age === null ? "all" : String(age);
  }

  function profileAgeLabel() {
    const child = primaryChild();
    const age = getChildAge(child);
    if (age === null) return "";
    return `${age}세 (${child.nickname || "아이"})`;
  }

  function ageInRange(age, range) {
    if (!range || age === null) return false;
    const min = Number(range.minAge ?? 0);
    const max = range.maxAge === null || range.maxAge === undefined ? Infinity : Number(range.maxAge);
    return age >= min && age <= max;
  }

  function ageGuidance(place) {
    const ageValue = activeAgeValue();
    const age = ageValue === "all" ? null : Number(ageValue);
    if (!Number.isFinite(age)) {
      return [
        { label: "입장", value: "생년월 필요", tone: "neutral" },
        { label: "시설", value: "연령 입력 후 확인", tone: "neutral" },
        { label: "할인", value: "연령 입력 후 확인", tone: "neutral" }
      ];
    }
    const policy = place.agePolicy || {};
    const admissionOk = ageInRange(age, policy.admission);
    const facilityOk = ageInRange(age, policy.facility);
    const discount = (policy.discounts || []).find((item) => ageInRange(age, item));
    return [
      { label: "입장", value: admissionOk ? policy.admission.label : "입장 전 확인", tone: admissionOk ? "good" : "warn" },
      { label: "시설", value: facilityOk ? policy.facility.label : "사용 가능 범위 확인", tone: facilityOk ? "good" : "warn" },
      { label: "할인", value: discount?.label || "해당 할인 없음", tone: discount ? "good" : "neutral" }
    ];
  }

  function renderAgeGuidance(place, compact = false) {
    const label = ui.filters.age === "profile" && profileAgeLabel() ? `${profileAgeLabel()} 기준` : activeAgeValue() === "all" ? "연령 기준" : `${activeAgeValue()}세 기준`;
    return `
      <div class="age-guidance ${compact ? "compact" : ""}" aria-label="${escapeHtml(label)} 이용 정보">
        <strong>${escapeHtml(label)}</strong>
        <div>
          ${ageGuidance(place).map((item) => `
            <span class="${item.tone}">
              <em>${escapeHtml(item.label)}</em>
              ${escapeHtml(item.value)}
            </span>
          `).join("")}
        </div>
      </div>
    `;
  }

  function priceLabel(value) {
    const price = Number(value || 0);
    if (price === 0) return "무료";
    return `${Number(price / 10000).toLocaleString("ko-KR")}만원`;
  }

  function selectedPriceOptions() {
    const options = Array.isArray(ui.filters.priceOptions) ? ui.filters.priceOptions.map(String) : [];
    if (options.length) return options;
    if (ui.filters.priceMax !== "") return [String(ui.filters.priceMax)];
    return [];
  }

  function crowdPreferenceScore(place) {
    if (place.crowd === "여유") return 30;
    if (place.crowd === "보통") return 16;
    if (place.crowd === "혼잡") return -28;
    return 0;
  }

  function savedPreferenceProfile() {
    const saved = state.savedPlaceIds.map(getPlace).filter(Boolean);
    const categories = new Map();
    const interests = new Map();
    saved.forEach((place) => {
      categories.set(place.category, (categories.get(place.category) || 0) + 1);
      place.interests.forEach((interest) => {
        interests.set(interest, (interests.get(interest) || 0) + 1);
      });
    });
    return { categories, interests, hasSaved: saved.length > 0 };
  }

  function savedPreferenceScore(place, profile = savedPreferenceProfile()) {
    if (!profile.hasSaved) return 0;
    const categoryScore = (profile.categories.get(place.category) || 0) * 16;
    const interestScore = place.interests.reduce((sum, interest) => sum + (profile.interests.get(interest) || 0) * 8, 0);
    return categoryScore + interestScore;
  }

  function childStyleScore(place, child) {
    if (!child?.activityStyle) return 0;
    if (child.activityStyle === "indoor") return place.indoorOutdoor === "indoor" ? 18 : -10;
    if (child.activityStyle === "calm") {
      const calmMatch = /박물관|예술|공연|과학/.test(place.category) || place.interests.some((interest) => ["미술", "관찰", "음악", "실험"].includes(interest));
      return calmMatch ? 16 : 0;
    }
    if (child.activityStyle === "active") {
      const activeMatch = place.indoorOutdoor === "outdoor" || place.interests.some((interest) => ["체육", "자전거", "야외놀이", "산책"].includes(interest));
      return activeMatch ? 14 : 0;
    }
    return 0;
  }

  function scorePlace(place) {
    const child = primaryChild();
    const savedProfile = savedPreferenceProfile();
    let score = place.rating * 10 + place.talkActive - place.distanceKm * 0.4 + crowdPreferenceScore(place) + savedPreferenceScore(place, savedProfile) + realtimeWeatherScore(place);
    if (!child) return score;
    const age = getChildAge(child);
    if (age && age >= place.ageMin && age <= place.ageMax) score += 28;
    const childInterests = new Set(child.interests || []);
    score += place.interests.filter((interest) => childInterests.has(interest)).length * 12;
    score += childStyleScore(place, child);
    return score;
  }

  function sortedRecommendations() {
    return [...places()].sort((a, b) => scorePlace(b) - scorePlace(a));
  }

  function recommendationSet(limit = 3) {
    const recommendations = sortedRecommendations();
    if (!recommendations.length) return [];
    const safeLimit = Math.min(limit, recommendations.length);
    const start = (ui.recommendationPage * safeLimit) % recommendations.length;
    return Array.from({ length: safeLimit }, (_, index) => recommendations[(start + index) % recommendations.length]);
  }

  function recommendationReasons(place) {
    const reasons = [];
    const age = activeAgeValue() === "all" ? null : Number(activeAgeValue());
    const child = primaryChild();
    const savedProfile = savedPreferenceProfile();
    if (place.crowd === "여유") reasons.push("지금 여유");
    else if (place.crowd === "보통") reasons.push("붐빔 적음");
    const weather = realtimeWeatherFor(place);
    if (weather) {
      const precipitation = Number(weather.precipitation || 0);
      if (place.indoorOutdoor === "indoor" && precipitation > 0) reasons.push("비 와도 실내");
      if (place.indoorOutdoor === "outdoor" && precipitation <= 0) reasons.push("야외 날씨 양호");
    }
    if (Number.isFinite(age) && age >= place.ageMin && age <= place.ageMax) reasons.push(`${age}세 맞춤`);
    const savedMatches = [
      savedProfile.categories.has(place.category) ? place.category.replace("어린이 ", "").replace(" 체험", "") : "",
      ...place.interests.filter((interest) => savedProfile.interests.has(interest))
    ].filter(Boolean);
    if (savedMatches.length) reasons.push(`찜 성향 ${savedMatches[0]}`);
    if (!savedMatches.length && child?.interests?.length) {
      const childMatch = place.interests.find((interest) => child.interests.includes(interest));
      if (childMatch) reasons.push(`관심사 ${childMatch}`);
    }
    return reasons.slice(0, 3);
  }

  function placeReviews(placeId, includeHidden = false) {
    return state.reviews
      .filter((review) => review.placeId === placeId && (includeHidden || !review.hidden))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function reviewCountFor(place) {
    return placeReviews(place.id).length;
  }

  function currentUserReviews() {
    if (!state.user) return [];
    return state.reviews
      .filter((review) => review.author === state.user.nickname)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function currentUserMessages() {
    if (!state.user) return [];
    return state.messages
      .filter((message) => message.author === state.user.nickname)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function placeMessages(placeId, includeHidden = false) {
    return state.messages
      .filter((message) => message.placeId === placeId && (includeHidden || !message.hidden))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  function messageLikeCount(message) {
    return Math.max(0, Number(message?.likes || 0));
  }

  function isMessageLiked(messageId) {
    return state.likedMessageIds.includes(messageId);
  }

  function topLikedMessages(limit = 5) {
    return state.messages
      .filter((message) => !message.hidden)
      .map((message) => ({ ...message, likeCount: messageLikeCount(message) }))
      .filter((message) => message.likeCount > 0)
      .sort((a, b) => b.likeCount - a.likeCount || aiHighlightScore(b) - aiHighlightScore(a))
      .slice(0, limit);
  }

  function contentForReport(type, targetId) {
    if (type === "message") return state.messages.find((message) => message.id === targetId) || null;
    if (type === "review") return state.reviews.find((review) => review.id === targetId) || null;
    return null;
  }

  function isContentHidden(type, targetId) {
    return Boolean(contentForReport(type, targetId)?.hidden);
  }

  function reportTypeLabel(type) {
    return type === "review" ? "후기" : "톡";
  }

  function reportStatusLabel(status) {
    if (status === "hidden") return "숨김 처리";
    if (status === "restored") return "복구 처리";
    return "검토 대기";
  }

  function reportObjectLabel(type) {
    return type === "review" ? "후기를" : "톡을";
  }

  function isTodayMessage(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    const now = new Date();
    return date.getFullYear() === now.getFullYear()
      && date.getMonth() === now.getMonth()
      && date.getDate() === now.getDate();
  }

  function aiHighlightScore(message) {
    if (!message || message.hidden) return 0;
    const text = String(message.text || "");
    const infoKeywords = ["대기", "주차", "혼잡", "여유", "수유", "유모차", "예약", "입장", "줄", "마감", "가격", "운영", "추천", "준비", "가능"];
    let score = 0;
    if (message.verified) score += 24;
    if (message.photoUrl) score += 30;
    if (message.gpsVerified) score += 16;
    if (message.status === "onsite") score += 28;
    if (message.status === "visited") score += 16;
    if (text.length >= 24) score += 12;
    if (text.length >= 48) score += 10;
    score += infoKeywords.filter((keyword) => text.includes(keyword)).length * 8;
    score += messageLikeCount(message) * 10;
    return score;
  }

  function placeHighlights(placeId) {
    const scored = placeMessages(placeId)
      .map((message) => ({
        ...message,
        aiScore: aiHighlightScore(message),
        isTodayPick: isTodayMessage(message.createdAt)
      }));
    const todayPicks = scored
      .filter((message) => message.isTodayPick && message.aiScore >= 24)
      .sort((a, b) => b.aiScore - a.aiScore || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2);
    const corePicks = scored.filter((message) => message.aiScore >= 34);
    return [...todayPicks, ...corePicks]
      .filter((message, index, list) => list.findIndex((item) => item.id === message.id) === index)
      .sort((a, b) => Number(b.isTodayPick) - Number(a.isTodayPick) || b.aiScore - a.aiScore || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }

  function tokenizeQuestion(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2);
  }

  function aiQuestionScore(message, question) {
    if (!message || message.hidden) return 0;
    const text = String(message.text || "").toLowerCase();
    const normalizedQuestion = String(question || "").toLowerCase();
    const tokens = tokenizeQuestion(normalizedQuestion);
    const focusKeywords = ["주차", "대기", "혼잡", "수유", "유모차", "예약", "입장", "줄", "마감", "가격", "운영", "시간", "준비", "가능", "화장실", "식당", "비", "실내"];
    let score = 0;
    tokens.forEach((token) => {
      if (text.includes(token)) score += 18;
    });
    focusKeywords.forEach((keyword) => {
      if (normalizedQuestion.includes(keyword) && text.includes(keyword)) score += 24;
    });
    if (message.verified) score += 10;
    if (message.status === "onsite") score += 10;
    if (isTodayMessage(message.createdAt)) score += 8;
    score += Math.min(24, messageLikeCount(message) * 3);
    return score;
  }

  function searchTalkAnswers(placeId, question, excludeMessageId = "") {
    if (!String(question || "").trim()) return [];
    return placeMessages(placeId)
      .filter((message) => message.id !== excludeMessageId)
      .filter((message) => !isQuestionOnly(message.text))
      .map((message) => ({ ...message, answerScore: aiQuestionScore(message, question) }))
      .filter((message) => message.answerScore >= 18)
      .sort((a, b) => b.answerScore - a.answerScore || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }

  function isLikelyAiQuestion(text) {
    const value = String(text || "").trim();
    if (!value) return false;
    return /[?？]|나요|까요|있나요|되나요|가능|어때|어떤|알려|궁금|주차|대기|혼잡|예약|입장|가격|운영|시간|수유|유모차|화장실|식당/.test(value);
  }

  function aiAnswerText(place, question, answers) {
    if (!answers.length) {
      return "기존 톡에서는 바로 확인되는 답을 찾지 못했습니다. 질문은 톡에 올라갔으니 현장 이용자의 답변을 기다려보세요.";
    }
    const answer = factualTalkSentence(answers[0]);
    if (!answer) return `${place.name} 톡에서 관련 답변 후보를 찾았습니다.`;
    return `기존 톡 기준으로 ${answer}`;
  }

  function renderInlineAiAnswer(place) {
    const question = String(ui.aiQuestion || "").trim();
    if (!question || ui.selectedPlaceId !== place.id) return "";
    const answers = searchTalkAnswers(place.id, question, ui.aiQuestionMessageId);
    const topAnswer = answers[0];
    const liked = topAnswer ? isMessageLiked(topAnswer.id) : false;
    const likeCount = topAnswer ? messageLikeCount(topAnswer) : 0;
    return `
      <article class="chat-message ai-message">
        <div class="chat-meta">
          <strong>AI 답</strong>
          <span>방금</span>
        </div>
        <div class="chat-bubble ai-answer-bubble">
          <p>${escapeHtml(aiAnswerText(place, question, answers))}</p>
          ${topAnswer ? `
            <div class="ai-answer-actions">
              <button class="like-button ai-source-like" type="button" data-action="toggle-like-message" data-message-id="${topAnswer.id}" aria-pressed="${liked}" aria-label="${liked ? "좋아요 취소" : "좋아요"}: ${escapeHtml(topAnswer.author)} 톡">
                도움됨 ${likeCount}
              </button>
            </div>
          ` : ""}
        </div>
      </article>
    `;
  }

  function isQuestionOnly(text) {
    const value = String(text || "").trim();
    if (!value) return false;
    const questionTone = /[?？]$|아시는 분|있을까요|인가요|되나요|가능한가요|알려주세요/.test(value);
    const hasFact = /입니다|있습니다|있어요|없어요|마감|받는다고|안내|여유|붐볐|짧|대기\s*\d+|가능|사용할 수|받았습니다/.test(value);
    return questionTone && !hasFact;
  }

  function splitTalkSentences(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?。？！])\s+/u)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  }

  function scoreTalkSentence(sentence) {
    const keywords = ["대기", "주차", "혼잡", "여유", "수유", "유모차", "예약", "입장", "줄", "마감", "가격", "운영", "가능", "전자레인지", "엘리베이터", "회차", "현장"];
    return keywords.filter((keyword) => sentence.includes(keyword)).length;
  }

  function sentenceToConnector(sentence) {
    const clean = sentence.replace(/[.!?。？！]+$/u, "").trim();
    return clean
      .replace(/입니다$/u, "이고")
      .replace(/있습니다$/u, "있고")
      .replace(/있어요$/u, "있고")
      .replace(/없습니다$/u, "없고")
      .replace(/없어요$/u, "없고")
      .replace(/받았습니다$/u, "받았고")
      .replace(/했습니다$/u, "했고")
      .replace(/됐습니다$/u, "됐고")
      .replace(/좋았습니다$/u, "좋았고")
      .replace(/많아요$/u, "많고");
  }

  function endSentence(sentence) {
    const clean = sentence.replace(/[.!?。？！]+$/u, "").trim();
    return clean ? `${clean}.` : "";
  }

  function factualTalkSentence(message) {
    if (!message || isQuestionOnly(message.text)) return "";
    const sentences = splitTalkSentences(message.text)
      .filter((sentence) => !isQuestionOnly(sentence))
      .sort((a, b) => scoreTalkSentence(b) - scoreTalkSentence(a));
    if (!sentences.length) return "";
    if (sentences.length === 1) return endSentence(sentences[0]);
    return endSentence(`${sentenceToConnector(sentences[0])}, ${sentences[1].replace(/[.!?。？！]+$/u, "").trim()}`);
  }

  function recentInformativeTalks(placeId, limit = 6) {
    return placeMessages(placeId)
      .filter((message) => !message.hidden && !isQuestionOnly(message.text))
      .filter((message) => aiHighlightScore(message) >= 18 || scoreTalkSentence(message.text) > 0)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  function addTalkFact(facts, usedTopics, topic, phrase) {
    if (!phrase || usedTopics.has(topic)) return;
    facts.push({ topic, phrase });
    usedTopics.add(topic);
  }

  function talkFactCandidates(message) {
    const text = String(message?.text || "").replace(/\s+/g, " ").trim();
    if (!text) return [];
    const facts = [];
    const waitMatch = text.match(/대기\s*(\d+)\s*분/u);

    if (waitMatch) {
      const floorMatch = text.match(/(\d+)층/u);
      const placeName = text.includes("체험존") ? `${floorMatch ? `${floorMatch[1]}층 ` : ""}체험존` : "현재";
      facts.push({ topic: "wait", phrase: `${placeName} 대기는 약 ${waitMatch[1]}분` });
    } else if (/회차.*마감|마감.*회차/u.test(text)) {
      const session = /오전/u.test(text) && /오후/u.test(text)
        ? "오전 회차는 마감, 오후 회차는 현장 대기 안내 상태"
        : "일부 회차가 마감된 상태";
      facts.push({ topic: "program", phrase: session });
    } else if (/입장.*줄.*짧|줄.*짧/u.test(text)) {
      facts.push({ topic: "entry", phrase: "입장 줄은 짧은 편" });
    } else if (/여유|대기\s*없|대기가 거의 없/u.test(text)) {
      if (/내부/u.test(text)) facts.push({ topic: "crowd", phrase: "내부 혼잡도는 여유로운 편" });
      else if (/(\d+)층/u.test(text)) facts.push({ topic: "crowd", phrase: `${text.match(/(\d+)층/u)[1]}층은 상대적으로 여유 있는 편` });
      else facts.push({ topic: "crowd", phrase: "현장 혼잡도는 여유로운 편" });
    } else if (/붐볐|혼잡/u.test(text)) {
      const floorMatch = text.match(/(\d+)층/u);
      const zone = text.includes("물놀이") ? "물놀이 체험" : "일부 구역";
      facts.push({ topic: "crowd", phrase: `${floorMatch ? `${floorMatch[1]}층 ` : ""}${zone}은 붐빈 편` });
    }

    if (/예약|입장/u.test(text) && /화면|확인/u.test(text)) {
      facts.push({ topic: "entry", phrase: "예약 확인 화면을 미리 준비하면 입장이 빠른 편" });
    }

    if (/주차/u.test(text)) {
      if (/후문/u.test(text)) facts.push({ topic: "parking", phrase: "주차는 후문 쪽 진입이 더 빠르다는 안내가 있는 상태" });
      else if (/자리.*줄|줄어/u.test(text)) facts.push({ topic: "parking", phrase: "오후에는 주차 여유가 빠르게 줄어드는 편" });
      else facts.push({ topic: "parking", phrase: "주차 상황 확인이 필요한 상태" });
    }

    if (/수유실|전자레인지/u.test(text)) {
      if (/수유실/u.test(text) && /전자레인지/u.test(text)) facts.push({ topic: "care", phrase: "수유실과 전자레인지 이용 상태는 양호한 편" });
      else if (/수유실/u.test(text)) facts.push({ topic: "care", phrase: "수유실 이용 정보가 확인된 상태" });
      else facts.push({ topic: "care", phrase: "전자레인지 이용이 가능한 상태" });
    }

    if (/유모차/u.test(text)) {
      facts.push({ topic: "stroller", phrase: "유모차는 입구 쪽 보관이 많은 상황" });
    }

    if (/엘리베이터/u.test(text) && /대기/u.test(text)) {
      facts.push({ topic: "movement", phrase: "점심 전후 엘리베이터 대기가 있는 편" });
    }

    if (/여벌|옷에 묻/u.test(text)) {
      facts.push({ topic: "prep", phrase: "미술 체험은 여벌 상의 준비가 필요한 편" });
    }

    if (/두 돌|낮은 구조물/u.test(text)) {
      facts.push({ topic: "age", phrase: "낮은 구조물이 많아 두 돌 아이도 이용하기 좋은 편" });
    }

    return facts;
  }

  function composeTalkSummary(facts) {
    const phrases = facts.slice(0, 3).map((fact) => fact.phrase);
    if (!phrases.length) return "";
    if (phrases.length === 1) return `최근 톡 기준 ${phrases[0]}입니다.`;
    if (phrases.length === 2) return `최근 톡 기준 ${phrases[0]}이고, ${phrases[1]}입니다.`;
    return `최근 톡 기준 ${phrases[0]}이고, ${phrases[1]}이며, ${phrases[2]}입니다.`;
  }

  function aiTalkInsights(place) {
    const facts = [];
    const usedTopics = new Set();
    recentInformativeTalks(place.id).forEach((message) => {
      talkFactCandidates(message).forEach((fact) => addTalkFact(facts, usedTopics, fact.topic, fact.phrase));
    });
    const sentence = composeTalkSummary(facts);
    return sentence ? [{ id: `${place.id}-recent-summary`, sentence }] : [];
  }

  function lastMessage(placeId) {
    return [...placeMessages(placeId)].pop();
  }

  function ratingFor(place) {
    const reviews = placeReviews(place.id);
    if (!reviews.length) return place.rating.toFixed(1);
    const average = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
    return average.toFixed(1);
  }

  function favoriteCountFor(place) {
    const baseCount = Number(place.favoriteCount || 0);
    return baseCount + (isSaved(place.id) ? 1 : 0);
  }

  function isSaved(placeId) {
    return state.savedPlaceIds.includes(placeId);
  }

  function renderFavoriteHeart(place, className = "") {
    const saved = isSaved(place.id);
    const saveLabel = saved ? `${place.name} 찜 해제` : `${place.name} 찜하기`;
    return `
      <button class="favorite-heart ${className}" type="button" data-action="toggle-save" data-place-id="${place.id}" aria-pressed="${saved}" aria-label="${escapeHtml(saveLabel)}">
        <span aria-hidden="true">${saved ? "♥" : "♡"}</span>
      </button>
    `;
  }

  function render() {
    headerUserLabel.textContent = state.user ? state.user.nickname : "로그인";
    if (ui.view === "my") headerUserLabel.setAttribute("aria-current", "page");
    else headerUserLabel.removeAttribute("aria-current");
    document.querySelectorAll("[data-nav]").forEach((button) => {
      const current = button.dataset.nav === ui.view || (ui.view === "detail" && button.dataset.nav === "explore");
      if (current) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    const renderers = {
      home: renderHome,
      explore: renderExplore,
      detail: renderDetail,
      favorites: renderFavorites,
      my: renderMy,
      admin: renderAdmin
    };
    main.innerHTML = (renderers[ui.view] || renderHome)();
    window.requestAnimationFrame(() => {
      const chatScroll = main.querySelector("[data-chat-scroll]");
      if (chatScroll) chatScroll.scrollTop = chatScroll.scrollHeight;
    });
  }

  function renderHeroCandidate(place, index) {
    const reasons = recommendationReasons(place);
    return `
      <button class="hero-candidate" type="button" data-open-place="${place.id}">
        <span class="hero-rank">${index + 1}</span>
        <span class="hero-candidate-copy">
          <strong>${escapeHtml(place.name)}</strong>
          <small>${reasons.map(escapeHtml).join(" · ")}</small>
        </span>
      </button>
    `;
  }

  function renderHome() {
    const recommendations = sortedRecommendations();
    const heroCandidates = recommendationSet(3);
    const heroPlace = heroCandidates[0] || recommendations[0];
    const activePlaces = [...places()].sort((a, b) => b.talkActive - a.talkActive).slice(0, 4);

    return `
      <div class="view">
        <section class="hero" aria-labelledby="home-title">
          <img src="${heroPlace.image}" alt="${escapeHtml(heroPlace.name)} 대표 사진" decoding="async" fetchpriority="high">
          <div class="hero-content">
            <div>
              <h1 id="home-title">이번 주말 어디 갈까?</h1>
            </div>
            <div class="hero-panel">
              <div class="hero-panel-head">
                <strong>지금 가장 적합한 후보</strong>
                <button class="hero-refresh-button" type="button" data-action="refresh-recommendations">다시 추천하기</button>
              </div>
              <div class="hero-candidate-list">
                ${heroCandidates.map(renderHeroCandidate).join("")}
              </div>
            </div>
          </div>
        </section>

        ${renderSearchCard("home")}

        <section class="dashboard-grid" aria-label="나들이톡 홈 대시보드">
          <div class="view">
            <div class="section-head">
              <div>
                <h2>추천 장소</h2>
                <p class="subtle">연령, 거리, 실내외, 톡 활성도를 함께 반영했습니다.</p>
              </div>
            </div>
            <div class="cards-grid">
              ${recommendations.slice(0, 3).map((place) => renderPlaceCard(place)).join("")}
            </div>
          </div>

          <aside class="side-stack" aria-label="현장 톡 미리보기">
            <section class="panel talk-preview-panel" aria-label="현장 톡 미리보기">
              <div class="talk-preview">
                ${activePlaces.map(renderTalkPreview).join("")}
              </div>
            </section>
          </aside>
        </section>
      </div>
    `;
  }

  function renderSearchCard(variant = "home") {
    const categories = [...new Set(places().map((place) => place.category))];
    const isSidebar = variant === "sidebar";
    const formLabel = isSidebar ? "탐색 필터 조건" : "장소 검색 조건";
    const submitLabel = isSidebar ? "조건 적용" : "탐색";
    const profileLabel = profileAgeLabel();
    const selectedAge = ui.filters.age === "profile" && !profileLabel ? "all" : ui.filters.age;
    const ageInputValue = activeAgeValue() === "all" ? "" : activeAgeValue();
    const priceOptions = selectedPriceOptions();
    const categoryLabels = {
      "어린이 박물관": "박물관",
      "야외 공원": "공원",
      "과학 체험": "과학",
      "실내 놀이": "놀이터",
      "예술 체험": "예술",
      "체육 놀이": "체육",
      "공연": "공연",
      "기타": "기타"
    };
    return `
      <form class="search-card ${isSidebar ? "search-card-sidebar" : ""}" data-form="search" aria-label="${formLabel}">
        <div class="field">
          <label for="q">검색</label>
          <input id="q" name="query" type="search" value="${escapeHtml(ui.query)}" placeholder="장소명, 지역, 관심사">
        </div>
        <div class="field">
          <label for="age">연령</label>
          <input id="age" name="age" type="number" min="0" max="12" inputmode="numeric" value="${escapeHtml(ageInputValue)}" placeholder="나이">
        </div>
        <div class="field">
          <label>공간</label>
          <input type="hidden" name="indoorOutdoor" value="${escapeHtml(ui.filters.indoorOutdoor)}">
          <div class="filter-chip-row" aria-label="공간 선택">
            ${[
              ["indoor", "실내"],
              ["outdoor", "실외"]
            ].map(([value, label]) => `
              <button class="filter-chip" type="button" data-action="set-filter-option" data-filter="indoorOutdoor" data-value="${value}" aria-pressed="${ui.filters.indoorOutdoor === value}">${label}</button>
            `).join("")}
          </div>
        </div>
        <div class="field price-field">
          <label>비용</label>
          ${priceOptions.map((price) => `<input type="hidden" name="priceOptions" value="${escapeHtml(price)}">`).join("")}
          <div class="price-picker" aria-label="비용 범위">
            <div class="price-preset-grid">
              ${PRICE_PRESETS.map((price) => `
                <button class="price-chip" type="button" data-action="toggle-price-option" data-price="${price}" aria-pressed="${priceOptions.includes(String(price))}">${priceLabel(price)}</button>
              `).join("")}
            </div>
          </div>
        </div>
        <div class="field category-field">
          <label>카테고리</label>
          <input type="hidden" name="category" value="${escapeHtml(ui.filters.category)}">
          <div class="filter-chip-row category-chip-row" aria-label="카테고리 선택">
            ${categories.map((category) => [category, categoryLabels[category] || category]).map(([value, label]) => `
              <button class="filter-chip" type="button" data-action="set-filter-option" data-filter="category" data-value="${escapeHtml(value)}" aria-pressed="${ui.filters.category === value}">${escapeHtml(label)}</button>
            `).join("")}
          </div>
        </div>
        <button class="primary-button" type="submit">${submitLabel}</button>
      </form>
    `;
  }

  function option(value, label, selectedValue) {
    return `<option value="${escapeHtml(value)}" ${value === selectedValue ? "selected" : ""}>${escapeHtml(label)}</option>`;
  }

  function renderTalkPreview(place) {
    const message = lastMessage(place.id);
    return `
      <button class="talk-bubble-link" type="button" data-open-place="${place.id}" data-tab-target="chat" aria-label="${escapeHtml(place.name)} 톡 보기">
        <span class="talk-bubble-head">
          <strong>${escapeHtml(place.name)}</strong>
          <span>${escapeHtml(place.region)}</span>
        </span>
        <span class="talk-bubble-text">${escapeHtml(message?.text || "아직 대화가 없습니다.")}</span>
      </button>
    `;
  }

  function renderPlaceCard(place, wide = false) {
    return `
      <article class="place-card ${wide ? "wide-card" : ""}">
        <div class="place-image">
          <button class="place-image-button" type="button" data-open-place="${place.id}" aria-label="${escapeHtml(place.name)} 상세 보기">
            <img src="${place.image}" alt="${escapeHtml(place.name)} 사진" loading="lazy" decoding="async">
          </button>
          ${renderFavoriteHeart(place, "place-favorite")}
        </div>
        <div class="place-body">
          <div>
            <div class="meta-row">
              <span>${escapeHtml(place.category)}</span>
              <span>${escapeHtml(place.region)}</span>
              <span>${place.distanceKm.toFixed(1)}km</span>
            </div>
            <h3><button class="place-title-button" type="button" data-open-place="${place.id}">${escapeHtml(place.name)}</button></h3>
          </div>
          <p class="subtle">${escapeHtml(place.description)}</p>
          <div class="tag-row">
            <span class="tag">${escapeHtml(place.ageBand)}</span>
            <span class="tag">${place.indoorOutdoor === "indoor" ? "실내" : "실외"}</span>
            <span class="tag">${escapeHtml(place.priceRange?.label || (place.cost === "free" ? "무료" : "유료"))}</span>
            <span class="status-badge">${escapeHtml(place.crowd)}</span>
            ${renderRealtimeWeatherTag(place)}
          </div>
          ${renderAgeGuidance(place, true)}
          <div class="meta-row">
            <strong>평점 ${ratingFor(place)}</strong>
            <span>후기 ${reviewCountFor(place)}</span>
            <span>톡 ${place.talkActive}</span>
            <span>찜 ${favoriteCountFor(place)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function filteredPlaces() {
    const query = ui.query.trim().toLowerCase();
    const ageValue = activeAgeValue();
    const priceOptions = selectedPriceOptions();
    return places().filter((place) => {
      const matchesQuery = !query || [place.name, place.category, place.region, place.address, ...place.interests]
        .join(" ")
        .toLowerCase()
        .includes(query);
      const matchesAge = ageValue === "all" || ageFilterMatch(place, ageValue);
      const matchesIndoor = ui.filters.indoorOutdoor === "all" || place.indoorOutdoor === ui.filters.indoorOutdoor;
      const placePrice = Number(place.priceRange?.min ?? 0);
      const matchesCost = !priceOptions.length || priceOptions.some((price) => placePrice <= Number(price));
      const matchesCategory = ui.filters.category === "all" || place.category === ui.filters.category;
      return matchesQuery && matchesAge && matchesIndoor && matchesCost && matchesCategory;
    });
  }

  function hasActiveSearch() {
    return Boolean(ui.query.trim())
      || activeAgeValue() !== "all"
      || ui.filters.indoorOutdoor !== "all"
      || selectedPriceOptions().length > 0
      || ui.filters.category !== "all";
  }

  function ageFilterMatch(place, ageValue) {
    const age = Number(ageValue);
    return age >= place.ageMin && age <= place.ageMax;
  }

  function renderExplore() {
    const results = filteredPlaces();
    const selected = results.find((place) => place.id === ui.selectedPlaceId) || results[0] || getPlace(ui.selectedPlaceId);
    return `
      <div class="view">
        <section class="explore-layout">
          <aside class="panel filter-panel sticky" aria-label="탐색 필터">
            ${renderSearchCard("sidebar")}
          </aside>
          <div class="result-list" aria-label="검색 결과" aria-live="polite">
            ${results.length ? results.map((place) => renderPlaceCard(place, true)).join("") : renderEmpty("조건에 맞는 장소가 없습니다.", "검색어를 줄이거나 필터를 초기화하세요.", "필터 초기화", "reset-filters")}
          </div>
          <aside class="side-stack sticky">
            ${renderGoogleMapPanel(selected, results.length ? results : places())}
            <section class="panel">
              <h3>${escapeHtml(selected.name)}</h3>
              <p class="subtle">${escapeHtml(selected.region)} · ${selected.distanceKm.toFixed(1)}km · ${escapeHtml(selected.crowd)}</p>
              <button class="primary-button" type="button" data-open-place="${selected.id}">선택 장소 보기</button>
            </section>
          </aside>
        </section>
      </div>
    `;
  }

  function renderGoogleMapPanel(selected, candidates = places()) {
    return `
      <section class="panel map-panel google-map-panel" aria-label="Google 지도">
        <iframe
          title="${escapeHtml(selected.name)} Google 지도"
          src="${googleMapEmbedUrl(selected)}"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen>
        </iframe>
        <a class="map-fallback-link" href="${googleDirectionsUrl(selected)}" target="_blank" rel="noopener">
          지도가 보이지 않으면 Google 지도에서 ${escapeHtml(selected.name)} 길찾기 열기
        </a>
        <div class="map-place-strip" aria-label="지도 장소 선택">
          ${candidates.map((place) => `
            <button class="map-place-chip ${place.id === selected.id ? "active" : ""}" type="button" data-action="select-marker" data-place-id="${place.id}">
              <span>${escapeHtml(place.name)}</span>
              <small>${escapeHtml(place.region)}</small>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderEmpty(title, body, actionLabel, action) {
    return `
      <div class="empty-state">
        <h2>${escapeHtml(title)}</h2>
        <p class="subtle">${escapeHtml(body)}</p>
        ${action ? `<button class="secondary-button" type="button" data-action="${action}">${escapeHtml(actionLabel)}</button>` : ""}
      </div>
    `;
  }

  function renderDetail() {
    const place = getPlace(ui.selectedPlaceId);
    const messages = placeMessages(place.id, state.user?.role === "admin");
    if (!["info", "reviews", "chat"].includes(ui.detailTab)) ui.detailTab = "info";
    return `
      <div class="view">
        <section class="detail-hero" aria-labelledby="detail-title">
          <div class="detail-hero-media">
            <img src="${place.image}" alt="${escapeHtml(place.name)} 사진" decoding="async" fetchpriority="high">
            ${renderFavoriteHeart(place, "detail-favorite")}
          </div>
          <div class="detail-copy">
            <div>
              <p class="status-badge">${escapeHtml(place.category)} · ${escapeHtml(place.region)}</p>
              <h1 class="detail-title" id="detail-title">${escapeHtml(place.name)}</h1>
              <p class="subtle">${escapeHtml(place.description)}</p>
            </div>
            <div class="tag-row">
              <span class="tag">${escapeHtml(place.ageBand)}</span>
              <span class="tag">${place.indoorOutdoor === "indoor" ? "실내" : "실외"}</span>
              <span class="tag">${escapeHtml(place.priceRange?.label || (place.cost === "free" ? "무료" : "유료"))}</span>
              <span class="status-badge">현재 ${escapeHtml(place.crowd)}</span>
            </div>
            <div class="action-grid">
              <button class="primary-button compact" type="button" data-action="route" data-place-id="${place.id}">길찾기</button>
              <button class="secondary-button compact" type="button" data-action="share" data-place-id="${place.id}">공유</button>
              <button class="secondary-button compact detail-mode-button" type="button" data-action="detail-tab" data-tab="info" aria-pressed="${ui.detailTab === "info"}">정보</button>
              <button class="secondary-button compact detail-mode-button" type="button" data-action="detail-tab" data-tab="reviews" aria-pressed="${ui.detailTab === "reviews"}">후기</button>
              <button class="secondary-button compact detail-mode-button" type="button" data-action="detail-tab" data-tab="chat" aria-pressed="${ui.detailTab === "chat"}">톡</button>
            </div>
          </div>
        </section>

        ${ui.detailTab === "info" ? renderInfoTab(place) : ""}
        ${ui.detailTab === "reviews" ? renderReviewTab(place) : ""}
        ${ui.detailTab === "chat" ? renderChatTab(place, messages) : ""}
      </div>
    `;
  }

  function renderInfoItem(label, valueHtml, wide = false) {
    return `
      <div class="info-item ${wide ? "wide" : ""}">
        <span>${escapeHtml(label)}</span>
        <strong>${valueHtml}</strong>
      </div>
    `;
  }

  function renderInfoTab(place) {
    return `
      <section class="dashboard-grid info-layout">
        <div class="info-main-stack">
          <section class="panel visit-tip-panel" aria-label="방문 팁">
            <div class="visit-tip-list">
              ${place.tips.map((tip) => `<span>${escapeHtml(tip)}</span>`).join("")}
            </div>
          </section>
          <section class="panel visit-info-panel" aria-label="방문 정보">
            <div class="info-focus-grid">
              ${renderInfoItem("전화", renderPhoneInfo(place))}
              ${renderInfoItem("운영시간", escapeHtml(place.hours))}
              ${renderInfoItem("가격", escapeHtml(place.price))}
            </div>
            <div class="info-list-grid">
              ${renderInfoItem("주소", escapeHtml(place.address), true)}
              ${renderInfoItem("실시간 날씨", renderRealtimeWeatherInfo(place))}
              ${renderInfoItem("주차", escapeHtml(place.facilities.parking))}
              ${renderInfoItem("유모차", escapeHtml(place.facilities.stroller))}
              ${renderInfoItem("수유실", escapeHtml(place.facilities.nursing))}
              ${renderInfoItem("식음료", escapeHtml(place.facilities.food))}
              ${renderInfoItem("평점", `${ratingFor(place)} / 5`)}
            </div>
            ${renderAgeGuidance(place)}
          </section>
        </div>
        <aside class="side-stack">
          ${renderGoogleMapPanel(place)}
        </aside>
      </section>
    `;
  }

  function renderReviewTab(place) {
    const reviews = placeReviews(place.id, state.user?.role === "admin");
    const visibleReviews = reviews.filter((review) => !review.hidden);
    const average = visibleReviews.length
      ? (visibleReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / visibleReviews.length).toFixed(1)
      : ratingFor(place);
    const verifiedCount = visibleReviews.filter((review) => review.verified).length;

    return `
      <section class="dashboard-grid review-layout">
        <div class="info-main-stack">
          <section class="panel review-summary-panel" aria-label="후기 요약">
            <div>
              <span class="status-badge">후기 ${visibleReviews.length}</span>
              <h2>${average}</h2>
              <p class="subtle">인증 후기 ${verifiedCount}개 · 최신 방문 경험 우선</p>
            </div>
            <div class="review-metric-grid">
              <div><strong>${verifiedCount}</strong><span>인증</span></div>
              <div><strong>${visibleReviews.filter((review) => review.photoUrl).length}</strong><span>사진</span></div>
              <div><strong>${place.talkActive}</strong><span>톡 활성도</span></div>
            </div>
          </section>
          <section class="review-list" aria-label="${escapeHtml(place.name)} 후기 목록">
            ${reviews.length ? reviews.map(renderReviewCard).join("") : renderEmpty("아직 후기가 없습니다.", "방문 경험을 남기면 다음 가족이 더 빠르게 결정할 수 있어요.", "", "")}
          </section>
        </div>
        <aside class="panel sticky">
          <h3>후기 작성</h3>
          ${state.user ? renderReviewForm(place) : loginNudge("후기 작성")}
        </aside>
      </section>
    `;
  }

  function renderReviewForm(place) {
    const childAge = getChildAge(primaryChild());
    return `
      <form class="compact-list" data-form="review" data-place-id="${place.id}">
        <div class="field">
          <label for="reviewRating">평점</label>
          <select id="reviewRating" name="rating" required>
            ${[5, 4, 3, 2, 1].map((rating) => option(String(rating), `${rating}점`, "5")).join("")}
          </select>
        </div>
        <div class="field">
          <label for="reviewChildAge">아이 연령</label>
          <input id="reviewChildAge" name="childAge" value="${childAge !== null ? `${childAge}세` : ""}" placeholder="예: 5세" required>
        </div>
        <div class="field">
          <label for="reviewSummary">한줄평</label>
          <input id="reviewSummary" name="summary" maxlength="60" placeholder="방문 결정을 도와줄 한 문장" required>
        </div>
        <div class="field">
          <label for="reviewBody">상세 후기</label>
          <textarea id="reviewBody" name="body" maxlength="420" placeholder="주차, 대기, 아이 반응, 다시 갈지 등을 적어주세요." required></textarea>
        </div>
        <fieldset class="field">
          <legend>체크리스트</legend>
          <div class="check-grid">
            ${["주차 좋음", "대기 짧음", "청결 좋음", "아이 만족 높음", "유모차 가능", "식사 편함"].map((label) => `
              <label class="check-option"><input type="checkbox" name="checklist" value="${escapeHtml(label)}"><span>${escapeHtml(label)}</span></label>
            `).join("")}
          </div>
        </fieldset>
        <label class="photo-upload">
          <input type="file" name="photo" accept="image/*">
          <span>후기 사진 선택</span>
        </label>
        <label class="check-option">
          <input type="checkbox" name="verified">
          <span>최근 방문 후기입니다</span>
        </label>
        <button class="primary-button" type="submit">후기 등록</button>
      </form>
    `;
  }

  function renderReviewCard(review) {
    const place = getPlace(review.placeId);
    const isMine = state.user && review.author === state.user.nickname;
    return `
      <article class="review-card ${review.hidden ? "hidden-message" : ""}">
        <div class="review-head">
          <div>
            <strong>${escapeHtml(review.author)}</strong>
            <span>${compactDate(review.createdAt)}</span>
          </div>
          <div class="tag-row">
            <span class="status-badge">평점 ${Number(review.rating || 0).toFixed(1)}</span>
            <span class="tag">${escapeHtml(review.childAge || "연령 미입력")}</span>
            ${review.verified ? `<span class="tag">방문 인증</span>` : ""}
            ${review.hidden ? `<span class="badge">운영자 숨김</span>` : ""}
          </div>
        </div>
        <h3>${escapeHtml(review.summary || "방문 후기")}</h3>
        <p>${escapeHtml(review.body || "")}</p>
        ${review.photoUrl ? `<img class="review-photo" src="${review.photoUrl}" alt="${escapeHtml(review.author)}님이 올린 후기 사진" loading="lazy" decoding="async">` : ""}
        ${review.checklist?.length ? `<div class="tag-row">${review.checklist.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>` : ""}
        ${place ? `<p class="subtle">${escapeHtml(place.name)}</p>` : ""}
        ${renderContentActions("review", review.id, isMine)}
      </article>
    `;
  }

  function renderContentActions(type, targetId, isMine = false) {
    const hidden = isContentHidden(type, targetId);
    if (state.user?.role === "admin") {
      return `
        <div class="content-actions">
          <button class="${hidden ? "secondary-button" : "danger-button"} compact" type="button" data-action="${hidden ? "restore-content" : "hide-content"}" data-report-type="${type}" data-target-id="${targetId}">
            ${hidden ? "복구" : "숨김"}
          </button>
        </div>
      `;
    }
    if (!state.user || isMine || hidden) return "";
    const reported = state.reports.some((report) => report.type === type && report.targetId === targetId && report.reporter === state.user.nickname && report.status === "open");
    return `
      <div class="content-actions">
        <button class="ghost-button compact" type="button" data-action="report-content" data-report-type="${type}" data-target-id="${targetId}" ${reported ? "disabled" : ""}>
          ${reported ? "신고 접수됨" : "신고"}
        </button>
      </div>
    `;
  }

  function renderAiTalkSummary(place) {
    const insights = aiTalkInsights(place);
    if (!insights.length) return "";
    return `
      <section class="ai-talk-summary" aria-label="AI 하이라이트">
        <div class="ai-summary-card">
          <span class="ai-summary-label">AI 하이라이트</span>
          <p>${escapeHtml(insights[0].sentence)}</p>
        </div>
      </section>
    `;
  }

  function renderChatTab(place, messages) {
    const visibleMessages = messages.filter((message) => !message.hidden);
    const counts = visibleMessages.reduce((acc, message) => {
      acc[message.status] = (acc[message.status] || 0) + 1;
      return acc;
    }, {});

    return `
      <section class="chat-layout chat-layout-full">
        <div class="chat-room panel" aria-label="톡">
          <div class="chat-topbar compact-chat-topbar">
            <div>
              <p class="subtle">현지 ${counts.onsite || 0} · 가는 중 ${counts.going || 0} · 다녀옴 ${counts.visited || 0}</p>
            </div>
          </div>
          <div class="chat-scroll" data-chat-scroll tabindex="0" aria-label="이전 톡까지 스크롤해서 보기">
            ${renderAiTalkSummary(place)}
            <div class="chat-history-label">이전 현장 톡</div>
            ${messages.length ? messages.map(renderMessage).join("") : renderEmpty("아직 톡이 없습니다.", "첫 질문을 남겨 현장 정보를 모아보세요.", "", "")}
            ${renderInlineAiAnswer(place)}
          </div>
          <div class="chat-composer">
            ${state.user ? renderChatForm(place) : loginNudge("톡 작성")}
          </div>
        </div>
      </section>
    `;
  }

  function renderMessage(message) {
    const isMine = state.user && message.author === state.user.nickname;
    const liked = isMessageLiked(message.id);
    const likeCount = messageLikeCount(message);
    return `
      <article class="chat-message ${isMine ? "mine" : "other"} ${message.hidden ? "hidden-message" : ""}">
        <div class="chat-meta">
          <strong>${escapeHtml(message.author)}</strong>
          <span>${compactDate(message.createdAt)}</span>
        </div>
        <div class="chat-bubble">
          <div class="message-head">
            <div class="message-tags">
              <span class="tag">${escapeHtml(STATUS_LABELS[message.status] || message.status)}</span>
              ${message.verified ? `<span class="tag">인증</span>` : ""}
              ${message.gpsVerified ? `<span class="status-badge">방문 위치 인증</span>` : ""}
              ${message.photoUrl ? `<span class="status-badge">현장 사진</span>` : ""}
              ${message.hidden ? `<span class="badge">운영자 숨김</span>` : ""}
            </div>
            <button class="like-button" type="button" data-action="toggle-like-message" data-message-id="${message.id}" aria-pressed="${liked}" aria-label="${liked ? "좋아요 취소" : "좋아요"}: ${escapeHtml(message.author)} 톡">
              <span>좋아요 ${likeCount}</span>
            </button>
          </div>
          <p>${escapeHtml(message.text)}</p>
          ${message.photoUrl ? `<img class="chat-photo" src="${message.photoUrl}" alt="${escapeHtml(message.author)}님이 올린 현장 사진" loading="lazy" decoding="async">` : ""}
          ${renderContentActions("message", message.id, isMine)}
        </div>
      </article>
    `;
  }

  function renderChatForm(place) {
    return `
      <form class="chat-form" data-form="chat" data-place-id="${place.id}">
        <div class="chat-input-row">
          <label class="visually-hidden" for="chatMessage">메시지</label>
          <textarea id="chatMessage" name="message" maxlength="260" placeholder="질문이나 현장 상황을 남겨보세요." aria-label="메시지"></textarea>
          <button class="primary-button chat-send-button" type="submit">전송</button>
        </div>
        <div class="chat-tools-row">
          <div class="status-segment" role="radiogroup" aria-label="참여 상태">
            ${Object.entries(STATUS_LABELS).map(([value, label]) => `
              <label>
                <input type="radio" name="status" value="${value}" ${ui.chatStatus === value ? "checked" : ""}>
                <span>${escapeHtml(label)}</span>
              </label>
            `).join("")}
          </div>
          <label class="photo-upload compact-photo">
            <input type="file" name="photo" accept="image/*">
            <span>현장 사진</span>
          </label>
        </div>
        <p class="privacy-note">사진 위치정보는 동의한 경우에만 현장 인증에 사용됩니다.</p>
      </form>
    `;
  }

  function renderRewardPanel() {
    const breakdown = rewardBreakdown();
    return `
      <section class="panel reward-panel" aria-label="리워드">
        <button class="reward-total reward-toggle" type="button" data-action="toggle-reward-detail" aria-expanded="${ui.rewardExpanded}" aria-controls="rewardBreakdown">
          <span>내 리워드</span>
          <strong>${currentUserRewardPoints().toLocaleString("ko-KR")}P</strong>
          <small>${ui.rewardExpanded ? "접기" : "항목별 보기"}</small>
        </button>
        ${ui.rewardExpanded ? `
          <div class="reward-breakdown" id="rewardBreakdown">
            ${breakdown.map((item) => `
              <div>
                <span>${escapeHtml(item.label)}</span>
                <strong>${item.points.toLocaleString("ko-KR")}P</strong>
              </div>
            `).join("")}
          </div>
        ` : ""}
      </section>
    `;
  }

  function loginNudge(action) {
    return `
      <div class="empty-state">
        <h2>로그인이 필요합니다</h2>
        <p class="subtle">${escapeHtml(action)}하려면 로컬 세션을 만들어주세요.</p>
        <button class="primary-button" type="button" data-nav="my">로그인하기</button>
      </div>
    `;
  }

  function renderFavorites() {
    const saved = state.savedPlaceIds.map(getPlace).filter(Boolean);
    return `
      <div class="view">
        <div class="section-head">
          <div>
            <h2>찜 목록</h2>
            <p class="subtle">방문 후보를 저장하고 비교합니다.</p>
          </div>
        </div>
        <div class="cards-grid">
          ${saved.length ? saved.map((place) => renderPlaceCard(place)).join("") : renderEmpty("아직 찜한 장소가 없습니다.", "장소 카드 사진 위 하트로 후보를 저장하세요.", "추천 보기", "go-home")}
        </div>
      </div>
    `;
  }

  function renderMyReviewActivity() {
    const reviews = currentUserReviews().slice(0, 4);
    return `
      <article class="panel compact-list">
        <h3>내가 쓴 후기</h3>
        ${reviews.length ? reviews.map((review) => {
          const place = getPlace(review.placeId);
          return `
            <div class="activity-card">
              <div>
                <strong>${escapeHtml(review.summary || "방문 후기")}</strong>
                <p class="subtle">${escapeHtml(place?.name || "삭제된 장소")} · 평점 ${Number(review.rating || 0).toFixed(1)}</p>
              </div>
              <button class="ghost-button compact" type="button" data-open-place="${review.placeId}" data-tab-target="reviews">보기</button>
            </div>
          `;
        }).join("") : `<p class="subtle">아직 작성한 후기가 없습니다.</p>`}
      </article>
    `;
  }

  function renderMyTalkActivity() {
    const messages = currentUserMessages().slice(0, 4);
    return `
      <article class="panel compact-list">
        <h3>내가 참여한 톡</h3>
        ${messages.length ? messages.map((message) => {
          const place = getPlace(message.placeId);
          return `
            <div class="activity-card">
              <div>
                <strong>${escapeHtml(place?.name || "삭제된 장소")}</strong>
                <p class="subtle">${escapeHtml(message.text)}</p>
              </div>
              <button class="ghost-button compact" type="button" data-open-place="${message.placeId}" data-tab-target="chat">톡 보기</button>
            </div>
          `;
        }).join("") : `<p class="subtle">아직 참여한 톡이 없습니다.</p>`}
      </article>
    `;
  }

  function renderMy() {
    if (!state.user) {
      return `
        <section class="panel" aria-labelledby="login-title">
          <h2 id="login-title">로컬 로그인</h2>
          <p class="subtle">서버 없이 브라우저 localStorage에만 저장되는 데모 세션입니다.</p>
          <form class="form-grid" data-form="login">
            <div class="field"><label for="loginEmail">이메일</label><input id="loginEmail" name="email" type="email" value="demo@nadritalk.local" required></div>
            <div class="field"><label for="loginNickname">닉네임</label><input id="loginNickname" name="nickname" value="주말탐험가" required></div>
            <div class="field"><label for="loginRegion">기본 지역</label><input id="loginRegion" name="region" value="서울 마포" required></div>
            <div class="field"><label for="loginChildBirthMonth">어린이 생년월</label><input id="loginChildBirthMonth" name="childBirthMonth" type="month" value="2020-05" required></div>
            <div class="field"><label for="loginRole">역할</label><select id="loginRole" name="role">${option("user", "일반 사용자", "user")}${option("admin", "운영자 포함", "user")}</select></div>
            <label class="check-option wide"><input type="checkbox" name="termsConsent" required><span>서비스 이용약관과 개인정보 처리에 동의합니다.</span></label>
            <label class="check-option wide"><input type="checkbox" name="locationConsent"><span>현장 인증을 위한 사진 위치정보 사용에 동의합니다.</span></label>
            <button class="primary-button wide" type="submit">로그인</button>
          </form>
        </section>
      `;
    }

    return `
      <section class="dashboard-grid">
        <div class="side-stack">
          <article class="panel">
            <div class="admin-head profile-head">
              <div>
                <p class="status-badge">${state.user.role === "admin" ? "운영자" : "일반 사용자"}</p>
                <h2>${escapeHtml(state.user.nickname)}</h2>
                <p class="subtle">${escapeHtml(state.user.email)} · ${escapeHtml(state.user.region)}</p>
              </div>
              <button class="secondary-button" type="button" data-action="logout">로그아웃</button>
            </div>
          </article>
          ${renderRewardPanel()}
          <article class="panel">
            <h3>아이 프로필</h3>
            <div class="compact-list">
              ${state.children.length ? state.children.map((child) => `
                <div class="admin-card">
                  <div class="admin-head">
                    <strong>${escapeHtml(child.nickname)} · ${getChildAge(child) ?? "?"}세</strong>
                    <button class="ghost-button compact" type="button" data-action="make-primary-child" data-child-id="${child.id}">${child.isPrimary ? "대표" : "대표 설정"}</button>
                  </div>
                  <div class="tag-row">${(child.interests || []).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>
                </div>
              `).join("") : ""}
            </div>
          </article>
          ${renderMyReviewActivity()}
          ${renderMyTalkActivity()}
          ${state.user.role === "admin" ? `<article class="panel"><h3>운영자 도구</h3><p class="subtle">장소 등록과 좋아요가 많은 톡을 확인할 수 있습니다.</p><button class="primary-button" type="button" data-nav="admin">운영자 화면 열기</button></article>` : ""}
        </div>
        <aside class="panel sticky">
          <h3>아이 프로필 추가</h3>
          <form class="compact-list" data-form="child">
            <div class="field"><label for="childNickname">아이 별칭</label><input id="childNickname" name="nickname" required></div>
            <div class="field"><label for="childBirthMonth">생년월</label><input id="childBirthMonth" name="birthMonth" type="month" value="2020-05" required></div>
            <div class="field"><label for="childInterests">관심사</label><input id="childInterests" name="interests" placeholder="과학, 체험, 자연" required></div>
            <div class="field"><label for="childStyle">활동 성향</label><select id="childStyle" name="activityStyle">${option("active", "활동적", "active")}${option("calm", "차분한 체험 선호", "active")}${option("indoor", "실내 선호", "active")}</select></div>
            <button class="primary-button" type="submit">저장</button>
          </form>
        </aside>
      </section>
    `;
  }

  function renderAdmin() {
    if (!state.user || state.user.role !== "admin") {
      return renderEmpty("운영자 권한이 필요합니다.", "마이페이지에서 운영자 포함으로 로그인하세요.", "마이페이지로 이동", "go-my");
    }

    const likedMessages = topLikedMessages();
    const reports = [...state.reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return `
      <section class="dashboard-grid">
        <div class="side-stack">
          <article class="panel">
            <h2>운영자 콘솔</h2>
            <p class="subtle">장소 등록, 신고 처리, 좋아요가 많은 톡을 확인합니다.</p>
          </article>
          <article class="panel compact-list">
            <h3>등록 장소</h3>
            ${places().map((place) => `<div class="admin-card"><div class="admin-head"><strong>${escapeHtml(place.name)}</strong><button class="ghost-button compact" type="button" data-open-place="${place.id}">보기</button></div><p class="subtle">${escapeHtml(place.category)} · ${escapeHtml(place.address)}</p></div>`).join("")}
          </article>
          <article class="panel compact-list">
            <h3>신고 관리</h3>
            ${reports.length ? reports.map(renderReportCard).join("") : `<p class="subtle">접수된 신고가 없습니다.</p>`}
          </article>
          <article class="panel compact-list">
            <h3>좋아요 많은 톡</h3>
            ${likedMessages.length ? likedMessages.map(renderLikedMessage).join("") : `<p class="subtle">아직 좋아요를 받은 톡이 없습니다.</p>`}
          </article>
        </div>
        <aside class="panel sticky">
          <h3>장소 등록</h3>
          <form class="compact-list" data-form="place">
            <div class="field"><label for="placeName">장소명</label><input id="placeName" name="name" required></div>
            <div class="field"><label for="placeCategory">카테고리</label><input id="placeCategory" name="category" value="체험 공간" required></div>
            <div class="field"><label for="placeRegion">지역</label><input id="placeRegion" name="region" value="서울" required></div>
            <div class="field"><label for="placeAddress">주소</label><input id="placeAddress" name="address" required></div>
            <div class="form-grid">
              <div class="field"><label for="placeAgeMin">최소 연령</label><input id="placeAgeMin" name="ageMin" type="number" min="0" max="12" value="4" required></div>
              <div class="field"><label for="placeAgeMax">최대 연령</label><input id="placeAgeMax" name="ageMax" type="number" min="1" max="15" value="10" required></div>
            </div>
            <div class="field"><label for="placeDescription">소개</label><textarea id="placeDescription" name="description" required></textarea></div>
            <button class="primary-button" type="submit">장소 등록</button>
          </form>
        </aside>
      </section>
    `;
  }

  function renderReportCard(report) {
    const target = contentForReport(report.type, report.targetId);
    const place = getPlace(report.placeId);
    const hidden = Boolean(target?.hidden);
    const contentText = report.type === "review"
      ? `${target?.summary || "후기"} ${target?.body || ""}`.trim()
      : target?.text || "삭제된 톡";
    return `
      <div class="admin-card report-card">
        <div class="admin-head">
          <div>
            <strong>${reportTypeLabel(report.type)} 신고</strong>
            <p class="subtle">${escapeHtml(place?.name || "장소 없음")} · 신고자 ${escapeHtml(report.reporter || "익명")}</p>
          </div>
          <span class="status-badge">${reportStatusLabel(report.status)}</span>
        </div>
        <p>${escapeHtml(contentText || "콘텐츠를 찾지 못했습니다.")}</p>
        <div class="content-actions">
          ${target ? `
            <button class="${hidden ? "secondary-button" : "danger-button"} compact" type="button" data-action="${hidden ? "restore-content" : "hide-content"}" data-report-type="${report.type}" data-target-id="${report.targetId}">
              ${hidden ? "복구" : "숨김 처리"}
            </button>
          ` : ""}
          ${target ? `<button class="ghost-button compact" type="button" data-open-place="${report.placeId}" data-tab-target="${report.type === "review" ? "reviews" : "chat"}">원문 보기</button>` : ""}
        </div>
      </div>
    `;
  }

  function renderLikedMessage(message) {
    const place = getPlace(message.placeId);
    return `
      <div class="admin-card">
        <div class="admin-head">
          <strong>${escapeHtml(place.name)}</strong>
          <span class="status-badge">좋아요 ${messageLikeCount(message)}</span>
        </div>
        <p class="subtle">${escapeHtml(message.text)}</p>
        <button class="ghost-button compact" type="button" data-open-place="${message.placeId}" data-tab-target="chat">톡 보기</button>
      </div>
    `;
  }

  document.addEventListener("click", async (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const button = target.closest("button");
    if (!button) return;

    if (button.dataset.nav) {
      setView(button.dataset.nav);
      return;
    }

    if (button.dataset.openPlace) {
      openPlace(button.dataset.openPlace, button.dataset.tabTarget);
      return;
    }

    const action = button.dataset.action;
    if (!action) return;

    if (action === "toggle-reward-detail") {
      ui.rewardExpanded = !ui.rewardExpanded;
      render();
      return;
    }
    if (action === "refresh-recommendations") {
      ui.recommendationPage += 1;
      render();
      return;
    }
    if (action === "go-my") {
      setView("my");
    }
    if (action === "go-home") setView("home");
    if (action === "reset-filters") {
      ui.query = "";
      ui.filters = { age: "profile", indoorOutdoor: "all", priceMin: "", priceMax: "", priceOptions: [], category: "all" };
      render();
    }
    if (action === "toggle-price-option") {
      const price = String(button.dataset.price || "all");
      const selected = selectedPriceOptions();
      ui.filters.priceOptions = selected.includes(price)
        ? selected.filter((item) => item !== price)
        : [...selected, price];
      ui.filters.priceMin = "";
      ui.filters.priceMax = "";
      render();
    }
    if (action === "set-filter-option") {
      const filter = button.dataset.filter;
      if (filter === "indoorOutdoor" || filter === "category") {
        ui.filters[filter] = button.dataset.value || "all";
        render();
      }
    }
    if (action === "select-marker") {
      ui.selectedPlaceId = button.dataset.placeId;
      render();
    }
    if (action === "detail-tab") {
      ui.detailTab = button.dataset.tab;
      render();
    }
    if (action === "report-content") {
      reportContent(button.dataset.reportType, button.dataset.targetId);
      return;
    }
    if (action === "hide-content" || action === "restore-content") {
      setContentHidden(button.dataset.reportType, button.dataset.targetId, action === "hide-content");
      return;
    }
    if (action === "toggle-save") {
      if (!requireUser("찜")) return;
      toggleSave(button.dataset.placeId);
    }
    if (action === "route") {
      const place = getPlace(button.dataset.placeId);
      window.open(googleDirectionsUrl(place), "_blank", "noopener");
      showToast(`${place.name} Google 지도 길찾기를 열었습니다.`);
    }
    if (action === "share") {
      const place = getPlace(button.dataset.placeId);
      const text = `나들이톡 추천: ${place.name} - ${place.address}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showToast("장소 정보가 복사되었습니다.");
      } else {
        showToast(text);
      }
    }
    if (action === "toggle-like-message") toggleMessageLike(button.dataset.messageId);
    if (action === "logout") {
      state.user = null;
      saveState();
      showToast("로그아웃했습니다.");
      render();
    }
    if (action === "make-primary-child") {
      state.children = state.children.map((child) => ({ ...child, isPrimary: child.id === button.dataset.childId }));
      ui.filters.age = "profile";
      saveState();
      showToast("대표 아이 프로필을 변경했습니다.");
      render();
    }
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.name === "age" && target.closest("[data-form='search']")) {
      ui.filters.age = target.value.trim() || "all";
    }
  });

  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const formType = form.dataset.form;
    if (!formType) return;
    event.preventDefault();
    const formData = new FormData(form);

    if (formType === "search") {
      ui.query = String(formData.get("query") || "");
      ui.filters = {
        age: String(formData.get("age") || "all"),
        indoorOutdoor: String(formData.get("indoorOutdoor") || "all"),
        priceMin: "",
        priceMax: "",
        priceOptions: formData.getAll("priceOptions").map(String).filter(Boolean),
        category: String(formData.get("category") || "all")
      };
      setView("explore");
    }

    if (formType === "login") {
      const childBirthMonth = String(formData.get("childBirthMonth") || "");
      state.user = {
        email: String(formData.get("email") || "").trim(),
        nickname: String(formData.get("nickname") || "").trim(),
        region: String(formData.get("region") || "").trim(),
        role: String(formData.get("role") || "user"),
        consentFlags: {
          terms: formData.get("termsConsent") === "on",
          privacy: formData.get("termsConsent") === "on",
          location: formData.get("locationConsent") === "on"
        }
      };
      if (childBirthMonth) {
        state.children = state.children.map((child) => ({ ...child, isPrimary: false }));
        const loginChild = state.children.find((child) => child.fromLogin);
        const nextChild = {
          ...(loginChild || {}),
          id: loginChild?.id || uid("child"),
          nickname: loginChild?.nickname || "우리 아이",
          birthMonth: childBirthMonth,
          interests: loginChild?.interests?.length ? loginChild.interests : ["체험"],
          activityStyle: loginChild?.activityStyle || "active",
          fromLogin: true,
          isPrimary: true
        };
        state.children = [nextChild, ...state.children.filter((child) => child.id !== nextChild.id)];
        ui.filters.age = "profile";
      }
      saveState();
      showToast("로그인했습니다.");
      render();
    }

    if (formType === "child") {
      state.children = state.children.map((child) => ({ ...child, isPrimary: false }));
      state.children.push({
        id: uid("child"),
        nickname: String(formData.get("nickname") || "").trim(),
        birthMonth: String(formData.get("birthMonth") || ""),
        interests: String(formData.get("interests") || "").split(",").map((item) => item.trim()).filter(Boolean),
        activityStyle: String(formData.get("activityStyle") || ""),
        isPrimary: true
      });
      ui.filters.age = "profile";
      saveState();
      showToast("아이 프로필을 저장했습니다.");
      render();
    }

    if (formType === "review") {
      if (!requireUser("후기 작성")) return;
      const photo = formData.get("photo");
      const hasPhoto = photo instanceof File && photo.size > 0;
      let photoUrl = "";
      if (hasPhoto) {
        try {
          photoUrl = await fileToDataUrl(photo);
        } catch (error) {
          console.warn("Review photo could not be loaded.", error);
          showToast("후기 사진을 불러오지 못했습니다.");
          return;
        }
      }
      state.reviews.push({
        id: uid("review"),
        placeId: form.dataset.placeId,
        author: state.user.nickname,
        rating: Number(formData.get("rating") || 5),
        childAge: String(formData.get("childAge") || "").trim(),
        summary: String(formData.get("summary") || "").trim(),
        body: String(formData.get("body") || "").trim(),
        checklist: formData.getAll("checklist").map(String).filter(Boolean),
        verified: formData.get("verified") === "on" || hasPhoto,
        photoUrl,
        hidden: false,
        createdAt: new Date().toISOString()
      });
      ui.detailTab = "reviews";
      saveState();
      showToast("후기를 등록했습니다.");
      render();
    }

    if (formType === "chat") {
      if (!requireUser("톡 작성")) return;
      const status = String(formData.get("status") || "going");
      const text = String(formData.get("message") || "").trim();
      const photo = formData.get("photo");
      const hasPhoto = photo instanceof File && photo.size > 0;
      if (!text && !hasPhoto) {
        showToast("메시지나 현장 사진 중 하나를 입력하세요.");
        return;
      }
      ui.chatStatus = status;
      let photoUrl = "";
      let photoGps = null;
      if (hasPhoto) {
        try {
          photoUrl = await fileToDataUrl(photo);
          if (state.user?.consentFlags?.location) {
            photoGps = await readPhotoGps(photo);
          }
        } catch (error) {
          console.warn("Photo could not be loaded.", error);
          showToast("사진을 불러오지 못했습니다.");
          return;
        }
      }
      const newMessage = {
        id: uid("message"),
        placeId: form.dataset.placeId,
        author: state.user.nickname,
        status,
        verified: Boolean(photoGps) || status === "onsite" || status === "visited",
        text: text || "현장 사진을 공유했어요.",
        photoUrl,
        gpsVerified: Boolean(photoGps),
        gps: photoGps,
        createdAt: new Date().toISOString(),
        hidden: false,
        likes: 0
      };
      state.messages.push(newMessage);
      const earned = awardReward("chat", form.dataset.placeId)
        + (hasPhoto ? awardReward("photo", form.dataset.placeId) : 0)
        + (aiHighlightScore(newMessage) >= 34 ? awardReward("highlight", form.dataset.placeId) : 0);
      if (isLikelyAiQuestion(newMessage.text)) {
        ui.aiQuestion = newMessage.text;
        ui.aiQuestionMessageId = newMessage.id;
      } else {
        ui.aiQuestion = "";
        ui.aiQuestionMessageId = "";
      }
      saveState();
      showToast(photoGps ? "방문 위치 인증 톡을 전송했습니다." : "톡을 전송했습니다.");
      render();
    }

    if (formType === "place") {
      const ageMin = Number(formData.get("ageMin") || 4);
      const ageMax = Number(formData.get("ageMax") || 10);
      const id = uid("place");
      state.extraPlaces.push({
        id,
        name: String(formData.get("name") || "").trim(),
        category: String(formData.get("category") || "").trim(),
        region: String(formData.get("region") || "").trim(),
        address: String(formData.get("address") || "").trim(),
        phone: "확인 필요",
        distanceKm: 8 + state.extraPlaces.length * 1.6,
        indoorOutdoor: "indoor",
        cost: "paid",
        ageBand: `${ageMin}-${ageMax}세`,
        ageMin,
        ageMax,
        interests: ["체험"],
        image: "assets/place-museum.webp",
        imageCredit: "임시 이미지",
        rating: 4.2,
        hours: "운영 시간 확인 필요",
        price: "요금 확인 필요",
        priceRange: { min: 0, max: 0, label: "요금 확인 필요" },
        agePolicy: {
          admission: { minAge: ageMin, maxAge: ageMax, label: "운영자 입력 연령 범위" },
          facility: { minAge: ageMin, maxAge: ageMax, label: `시설 권장 ${ageMin}-${ageMax}세` },
          discounts: []
        },
        description: String(formData.get("description") || "").trim(),
        facilities: {
          parking: "확인 필요",
          stroller: "확인 필요",
          nursing: "확인 필요",
          food: "확인 필요"
        },
        tips: ["운영자가 상세 정보를 보강해야 합니다."],
        crowd: "확인",
        talkActive: 0,
        mapX: Math.min(82, 28 + state.extraPlaces.length * 11),
        mapY: Math.min(76, 24 + state.extraPlaces.length * 9),
        status: "active"
      });
      ui.selectedPlaceId = id;
      saveState();
      showToast("장소를 등록했습니다.");
      setView("admin");
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return;
    if (target.name === "status") ui.chatStatus = target.value;
  });

  function toggleSave(placeId) {
    if (isSaved(placeId)) {
      state.savedPlaceIds = state.savedPlaceIds.filter((id) => id !== placeId);
      showToast("찜을 해제했습니다.");
    } else {
      state.savedPlaceIds.push(placeId);
      showToast("찜 목록에 저장했습니다.");
    }
    saveState();
    render();
  }

  function toggleMessageLike(messageId) {
    if (!requireUser("좋아요")) return;
    const message = state.messages.find((item) => item.id === messageId);
    if (!message) return;
    if (isMessageLiked(messageId)) {
      state.likedMessageIds = state.likedMessageIds.filter((id) => id !== messageId);
      message.likes = Math.max(0, messageLikeCount(message) - 1);
      showToast("좋아요를 취소했습니다.");
    } else {
      if (message.author === state.user.nickname) {
        showToast("내 톡에는 직접 좋아요를 누를 수 없습니다.");
        return;
      }
      state.likedMessageIds.push(messageId);
      message.likes = messageLikeCount(message) + 1;
      const reward = awardLikeReward(message);
      showToast(reward ? `${message.author}님에게 +${reward}P 리워드가 지급되었습니다.` : "좋아요를 반영했습니다.");
    }
    saveState();
    render();
  }

  function reportContent(type, targetId) {
    if (!requireUser(`${reportTypeLabel(type)} 신고`)) return;
    const target = contentForReport(type, targetId);
    if (!target || target.hidden) {
      showToast("신고할 콘텐츠를 찾지 못했습니다.");
      return;
    }
    const isMine = target.author === state.user.nickname;
    if (isMine) {
      showToast("내가 작성한 콘텐츠는 신고할 수 없습니다.");
      return;
    }
    const duplicate = state.reports.some((report) => report.type === type && report.targetId === targetId && report.reporter === state.user.nickname && report.status === "open");
    if (duplicate) {
      showToast("이미 신고가 접수되었습니다.");
      return;
    }
    state.reports.push({
      id: uid("report"),
      type,
      targetId,
      placeId: target.placeId,
      reporter: state.user.nickname,
      reason: "사용자 신고",
      status: "open",
      createdAt: new Date().toISOString()
    });
    saveState();
    showToast(`${reportTypeLabel(type)} 신고가 접수되었습니다.`);
    render();
  }

  function setContentHidden(type, targetId, hidden) {
    if (state.user?.role !== "admin") {
      showToast("운영자 권한이 필요합니다.");
      return;
    }
    const target = contentForReport(type, targetId);
    if (!target) {
      showToast("처리할 콘텐츠를 찾지 못했습니다.");
      return;
    }
    target.hidden = hidden;
    state.reports = state.reports.map((report) => report.type === type && report.targetId === targetId
      ? { ...report, status: hidden ? "hidden" : "restored", resolvedAt: new Date().toISOString(), resolvedBy: state.user.nickname }
      : report);
    saveState();
    showToast(`${reportObjectLabel(type)} ${hidden ? "숨김 처리" : "복구"}했습니다.`);
    render();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPromptEvent = event;
    if (installButton) installButton.hidden = false;
  });

  installButton?.addEventListener("click", async () => {
    if (!installPromptEvent) {
      showToast("현재 브라우저에서는 메뉴에서 홈 화면 추가를 이용하세요.");
      return;
    }
    installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    installPromptEvent = null;
    if (installButton) installButton.hidden = true;
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker registration failed.", error);
    });
  }

  render();
  updateRealtimeData();
  window.setInterval(() => updateRealtimeData(), REALTIME_REFRESH_MS);
})();
