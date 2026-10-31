# สนามเด็กเรียน: art style for new pictures

Use this when asking another image AI (ChatGPT, Gemini, Midjourney) for a new picture.
Pictures made this way match the 3 skate parks on the map (tools/incoming/*.jpg).

## How to ask
1. Attach 1 or 2 pictures as a style reference. Use `tools/incoming/ramps.jpg`, plus the Kenney skater `shared/img/skate/boy.png` if the picture has a person.
2. Paste the **style block** below, then add a short **subject** line for what you want.
3. Save the result into `tools/incoming/`, then ask Claude to put it in the app. Claude removes the background and resizes it.

## Style block (copy as is)
```
Style: cute, minimal 3D illustration in the style of the attached image and the
Kenney "Mini Skate" models. Chunky low-poly toy-like shapes, rounded edges,
flat soft pastel colors, soft matte lighting from the top-left, soft
lavender-grey shadows to the bottom-right, no outlines, no texture noise.
Isometric view from 30° above.
Colors: light warm-grey concrete (#E6E2DA), warm orange (#E8823A),
soft blue (#4A7FCF), soft purple (#8C6FD6), sunny yellow (#FFC93C),
soft leaf green (#7DBB5A), cream background (#FBF7EC).
Plain flat cream background #FBF7EC, nothing else around the subject.
NO text, NO numbers, NO letters, NO logos, NO watermark.
Made for a children's learning app: friendly, clean, not busy.
```

## Subject line examples
- One object (an icon or a prize):
  `Subject: a single small golden trophy cup, centered, filling about 80% of a 1024x1024 square image.`
- A whole park:
  `Subject: one skate park island, image 2400x1600, exactly N separate obstacles spaced apart along a winding path, small trees and benches only around the edges, no people, no dotted lines on the floor.`
- A person: always the same boy as `shared/img/skate/boy.png`. He has fair skin, a red cap and a red/white top. He looks like a blocky Kenney toy figure.

## Rules learned so far
- Ask for **no text and no numbers**. The AI draws Thai and digits badly; the app adds its own labels.
- Ask for **no dotted lines or paths**. The map shows only number badges, no route.
- AI often miscounts objects. Extra pieces are fine: Claude uses them as decoration.
- Download the **largest size** offered (Upscale if there is a button). 1264px wide is the minimum.
- Keep one chat for a set of pictures, so the style stays the same.
- Switching to another image AI works (ch10 oval plaza, 2026-11-01): attach 3 parks as reference, start with "Redraw the LAST attached image ... match camera angle, object scale, lighting", and ask for simple shapes (oval, L). "Bean shape" was ignored. A .webp or other size is fine: set `file` for the zone in `tools/cut.html`.
- For a title or poster scene (like the home page `tools/incoming/hero.webp`), skip the floor or island. Float big, bold objects around an empty middle; they don't need real scale. ChatGPT gave the best result for this.
- Attach `tools/incoming/hero.webp` as the style reference for cute stand-alone objects. Attach `ramps.jpg` for whole parks.
