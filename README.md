# Gomi & Mochi

*Too pretty to throw away.*

A cosy junk-journalling story game that runs in the browser. Made for **Twigpine Project Treetop, Round 01 (Games)**, 9–16 Oct 2026.

After Obaachan (her grandma) passed away, Hana moved to a quiet town in Japan with her cat, Mochi, and a box of things she couldn't throw away. Here rubbish waits days for its collection day, so she starts junk-journalling with it. Every morning a paper bag of junk and an unsigned note appear at her door…

Collect the three memories hidden in the bags' polaroids to find out who's leaving them, and to help Hana let go.

## How to play
- **Morning:** read the note and open the bag, then choose what to do: step into the polaroid, tend the balcony garden, pet Mochi, or start journalling.
- **Balcony garden:** pick 3 flowers. Tap Mochi before Mochi naps on (and squashes) one.
- **Press:** hold to press down, let go to ease off. Keep the needle in the drifting green zone until the bar fills.
- **Memories:** step into an old polaroid and find three keepsakes to bring the faded photo back to colour.
- **Journal:** a junk box of scraps sorted by the day's rubbish (Wednesday brings a plastic bottle to cut shapes from), big paper sheets to snip with freehand scissors, washi tape, stamps, post-its, handwriting and your own photos. Realistic layering: lift the top piece before the one underneath. Tape things down before Mochi walks across the page. Each day has a little to-do list.
- **Day 3:** seal a thank-you letter with a timed wax seal.
- Save or share your finished spread as a keepsake image.

## Tech
Plain HTML, ES modules and Canvas 2D. No build step and no dependencies; every texture, flower, scrap, the cat and Hana's hands are drawn in code. Sound effects and the music-box loop are synthesised with Web Audio. Fonts: Fraunces, Caveat and Special Elite (Google Fonts, SIL OFL).

Run locally with any static server, for example:

```
python3 -m http.server 8000
```

then open http://localhost:8000.
