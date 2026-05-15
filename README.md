# 나들이톡 로컬 MVP 웹앱

이 폴더의 PRD, MVP 기능명세서, IA/와이어프레임, 목업을 바탕으로 만든 실행 가능한 정적 웹앱입니다.
현재 버전은 데스크톱 브라우저 화면에서 검색, 비교, 상세 확인, 장소별 톡을 한 번에 다루는 웹앱형 레이아웃입니다.

## 실행

```bash
python3 -m http.server 4173
```

브라우저에서 `http://127.0.0.1:4173`을 엽니다.

## 구현 범위

- 홈 추천, 날씨 추천, 톡 활발한 장소
- 탐색 검색, 연령/실내외/비용/카테고리 필터, 지도형 마커
- 장소 상세 정보, 후기 탭, 장소별 톡 탭
- Open-Meteo 기반 장소별 실시간 날씨 자동 업데이트
- 로컬 로그인, 아이 프로필, 찜 목록, 내 활동
- 후기 작성, 톡 전송, 메시지 신고
- 운영자 장소 등록, 신고 목록 확인, 메시지 숨김 처리
- PWA manifest와 service worker

데이터는 서버 없이 브라우저 `localStorage`에 저장됩니다. 다른 브라우저나 기기와 동기화되지는 않습니다.
실시간 날씨는 앱 실행 시와 15분 주기로 Open-Meteo에서 가져오며, 네트워크가 막히면 마지막으로 저장된 값을 사용합니다.
Google Places, 서울 열린데이터 등 API 키가 필요한 장소 운영/혼잡 데이터는 백엔드 프록시를 붙이면 같은 구조로 확장할 수 있습니다.

## 임시 사진 출처

- `assets/place-museum.jpg`, `assets/place-museum.webp`: Pexels / Daka
- `assets/place-playroom.jpg`, `assets/place-playroom.webp`: Pexels / BI ravencrow
- `assets/place-park.jpg`, `assets/place-park.webp`: Pixabay / khangptruong
- `assets/place-science.jpg`, `assets/place-science.webp`: Pixabay / adventurous_blondine
- `assets/place-art.jpg`, `assets/place-art.webp`: Pixabay / RosieKliskey
