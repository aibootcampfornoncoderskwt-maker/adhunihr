# Asset sources

## Brand
- `logo-source.webp`: supplied Adhuni A/person logo from the conversation, converted to WebP. Used to match the supplied website reference. Ownership/approval remains with the client.
- `favicon.svg`: simple matching A/person navigation icon, not a final identity master.

## Current people imagery
All people images (`hero-v2.webp`, `hero.webp`, `meeting.webp`, `team.webp`, `office.webp`, `industrial.webp`, `warehouse.webp`, `candidate.webp`) are AI-generated illustrative scenes, revised with the built-in image-generation tool to depict adult male professionals. They do not depict actual Adhuni employees, candidates, offices or projects. The previous female candidate stock photograph is no longer included.

Edit prompt: replace every woman with a realistic adult Indian male professional; preserve scene, composition, lighting and industry context; business clothing for offices and appropriate safety wear for industrial scenes; natural expressions, no text or graphics.

## Real stock photography
`hospitality.webp`: Vidal Balielo Jr., “Tables and Chairs in Modern Restaurant”, https://www.pexels.com/photo/tables-and-chairs-in-modern-restaurant-12688956/ — Pexels license. Empty restaurant interior retained.

## Geography and flags
- `recruitment-map.svg`: generated from world-atlas countries-110m data (Natural Earth), using d3-geo and topojson-client. Map is illustrative geographic context, not a legal boundary statement. Natural Earth data is public domain: https://www.naturalearthdata.com/about/terms-of-use/
- Flags: flag-icons package (MIT), https://github.com/lipis/flag-icons. License included in `public/flags/LICENSE`.

## Fonts
- Inter and Barlow Condensed, locally bundled through @fontsource packages. SIL Open Font License. License files included in `licenses/`.


## GCC-neutral hero revision
hero-gcc.webp (also mirrored to legacy hero filenames) removes Kuwait-specific landmarks. Generated illustration: male business meeting in a neutral contemporary Gulf office district, no iconic buildings, country flags or city-specific landmarks. Not a photograph of an Adhuni office.

## September 25 additions
`interview.webp` and `planning.webp` are generated male-only illustrations used in the revised layouts. Replacement with real photography is pending. No researched Pexels people photos were downloaded or included.

## GCC country photographs — September 25
All six country images are real photographs, not generated. Resized and converted to WebP; cropped by CSS. Each modified photo retains its source licence.

- country-kuwait.webp: Zairon; https://commons.wikimedia.org/wiki/File:Kuwait_City_Skyline_1.jpg; CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).

- country-saudi-arabia.webp: B.alotaby; https://commons.wikimedia.org/wiki/File:Riyadh_Skyline.jpg; CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).

- country-uae.webp: Stefano Vigorelli; https://commons.wikimedia.org/wiki/File:Dubai_skyline,_Dubai_UAE.jpg; CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).

- country-qatar.webp: Haakon S. Krohn; https://commons.wikimedia.org/wiki/File:Doha_skyline.jpg; CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/).

- country-oman.webp: dronepicr; https://commons.wikimedia.org/wiki/File:Panoramic_view_of_Muscat,_Oman_(53697954168).jpg; CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/).

- country-bahrain.webp: Chris Price; https://commons.wikimedia.org/wiki/File:Manama_Skyline.jpg; CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/).

## New sector photos

- oil-refinery.webp: Dirk Ingo Franke, https://commons.wikimedia.org/wiki/File:Hemmingstedt_raffinerie_nacht_uebersichtlich.JPG; CC BY-SA 2.0 DE, https://creativecommons.org/licenses/by-sa/2.0/de/. Resized/WebP; manufacturing cropped to remove upper background. Adapted image retains source licence. Not an Adhuni project.


`public/industries/industry-manufacturing.webp` (and `-640`) is a temporary stand-in cropped from `industrial.webp` (AI-generated, illustrative). Replace it with the final manufacturing illustration. The earlier Wikimedia car-factory photo was removed from the project.

## Homepage slideshow — 2 October 2026
`public/hero/hero-{1-oil-gas,2-construction,3-healthcare,4-logistics,5-corporate}.webp` and corresponding `-mobile.webp` files are derived from the five built-in image_gen illustrations in `public/images/hero-generated/`. The user-named PNG files in `public/hero/` were absent; existing generated sources were used. Original images and prompts are retained. These scenes do not depict actual ADHUNI staff, clients, projects or facilities. Alt text identifies their illustrative role. Desktop variants are 1920px wide (upscaled from the generated originals); mobile variants are 900px wide. Each is below 250,000 bytes. Regenerate with `node scripts/prepare-hero-images.mjs`; this prefers the named PNG sources if supplied later. Existing `public/images/hero-gcc.webp` is retained.

## Brand icons

WhatsApp, Instagram and LinkedIn-in glyphs extracted unchanged from @fortawesome/free-brands-svg-icons 7.3.1 (Font Awesome Free). Rendered with original viewBoxes and filled paths; full bundled licence in licenses/Font-Awesome-Brands-LICENSE.txt. Brand trademarks belong to their owners.

## Approved logo — 27 September 2026
Client-approved handshake logo supplied as fdc0e801-f232-4a26-bc2b-c4a2aac91eb7.png. Original pixels preserved in public/images/adhuni-approved.png. Shared BrandArtwork component displays the lockup using an SVG viewport to remove presentation whitespace; no artwork recolouring or redraw. Favicon uses a viewport of the same approved symbol. This supersedes the previous A-shaped logo.

## Dedicated sector pages — 30 September 2026
Five new photorealistic workplace illustrations created with the built-in image_gen tool: sector-healthcare.webp, sector-education.webp, sector-technology.webp, sector-retail.webp, sector-facilities.webp. These do not depict real Adhuni staff or projects. Generated originals retained; WebP copies saved in public/images. Full prompts and paths: docs/sector-image-prompts.json.

- sector-oil-gas.webp: Generated with built-in image_gen. Daylight refinery technicians in PPE; illustrative scene, not actual Adhuni staff or projects. Replaces the night refinery image in the sector catalog. Prompt and original file recorded in docs/sector-image-prompts.json.

## Generated country hero illustrations � 3 October 2026

Six AI-generated illustrative cityscapes created sequentially using the built-in image_gen tool, saved in public/images/countries-generated/: country-kuwait.png, country-saudi-arabia.png, country-uae.png, country-qatar.png, country-bahrain.png and country-oman.png. Styled to match the existing website heroes. These are illustrative skylines, not documentary photographs or evidence of Adhuni offices. Full prompts: docs/country-image-prompts.json. Existing licensed country photographs are retained.


## Generated page illustrations - 3 October 2026

- public/images/pages-generated/about-hero.png: AI-generated illustrative mixed-gender team walking through a Kuwait City office corridor, created with built-in image_gen. Not actual Adhuni staff or premises. Prompt retained in docs/page-image-prompts.json.

- public/images/pages-generated/about-hero-v2.png: Revised About hero using built-in image_gen, depicting an illustrative South Asian team of two men and two women in business suits. Not actual Adhuni staff or premises. Supersedes the first generated version for selection.

- public/images/pages-generated/about-story.png: AI-generated illustrative close-up of consultant hands reviewing CVs, created with built-in image_gen. Not actual Adhuni records or staff. Prompt: docs/about-story-prompt.txt.

- public/images/pages-generated/contact-hero.png: AI-generated illustrative South Asian consultant on a phone call at a standing desk, created with built-in image_gen. Not actual Adhuni staff or premises. Prompt: docs/contact-hero-prompt.txt.

- public/images/pages-generated/employers-hero.png: AI-generated illustrative South Asian female HR manager and male recruitment consultant shaking hands in a boardroom, created with built-in image_gen. Not actual Adhuni staff, clients or premises. Prompt: docs/employers-hero-prompt.txt.

- public/images/pages-generated/candidates-hero.png: AI-generated illustrative young South Asian professional holding a folder while waiting for an interview, created with built-in image_gen. Not an actual Adhuni applicant or premises. Prompt: docs/candidates-hero-prompt.txt.

- public/images/pages-generated/approach-hero.png: AI-generated illustrative South Asian female consultant drawing a wordless process flow while two colleagues watch, created with built-in image_gen. Not actual Adhuni staff or premises. Prompt: docs/approach-hero-prompt.txt.

- public/images/pages-generated/services-hero.png: AI-generated illustrative open-plan office with South Asian men and women working and a small meeting behind glass, created with built-in image_gen. Not actual Adhuni staff or premises. Prompt: docs/services-hero-prompt.txt.

## Page image delivery paths - 3 October 2026

The seven generated page illustrations are also saved in public/pages/: about-hero.png (the revised South Asian team from about-hero-v2.png), about-story.png, contact-hero.png, employers-hero.png, candidates-hero.png, approach-hero.png and services-hero.png. These are unchanged copies of the generated assets documented above; their illustrative status and prompt records still apply.

- public/images/pages-generated/approach-hero.png: AI-generated illustrative South Asian female consultant drawing a process flow while two colleagues watch, created with built-in image_gen. Not actual Adhuni staff or premises. Prompt: docs/approach-hero-prompt.txt.

## Healthcare nursing hero - 7 October 2026
public/hero/healthcare-nursing-team.png: AI-generated illustrative nursing scene created with the built-in image_gen tool to match existing hero imagery. Does not depict actual Adhuni personnel or facilities. Prompt: docs/healthcare-nursing-image-prompt.txt. Additional asset; not yet wired into the website.

public/hero/healthcare-nursing-team-gcc.png: GCC-focused revision created with built-in image_gen, featuring Arab and South Asian nursing colleagues. AI-generated illustration, not actual Adhuni staff or facilities. Prompt: docs/healthcare-nursing-gcc-image-prompt.txt.

public/hero/healthcare-doctors-gcc.png: GCC healthcare recruitment hero created with built-in image_gen on 7 October 2026, featuring three doctors walking through a modern hospital corridor. AI-generated illustration, not actual Adhuni staff or facilities. Prompt: docs/healthcare-doctors-gcc-image-prompt.txt. Additional asset; not yet wired into the website.

public/hero/healthcare-doctors-arab.png: Built-in image_gen revision on 7 October 2026, requested to depict three Arab doctors. AI-generated illustrative scene, not actual Adhuni personnel or facilities. Prompt: docs/healthcare-doctors-arab-image-prompt.txt.

public/hero/healthcare-doctors-south-asian.png: Built-in image_gen revision on 7 October 2026 depicting South Asian doctors in a GCC hospital. AI-generated illustrative scene, not actual Adhuni personnel or facilities. Prompt: docs/healthcare-doctors-south-asian-image-prompt.txt.

## Hospital nurses documentary-style image
hospital-nurses-documentary.png: AI-generated with the built-in image-generation tool on October 7, 2026. Illustrative hospital scene; does not depict an actual hospital, staff, or Adhuni placement. Generation prompt: docs/hospital-image-prompt.txt.

public/hero/healthcare-nursing-team-gcc-v2.png: Photorealistic nursing hero revision generated with built-in image_gen using user-supplied composition and photographic references. AI-generated illustrative scene, not actual Adhuni personnel or facilities. Prompt: docs/healthcare-nursing-gcc-v2-prompt.txt.

public/hero/healthcare-doctors-gcc.png: GCC doctors corridor hero generated with built-in image_gen. AI-generated illustrative scene, not actual Adhuni personnel or facilities. Prompt: docs/healthcare-doctors-gcc-prompt.txt. Not yet wired into the website.

public/hero/healthcare-nursing-team-gcc-v3.png: Nursing team scene generated with built-in image_gen using the liked doctors hero as a photographic style reference. AI-generated illustration, not actual Adhuni staff or facilities. Prompt: docs/healthcare-nursing-gcc-v3-prompt.txt. Not yet wired into the website.

Requested hero filenames: public/hero/hero-0a-nurses.png is an unchanged copy of healthcare-nursing-team-gcc-v3.png; public/hero/hero-0b-doctors.png is an unchanged copy of healthcare-doctors-gcc.png. Both are AI-generated illustrative scenes; source prompts and attribution are recorded above.

public/images/employer-tab-healthcare.png: Portrait employer tab hospital handover scene, generated with built-in image_gen. AI-generated illustration, not actual Adhuni staff or facilities. Prompt: docs/employer-tab-healthcare-prompt.txt. Not yet wired into the website.

public/images/professional-tab-healthcare.png: Portrait professional tab nurse walking in a GCC hospital corridor, generated with built-in image_gen. AI-generated illustration, not actual Adhuni staff or facilities. Prompt: docs/professional-tab-healthcare-prompt.txt. Not yet wired into the website.

public/images/professional-tab-healthcare-v2.png: Professional tab portrait edited with built-in image_gen to remove the stethoscope. AI-generated illustration, not actual Adhuni staff or facilities. Original retained. Prompt: docs/professional-tab-healthcare-v2-prompt.txt.

Requested healthcare tab filenames: public/healthcare-employer.png is an unchanged copy of public/images/employer-tab-healthcare.png; public/healthcare-professional.png is an unchanged copy of public/images/professional-tab-healthcare-v2.png (without stethoscope). Both are AI-generated illustrative scenes; prompts and attribution are recorded above.
