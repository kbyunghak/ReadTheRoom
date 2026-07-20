> Status: Korean source note
> Purpose: UX layout reference draft. Not an official portfolio summary.

1. UX 설명 문서 초안
1. 화면 개요

이 화면은 선택형 스토리 게임의 메인 인터페이스로, 사용자가 현재 상황을 이해하고 선택지를 통해 다음 행동을 결정하도록 설계한다.
전체 화면은 정보의 우선순위에 따라 5개의 파트로 구분한다.

Header 파트
Scene 파트
Status Overlay 파트
Narrative 파트
Choice 파트

이 구분의 목적은 각기 다른 디바이스에서도 화면 구조와 사용자 경험을 일관되게 유지하기 위함이다.

2. 설계 원칙
2.1 우선순위 원칙

이 화면에서 사용자 시선의 우선순위는 다음과 같다.

Title과 현재 장면 인지
캐릭터와 배경을 통한 상황 몰입
현재 컨디션 확인
상황 설명 읽기
선택지 탐색 및 선택

즉, 화면은 예쁘기보다 읽히고, 이해되고, 선택 가능해야 한다.

2.2 반응형 원칙

각 디바이스에서 동일한 픽셀 구성을 유지하는 것이 아니라, 동일한 정보 위계와 시선 흐름을 유지하는 것을 목표로 한다.

2.3 시각적 일관성 원칙

다음 요소는 전 파트에서 통일감을 유지해야 한다.

버튼의 모서리 곡률
패널의 반투명도와 테두리 스타일
텍스트 계층 구조
아이콘 스타일
여백 간격 체계
블루 계열 중심의 색상 톤
3. 파트별 UX 설명
3.1 Header 파트
역할

화면의 최상단에서 현재 장면 정보와 주요 기능 버튼을 제공한다.

구성 요소
스토리맵 버튼
Title
Status 버튼
English 버튼
UX 목적
사용자가 현재 어느 장면에 있는지 즉시 인지할 수 있어야 한다.
스토리맵, 상태 확인, 언어 보조 기능에 빠르게 접근할 수 있어야 한다.
작은 화면에서도 버튼과 제목이 충돌하지 않아야 한다.
레이아웃 원칙
Header는 화면 상단에 고정된 독립 영역으로 배치한다.
Title은 중앙 혹은 중앙 기준 영역에서 가장 높은 시각적 우선순위를 가진다.
좌측에는 스토리맵 버튼, 우측에는 Status와 English 버튼을 배치한다.
버튼 스타일은 동일한 높이, 동일한 테두리, 동일한 패딩 규칙을 따른다.
반응형 규칙
화면 폭이 줄어들면 Title의 좌우 여백을 먼저 줄인다.
그 다음 버튼 내부 패딩을 축소한다.
그래도 공간이 부족하면 버튼 텍스트를 축약하거나 아이콘 중심으로 전환한다.
Title은 줄바꿈보다 축약을 우선 검토한다.
주의점

Header는 조작 요소가 모여 있으므로, 장식보다 명확성이 우선이다.
버튼마다 스타일이 다르면 화면이 급격히 조잡해 보인다.

3.2 Scene 파트
역할

배경과 캐릭터를 통해 장면의 분위기와 몰입감을 전달한다.

구성 요소
배경
캐릭터
UX 목적
사용자가 현재 상황의 장소와 정서를 직관적으로 이해하도록 돕는다.
텍스트를 읽기 전에 장면의 맥락을 시각적으로 전달한다.
캐릭터가 감정적 중심축 역할을 한다.
레이아웃 원칙
배경은 공간 정보를 제공하는 레이어다.
캐릭터는 배경 위의 중심 오브젝트로 배치한다.
캐릭터의 얼굴과 상반신은 핵심 정보이므로 다른 UI에 가려지지 않아야 한다.
배경은 정보 전달을 방해하지 않도록 적절히 흐리거나 어둡게 처리할 수 있다.
반응형 규칙
작은 화면에서는 배경보다 캐릭터 가시성을 우선한다.
캐릭터 크기는 유지하되 좌우 여백이나 배경 디테일을 줄인다.
캐릭터 얼굴은 항상 안전 영역 안에 있어야 한다.
중요 표지판이나 장소 단서는 잘리더라도 캐릭터와 UI가 우선이다.
주의점

배경과 캐릭터를 예쁘게 넣는 것보다 중요한 건 텍스트와의 공존이다.
장면이 강해도, 선택지가 안 읽히면 실패다.

3.3 Status Overlay 파트
역할

현재 상태를 짧고 직관적으로 보여주는 정보 오버레이다.

구성 요소
현재 컨디션 카드
자금 아이콘
멘탈 아이콘
체력 아이콘
취약 상태 강조 정보
UX 목적
사용자가 현재 플레이 상태를 빠르게 파악할 수 있어야 한다.
장황한 설명 없이도 위험 신호를 인지할 수 있어야 한다.
서사 몰입을 깨지 않으면서 보조 정보를 제공해야 한다.
레이아웃 원칙
Scene 파트 위에 떠 있는 카드 형태로 배치한다.
캐릭터와 직접 충돌하지 않는 위치에 둔다.
카드 내부는 제목, 상태 설명, 상태 아이콘 순서로 정리한다.
핵심 위험 요소는 색상이나 강조 텍스트로 즉시 보이게 한다.
반응형 규칙
화면이 좁아지면 카드 너비를 줄인다.
설명 문구는 1줄 또는 2줄 이내로 축약한다.
아이콘은 유지하되 라벨은 축약 가능하다.
극단적으로 좁은 화면에서는 확장형 카드 대신 축소형 상태 배지로 전환할 수 있다.
주의점

이 파트는 조연이다.
너무 커지면 캐릭터와 본문을 잡아먹는다.
상태 정보는 중요하지만, 주인공이 되어서는 안 된다.

3.4 Narrative 파트
역할

현재 상황의 맥락을 서술형 텍스트로 제공한다.

구성 요소
상황 설명 라벨
본문 텍스트
UX 목적
사용자가 왜 지금 이 선택을 해야 하는지 이해하도록 한다.
장면의 정서와 긴장감을 언어로 보완한다.
선택지 해석에 필요한 최소한의 정보를 제공한다.
레이아웃 원칙
반투명 패널로 Scene 파트 위에 겹치되, 가독성을 충분히 확보한다.
라벨은 패널 상단 좌측에 고정한다.
본문은 2줄에서 4줄 정도로 유지하는 것이 이상적이다.
줄간격과 자간은 모바일에서도 편하게 읽히는 수준을 유지한다.
반응형 규칙
화면이 작아질수록 문장은 더 짧아져야 한다.
패널 높이는 가변 가능하지만, Choice 영역을 과도하게 밀어내면 안 된다.
텍스트 양이 많아질 경우 스크롤보다 문장 축약을 우선 검토한다.
주의점

상황 설명은 소설이 아니다.
읽히는 문장이어야 하고, 선택을 돕는 문장이어야 한다.
설명 욕심이 많아지면 UX가 바로 망가진다.

3.5 Choice 파트
역할

사용자가 실제 행동을 결정하는 핵심 인터랙션 영역이다.

구성 요소
보기 1
보기 2
보기 3
UX 목적
각 선택지의 차이를 빠르게 비교할 수 있어야 한다.
터치하기 쉬운 크기와 명확한 영역 구분이 필요하다.
선택 전 단계에서 부담 없이 읽히고 눌려야 한다.
레이아웃 원칙
선택지는 세로 카드 구조로 정렬한다.
각 카드에는 번호, 텍스트, 여백 규칙이 일관되게 적용된다.
선택지 간 간격은 시각적으로 충분히 구분될 만큼 확보한다.
선택지 전체가 하나의 터치 영역이 되어야 한다.
반응형 규칙
텍스트가 길어져도 카드 높이는 유연하게 늘어날 수 있어야 한다.
번호 배지는 항상 좌측 정렬을 유지한다.
작은 화면에서도 최소 터치 영역은 유지해야 한다.
줄바꿈이 생겨도 카드 간 시각 균형이 무너지지 않아야 한다.
주의점

선택지는 보기 좋게 만드는 것보다, 잘 비교되고 잘 눌리는지가 더 중요하다.
여기서 읽기 피로가 생기면 게임 흐름이 끊긴다.

4. 디바이스 일관성 기준

이 부분이 빠지면 문서가 반쪽짜리야.
반드시 넣어야 한다.

4.1 공통 유지 요소
5개 파트의 순서
정보 위계
버튼 스타일
주요 색상 체계
캐릭터 중심성
선택지 가독성
4.2 가변 허용 요소
파트 간 세부 간격
컨디션 카드 크기
배경 노출 범위
텍스트 길이
버튼 내부 여백
4.3 절대 깨지면 안 되는 조건
캐릭터 얼굴이 가려지지 않을 것
Header 버튼끼리 겹치지 않을 것
상황 설명과 선택지가 충돌하지 않을 것
선택지가 터치 불가능한 크기로 작아지지 않을 것
상태 카드가 화면의 주인공처럼 커지지 않을 것
5. 요약 문장

이 화면은 Header, Scene, Status Overlay, Narrative, Choice의 5개 파트로 구성되며, 각 파트는 명확한 역할과 우선순위를 가진다.
다양한 디바이스에서도 동일한 픽셀 구성이 아니라 동일한 정보 구조와 시선 흐름을 유지하는 것을 목표로 한다.
따라서 모든 반응형 조정은 장식보다 가독성, 몰입감, 선택 가능성을 우선으로 수행한다.

2. 이미지 생성용 프롬프트 골격

이건 네가 이미지 생성할 때 계속 재사용할 수 있는 뼈대야.

2.1 기본 골격

아래는 구조 중심 프롬프트 템플릿이다.

Create a polished mobile visual novel game screen with a clean, consistent UX layout. 
The screen should be divided into five clearly organized parts: Header, Scene, Status Overlay, Narrative, and Choice.

1. Header part:
Place a top navigation area with four elements:
a Story Map button on the left,
a centered title,
a Status button,
and an English button on the right.
All buttons should share the same visual style, including height, corner radius, border style, padding, and font treatment.
The title should be visually dominant but should not collide with the buttons.
Design the header to remain consistent across different device sizes.

2. Scene part:
Show an airport interior background with cool blue lighting and a clear YVR airport atmosphere.
Place a young male student character in the center area.
The character should be the emotional focal point of the screen.
Keep the face and upper body clearly visible and unobstructed.
The background should support immersion but should not overpower the UI or reduce text readability.

3. Status Overlay part:
Place a floating status card in the upper right area of the Scene.
This card should summarize the current condition of the player.
Include a condition title, a short condition description, and three status icons for money, mental, and stamina.
The card should feel informative but secondary.
It should not compete visually with the character or the main text content.

4. Narrative part:
Place a semi transparent text panel below the Scene, labeled as a situation description.
This panel should contain a short narrative paragraph explaining the current situation.
The text should be easy to read on mobile screens.
The panel should feel integrated with the background while maintaining strong readability.

5. Choice part:
Place three vertically stacked choice cards below the narrative panel.
Each choice card should have a number badge on the left and clear readable text.
The cards should have consistent spacing, size, and styling.
They must feel tappable and easy to compare.
The choice area should be the primary interaction zone.

Overall design goals:
Maintain visual consistency across all sections.
Use a modern blue toned glassmorphism inspired UI.
Ensure readability, clean hierarchy, responsive friendliness, and strong emotional immersion.
The layout should look stable across different screen sizes.
2.2 네 현재 화면에 맞춘 구체형 골격
Create a polished mobile story game screen set at YVR airport.

The screen should follow a five part UX structure.

Header:
At the top, place a unified navigation bar with four elements:
Story Map button on the left,
title in the center reading "Day 1. YVR 공항, 공포의 입국 심사",
Status button,
English button on the right.
All buttons must share the same size, border style, corner radius, icon style, font style, and padding.
The header should look balanced and clean.

Scene:
Use a cool blue airport background with visible YVR signage and immigration checkpoint atmosphere.
Place a young Korean male student character in the center, wearing a hoodie and a UBC jacket, holding his passport.
He should look slightly nervous but friendly.
His face and upper body must remain fully visible and must not be blocked by UI.

Status Overlay:
Place a floating condition card in the upper right area.
The card should show the current condition with a heart icon, the label "현재 컨디션: 주의", a short subtext, and three icons labeled "자금", "멘탈", and "체력".
The card should feel helpful and compact, not oversized.

Narrative:
Place a semi transparent dark blue panel below the character with the label "상황 설명".
The narrative text should explain that the player has just arrived in Vancouver after a long flight and needs to answer immigration calmly and confidently.
Text must be readable, well spaced, and short enough for mobile display.

Choice:
Below the narrative panel, place three stacked choice cards with number badges 1, 2, and 3.
Each card should clearly show a different response option.
All three cards should have the same style and spacing, with a touch friendly design.
The choice section should be the clearest interactive area on the screen.

Overall:
Use a clean, high quality, blue toned visual novel interface.
Make the layout feel responsive, balanced, and visually consistent.
Prioritize readability, emotional immersion, and interaction clarity.
3. 바로 복붙 가능한 압축 버전

네가 문서 초안 시작할 때 짧게 쓰려면 이 버전이 편하다.

3.1 UX 설명 압축 버전
본 화면은 Header, Scene, Status Overlay, Narrative, Choice의 5개 파트로 구성된다.

1. Header 파트는 스토리맵, Title, Status, English 기능을 제공하며, 상단 고정 네비게이션 역할을 수행한다. 버튼 스타일과 간격은 통일되어야 하며, 작은 화면에서도 텍스트와 버튼이 겹치지 않아야 한다.

2. Scene 파트는 배경과 캐릭터를 통해 장면 몰입감을 전달한다. 캐릭터는 화면 중심 시각 요소이며, 얼굴과 상반신은 다른 UI에 가려지지 않아야 한다. 배경은 분위기를 전달하되 본문 가독성을 해치면 안 된다.

3. Status Overlay 파트는 현재 컨디션과 핵심 상태 아이콘을 보여주는 보조 정보 영역이다. 자금, 멘탈, 체력 정보를 짧고 직관적으로 보여주며, 캐릭터나 본문보다 시각적 우선순위가 낮아야 한다.

4. Narrative 파트는 현재 상황을 서술하는 영역이다. 짧고 읽기 쉬운 문장으로 맥락을 제공하며, 모바일에서도 가독성이 유지되도록 반투명 패널과 적절한 줄간격을 사용한다.

5. Choice 파트는 사용자의 실제 행동 선택 영역이다. 보기 1, 2, 3은 동일한 카드 구조와 충분한 터치 영역을 가져야 하며, 각 선택지는 쉽게 비교되고 즉시 선택 가능해야 한다.

이 5개 파트는 디바이스가 달라져도 동일한 정보 위계와 시선 흐름을 유지해야 한다.
3.2 프롬프트 압축 버전
Create a polished mobile visual novel game screen with a five part UX structure: Header, Scene, Status Overlay, Narrative, and Choice. 
In the Header, show a Story Map button, the title "Day 1. YVR 공항, 공포의 입국 심사", a Status button, and an English button with unified button styling. 
In the Scene, show a blue toned YVR airport background and a young male student character centered on screen, with the face and upper body clearly visible. 
In the Status Overlay, place a compact floating condition card showing "현재 컨디션: 주의" with icons for 자금, 멘탈, and 체력. 
In the Narrative section, place a semi transparent situation description panel with short readable Korean text. 
In the Choice section, place three stacked choice cards with number badges 1, 2, and 3. 
Make the interface clean, consistent, touch friendly, readable, and visually balanced across different device sizes.
