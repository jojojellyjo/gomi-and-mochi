# Gomi & Mochi

*Too pretty to throw away.*

A cosy junk-journalling story game that runs in the browser. Made for **Twigpine Project Treetop, Round 01 (Games)**, 9–16 Oct 2026.

Hana has just moved into a tiny apartment in a quiet Japanese town with her cat, Mochi. Rubbish waits days for its collection day, so she starts journalling with it. Every morning a paper bag of junk and an unsigned note appear at her door…

## How to play
- **Morning:** read the note, open the bag. The rubbish calendar shows today's collection.
- **Balcony garden:** pick 3 flowers. Tap Mochi before Mochi naps on (and squashes) one.
- **Press:** hold or twist the four wing nuts (clockwise tightens, anticlockwise unwinds). Keep them even and in the green.
- **Journal:** a junk box of ~70 scraps, washi tape, stamps, post-its and your own photos. Freehand scissors, glue stick, realistic layering. Tape or glue things down before Mochi walks across the page.
- **Memories:** step into the bag's polaroid and find three keepsakes to bring the faded photo back to colour.
- **Day 3:** seal a thank-you letter with a timed wax seal.
- Save or share your finished spread as a keepsake image.

## Tech
Plain HTML, ES modules and Canvas 2D. No build step and no dependencies; every texture, flower, scrap, the cat and Hana's hands are drawn in code. Sound effects are synthesised with Web Audio. Fonts: Fraunces, Caveat and Special Elite (Google Fonts, SIL OFL).

Run locally with any static server, for example:

```
python3 -m http.server 8000
```

then open http://localhost:8000.
