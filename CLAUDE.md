# FHA website: brief for Claude Code

This repository is the new website for **Franschhoek Hospitality Academy & Learning Centre (FHA)**, a registered South African charity. It replaces the current Wix site at **franschhoekhospitalityacademy.co.za**. Kayla (the site manager, not a developer) works with Claude to build and update it. Keep explanations to her plain and non-technical.

## Goal and audiences

- **Donors come first:** show impact and let people give within three clicks.
- **Prospective students come second:** an obvious "Apply" path on every page.
- **Partners and employers:** sponsor, host placements, collaborate.
- Style reference: charity: water (charitywater.org). Big people-first photos, bold impact numbers, a donation box on the home page, short confident copy.

## Decisions already made (don't reopen these)

1. Wix was rejected. Its AI builder looked bad, and imported designs can't be edited. The site is plain static HTML/CSS/JS, hosted on **GitHub Pages** from this repo (`main` branch, root folder).
2. **Keep it simple and hand-over friendly:** no frameworks and no build tools beyond `build.py`. A future handover may move the site to Webflow or similar.
3. Kayla wants to send a screenshot or note and have Claude make the change and publish it.
4. Kayla is paid monthly to update the site. The monthly update is one **Academy Diary** post ("what happened this month"), one "Where are they now?" graduate spotlight, a home page story refresh, and date or sponsor housekeeping.
5. All emails use the **@franschhoekhospitalityacademy.co.za** domain.
6. Kayla confirmed the facts below are correct. She'll edit wording later if needed.
7. The original approved wireframes are a Claude Design canvas, "FHA Website Redesign" (https://claude.ai/artifact/JZ4NiozBRNdKnH9jDW7a5P), with desktop and mobile artboards for all 7 pages. The code in this repo already implements them, so treat the code as the source of truth.

## How the code is organised

- `src/pages/*.html`: the content of each page, with a title and description comment at the top. **Edit these.**
- `src/footer.html`: the shared footer.
- `build.py`: wraps each page with the shared `<head>` (SEO, Open Graph, NGO schema), header/nav and footer, and writes the root `*.html` files. **Run `python3 build.py` after any edit in `src/`, and commit both `src/` and the built files.**
- `css/site.css`: every style. Design tokens are at the top. Responsive breakpoints are 1100, 900 and 600px.
- `js/site.js`: mobile menu, donation box (monthly/once, amounts, impact text, links to SnapScan) and click-to-play videos.
- `.nojekyll`: stops GitHub Pages from processing the files.
- `src/diary/YYYY-MM-slug.html`: Academy Diary posts, built to `diary/`. Copy `src/diary/_TEMPLATE.html` (files starting with `_` are not built). Write links as if the post sat at the root (`study.html`); `build.py` adds the `../`.
- `build.py` also writes the redirect pages for old Wix addresses (`REDIRECTS`, e.g. `apply-now.html`) and `sitemap.xml`. Don't edit those by hand.
- Top menu: `NAV` in `build.py`; `SUBNAV` adds dropdowns (About → About us, Partners & sponsors). Links to other websites get `target="_blank"` automatically at build time.
- `MONTHLY-CHECKLIST.md`: what Kayla sends each month and what Claude does with it.

### Pages (8)

| File | Page | Notes |
| --- | --- | --- |
| index.html | Home | Hero with donation box, student strip, impact numbers, Learn/Work/Lead, student story, vision + giving cards, graduation film, latest Diary posts, three doors, sponsor logos |
| study.html | Study With Us | Key facts, subjects, how to apply, fees, ITM scholarships, FAQ, application form |
| support-us.html | Support Us | Donation box, SnapScan/PayPal/EFT, corporate sponsors, other ways to help |
| about.html | About | Story, milestones, vision, values, objectives, team (swipe carousel on phones), ambassadors (Reuben video + click-to-open bios), governance |
| our-impact.html | Our Impact | Numbers, employer logos, graduate stories, film, donate band |
| academy-diary.html | Academy Diary | Featured post, filters, post grid, newsletter (blog listing, built by hand) |
| partners.html | Partners & Sponsors | Sponsor logo grid, Collaborations (FRANCO, Hospice Franschhoek), partner call to action. In the menu under About |
| contact.html | Contact Us | Contact details, map, contact form (`?topic=volunteer|supplies|stationery|sponsor` pre-chooses the topic). Linked from the footer button and phone menu |

## Design system

- Colours: cream `#F6F1E7`, sand `#EFE8DA`, deep green `#22352B`, ink `#17211B`, gold `#F2B632` (Donate buttons), gold-ink `#8A5A00` (labels), muted `#4A5650`.
- Fonts: Fraunces (headings), Figtree (body), from Google Fonts.
- Pill buttons. Gold = Donate, green = Apply. 16px radius on cards and photos.
- Text must always contrast with its background. The old Wix site had white-on-white text, so never repeat that.

## Key facts and links (confirmed)

- 587 graduates since 2018 · 96% in work · 3,500+ community members reached · 2 full ITM College Austria scholarships a year · 1 campus (Franschhoek). Sources: IOL, 16 Dec 2025; FHA ITM page.
- Founded 2018 by Michaela Julian, Tarryn Corlett and Brian Moor. Jeremy Davids is Academy Head. Moved into the former Haute Cabrière Education Centre in May 2023. Partnership with Prince Albert Community Trust (PACT) from Feb 2026.
- Charitable Trust IT000107/2017(C) · registered PBO · Section 18A certificates.
- Address: Farm Cabrière, Daniel Hugo Street, Franschhoek 7690 · +27 60 381 0083 · Admissions: Shaneill Jefthas, 081 009 5157, shaneill@franschhoekhospitalityacademy.co.za · Donations: michaela@franschhoekhospitalityacademy.co.za (Kayla to confirm this mailbox exists).
- SnapScan: https://pos.snapscan.io/qr/XSVFnKWE · PayPal: https://www.paypal.com/donate/?hosted_button_id=X4SWXWH5K4P5E · EFT: ABSA, account 4091772620, branch 632005, Swift ABSAZAJJ, reference name + surname.
- Programme: 9 months full-time (11 Jan – 30 Sep 2027), Mon–Fri 8am–5pm, then a 4-month work placement. 2027 applications close 30 October 2026. 2027 fees (from the official application form): registration R2,800 once-off if selected, paid as a R1,400 deposit by 31 Dec 2026 plus R1,400 on 11 Jan 2027; monthly fees R1,400 due on the 7th.
- Home page student story: Shaandre, Class of 2018, hospitality supervisor at Plaisir (interview: https://youtu.be/7DpkWPbGEUw). Graduation film is the 2024 graduation.
- Donations: SnapScan is once-off; the donate boxes open SnapScan in a new tab with the amount pre-filled (`?amount=` in cents). Monthly giving goes to the stop-order steps at `support-us.html#monthly`.
- Forms: the newsletter boxes post to MailerLite (Academy Diary group, double opt-in). The Contact page form posts to FormSubmit (`formsubmit.co/ajax/<email>`). **Temporarily set to Kayla's test address (kelz.blewett@gmail.com); switch it to shaneill@franschhoekhospitalityacademy.co.za when Kayla says testing is done.** Each new address needs a one-time FormSubmit activation click. The application form is still a placeholder.
- Social: instagram.com/franschhoekhospitality · facebook.com/FranschhoekHospitality

## To-do list (in order)

1. **Get the site live on GitHub Pages.** Kayla uploaded files manually and Pages showed a green tick but returned 404, probably because the files were in a subfolder. Check the repo layout, make sure `index.html` is at the root of `main`, clean up any duplicate or nested copies, and confirm https://kaylag98.github.io/fha-website/ loads.
2. **Images and videos:** photos, logos and videos currently load from the old Wix media library (`static.wixstatic.com`, `video.wixstatic.com`). Download them into `/images` and `/video` (or move the videos to YouTube) so the site doesn't depend on Wix. Check that each photo suits its spot, because they were chosen by file name only.
3. **Forms:** the application, contact and newsletter forms have placeholder `action` URLs (`[APPLICATION-FORM-URL]` etc.). Set up a free form service such as Formspree, sending submissions to Shaneill (applications) and Michaela (contact). Guide Kayla through any sign-up step by step.
4. **Custom domain:** the domain franschhoekhospitalityacademy.co.za is managed in Wix. Add a `CNAME` file, then guide Kayla through the Wix DNS changes (GitHub Pages A records and a `www` CNAME). Enable HTTPS.
5. **Redirects from old Wix URLs** so Google links don't break: /apply-now → study.html, /get-involved → support-us.html, /meet-the-team → about.html, /news → academy-diary.html, /collaboration, /sponsors and /contact → partners-contact.html, /itm-college-austria → study.html. Use small redirect pages (meta refresh + canonical).
6. **SEO:** add `sitemap.xml` and `robots.txt`, then set up Google Search Console once the domain is live. (The old Wix site had a noindex problem that is now fixed. Google Search Console was never connected.)
7. **Placeholders** in [square brackets]: 2027 dates, FAQ answers, graduate stories, ambassador bios (Margot Janse, Matthew Gordon, Chris Erasmus, Linda Coltart), Tarryn Corlett's role, employer logos, the Reuben Riffel video, the Hospice Franschhoek logo, an unidentified ninth sponsor, the impact report PDF. Ask Kayla for these. Don't invent content.
8. **Academy Diary:** create a simple post template (`diary/YYYY-MM-slug.html`) and a monthly checklist, so each monthly update is quick.
9. **Monthly donations:** SnapScan is once-off only. Real monthly debit orders need a provider such as PayFast. Raise this with Kayla later; it's not urgent.

## Working with Kayla

- She'll send screenshots and notes. Make the change, run `build.py`, commit, push, and tell her in one or two plain sentences what changed.
- Don't use jargon. Give step-by-step instructions whenever she needs to click something in GitHub, Wix or elsewhere.
- Ask before anything costly or hard to undo: DNS changes, deleting files, paid services.
