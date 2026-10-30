# สนามเด็กเรียน: design guide

This is the look the owner chose for the site. Follow it for every new page, lesson or feature, so the site stays one piece.
Pictures have their own guide in `tools/ART-STYLE.md`, with the prompt block for the image AI.

## Feel
- **Cute and minimal.** Soft, friendly and calm. Only what a child needs on screen: no extra frames, boxes or repeated labels.
- **Made for a child on an iPad.** Big tap targets (at least 48px, main buttons 52 to 56px). Short Thai sentences. One clear next step on every screen.
- **Skate-park theme.** The boy in the red cap (`shared/img/skate/boy.png`) is the only character; he has fair skin. Chapters are skate-park zones, lessons are stops on the map.
- Check every change at iPad size (820 × 1180) **and** phone size (375 × 812).

## Colours (tokens in `shared/core.css`)
| Token | Use |
|---|---|
| `--bg` #FBF7EC | cream page background |
| `--card` #FFFFFF | boxes, cards, ghost buttons |
| `--line` #ECE3CC | **all outlines and button shadows** |
| `--yellow` #FFCD2E / `--yellow-deep` #E3A700 | main buttons, highlights, and their bottom shadow |
| `--yellow-soft` #FFF1BF | callouts, labels |
| `--ink` #2B2620 | text only |
| `--muted` #6F6656 | hints, small print |
| `--green` / `--blue` / `--orange` | cake slices, as in the textbook |
| `--good` / `--bad` (+ `-soft`) | right / wrong feedback |

There is only a light look; no dark mode.

## Boxes and buttons
- **Never a black outline.** `--ink` is for text, not for borders or shadows.
- **One exception:** the level pill at the top right of the home page (level number, EXP bar, "Lv.1 · 0 EXP") is solid `--ink` with white text and a yellow level circle. The owner wants it dark.
- **White box or ghost button:** `background: var(--card); border: 2px solid var(--line); box-shadow: 0 4px 0 var(--line);`. This is the "ดูแผนที่ด่าน" look.
- **Yellow button or label:** `background: var(--yellow); box-shadow: 0 4px 0 var(--yellow-deep);`, with no border. This is the "เล่นด่าน" look. Use one yellow button per screen, for the main action.
- A box floating over a picture (like the stop card on the map) may add a soft drop shadow: `0 10px 24px rgba(43, 38, 32, .12)`.
- Number badges on the map are coloured pills with a white rim.
- Corners are round: cards 18 to 28px, buttons fully round (999px).
- Pressed state: move down 2 to 3px and shrink the bottom shadow.

## Words and arrows
- **No text arrows** (→ ←) on buttons: write "เล่นด่าน 6.1", not "เล่นด่าน 6.1 →".
- **Direction buttons are round ‹ ›** (`.arrow-btn` in lessons, `.chap-nav .arrow` on the map).
- Lesson tabs are always **1 เนื้อหา · 2 ลองเล่น · 3 ตอบคำถาม**. Every tab ends with a button to the next step.
- Fonts: Mitr for headings, numbers and buttons (`--display`); Anuphan for body text (`--body`).

## Lessons
- Copy the newest lesson (`math/p4/6-3.html`) and keep the same shape:
  - **เนื้อหา:** about 9 tap-through steps with animated pictures. The cake story continues across chapter 6.
  - **ลองเล่น:** a hands-on builder, a matching game, then the bottom bar to the quiz.
  - **ตอบคำถาม:** 8 random questions with 4 options each, and stars (4 right = 1 star, 6 = 2, 8 = 3).
- Lessons open in book order. The next one unlocks at 1 star, with the unlock show on the map.
- Before release, bulk-test the quiz: options are all different, exactly one is right, and every right answer is worked out.

## Map
- Built lesson, not reached yet: grey stop with a lock badge.
- Lesson not built yet: grey stop with a faded number in a dashed outline. No lock.
- The skater waits at the next stop, under a yellow "เริ่มตรงนี้!" label.
- Cards close when the page scrolls or its width changes.

## Motion
Gentle and short: bob, roll, twinkle, pop. Celebrate wins (stars, unlocks) with a sound and a burst. Nothing flashes or moves fast.
