# 07. 이동 속도

## 목적과 관찰 결과

게임 시작부터 속도감을 느끼고, 거리가 증가할수록 끊김 없이 가속되어 장애물 패턴의 긴장도가 올라간다.

## 현재 확정 규칙

- 속도는 거리 함수이며 1000m 경계에서 점프하지 않는다.
- 청크 좌표는 시간 대신 거리로 정의한다.
- 기본 속도와 최대 속도는 튜닝 파일에서 관리한다.

## 튜닝 파일

- `src/game/config/tuning/speed.ts`

## 담당 코드

- `src/features/progression/DistanceProgression.ts`, `progressionConfig.ts`

## 변경 시 검증

- `npm run test:run -- src/features/progression`
- `03-speed-curve.png` 기준 0/1000/2000/3000/5000m 캡처

## 참고 이미지

- `docs/reference/game-feel/03-speed-curve.png`
