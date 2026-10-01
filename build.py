"""Builds the FHA site: wraps each page in src/pages with the shared head, header and footer."""
import os, re
SITE = "https://www.franschhoekhospitalityacademy.co.za/"
OG = "https://static.wixstatic.com/media/feb0d8_d01647c1d4964f90a66865bf96583566f002.jpg"
NAV = [("our-impact.html","Our Impact"),("study.html","Study With Us"),("support-us.html","Support Us"),("about.html","About"),("academy-diary.html","Academy Diary")]

def head(title, desc, fname):
    url = SITE + ("" if fname == "index.html" else fname.replace(".html",""))
    return f"""<!doctype html>
<html lang="en-ZA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{OG}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Figtree:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="css/site.css">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"NGO","name":"Franschhoek Hospitality Academy & Learning Centre","url":"{SITE}","telephone":"+27 60 381 0083","address":{{"@type":"PostalAddress","streetAddress":"Farm Cabrière, Daniel Hugo Street","addressLocality":"Franschhoek","postalCode":"7690","addressCountry":"ZA"}},"sameAs":["https://www.instagram.com/franschhoekhospitality/","https://www.facebook.com/FranschhoekHospitality/"]}}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
"""

def header(active, donate_href):
    cur = ' aria-current="page"'
    links = "\n      ".join('<a href="%s"%s>%s</a>' % (h, cur if h == active else "", t) for h, t in NAV)
    mlinks = "\n    ".join(f'<a href="{h}">{t}</a>' for h,t in NAV + [("partners-contact.html","Partners &amp; Contact")])
    return f"""<header class="site-header">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="Franschhoek Hospitality Academy home">
      <span class="brand-mark">FHA</span>
      <span class="brand-name"><b>Franschhoek</b><span>Hospitality Academy</span></span>
    </a>
    <nav class="main-nav" aria-label="Main">
      {links}
    </nav>
    <div class="header-ctas">
      <a class="btn btn-green" href="study.html#apply-form">Apply to study</a>
      <a class="btn btn-gold" href="{donate_href}">Donate</a>
      <button class="menu-toggle" aria-label="Open menu" aria-expanded="false"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
  <nav class="mobile-nav" data-open="false" aria-label="Mobile">
    {mlinks}
    <a class="btn btn-green" href="study.html#apply-form">Apply to study</a>
  </nav>
</header>
"""

FOOTER = open("src/footer.html").read()

for fname in sorted(os.listdir("src/pages")):
    raw = open(os.path.join("src/pages", fname)).read()
    m = re.match(r"<!--(.*?)-->\n", raw, re.S)
    meta = dict(line.split(": ",1) for line in m.group(1).strip().splitlines() if ": " in line)
    body = raw[m.end():]
    donate = "#give" if 'data-donate' in body else "support-us.html#give"
    html = head(meta["title"], meta["description"], fname) + header(fname, donate) + '\n<main id="main">\n' + body + '</main>\n\n' + FOOTER + '<script src="js/site.js"></script>\n</body>\n</html>\n'
    open(fname, "w").write(html)
    print("built", fname)
