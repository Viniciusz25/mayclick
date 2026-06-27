const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'src', 'components', 'Home.jsx');
let content = fs.readFileSync(homePath, 'utf8');

const sHero = "{s.hero_active !== false && (";
const eHero = "</main>\n      )}";

const sPort = "{/* Bloco Conheça Nosso Trabalho (Mosaico) */}";
const ePort = "</section>";

const sHigh = "{/* Destaques Dinâmicos */}";
const eHigh = "      })}"; // end of highlights map

const sAbout = "{/* Bloco Sobre a Mayclick (Parallax / Video) */}";
const eAbout = "</section>";

const sTesti = "{/* Bloco Depoimentos (Carrossel / Grid) */}";
const eTesti = "</section>";

const sInsta = "{/* Bloco Portfólio Instagram */}";
const eInsta = "</section>\n      )}";

const sCTA = "{/* Bloco Final CTA */}";
const eCTA = "</section>";

function extract(str, start, endStr) {
    const idxStart = str.indexOf(start);
    if(idxStart === -1) return null;
    let idxEnd = str.indexOf(endStr, idxStart);
    if(idxEnd === -1) return null;
    idxEnd += endStr.length;
    return str.substring(idxStart, idxEnd);
}

const hero = extract(content, sHero, eHero);
const port = extract(content, sPort, ePort);
const high = extract(content, sHigh, eHigh);
let remainingAfterHigh = content.substring(content.indexOf(eHigh, content.indexOf(sHigh)) + eHigh.length);
const about = extract(remainingAfterHigh, sAbout, eAbout);
remainingAfterHigh = remainingAfterHigh.substring(remainingAfterHigh.indexOf(eAbout, remainingAfterHigh.indexOf(sAbout)) + eAbout.length);
const testi = extract(remainingAfterHigh, sTesti, eTesti);
remainingAfterHigh = remainingAfterHigh.substring(remainingAfterHigh.indexOf(eTesti, remainingAfterHigh.indexOf(sTesti)) + eTesti.length);
const insta = extract(remainingAfterHigh, sInsta, eInsta);
remainingAfterHigh = remainingAfterHigh.substring(remainingAfterHigh.indexOf(eInsta, remainingAfterHigh.indexOf(sInsta)) + eInsta.length);
const cta = extract(remainingAfterHigh, sCTA, eCTA);

if(!hero || !port || !high || !about || !testi || !insta || !cta) {
    console.error("Failed to extract one of the sections");
    process.exit(1);
}

// Remove the extracted parts from the original content
// We need to keep everything before hero, and everything after cta (which is just PublicFooter and style)
const preHeroIdx = content.indexOf(sHero);
const postCtaIdx = content.indexOf("<PublicFooter />");

const preHero = content.substring(0, preHeroIdx);
const postCta = content.substring(postCtaIdx);

const renderFunctions = `
  const renderHero = () => (
    <React.Fragment key="hero">
      ${hero}
    </React.Fragment>
  );

  const renderPortfolio = () => (
    <React.Fragment key="portfolio">
      ${port}
    </React.Fragment>
  );

  const renderHighlights = () => (
    <React.Fragment key="highlights">
      ${high}
    </React.Fragment>
  );

  const renderAbout = () => (
    <React.Fragment key="about">
      ${about}
    </React.Fragment>
  );

  const renderTestimonials = () => (
    <React.Fragment key="testimonials">
      ${testi}
    </React.Fragment>
  );

  const renderInstagram = () => (
    <React.Fragment key="instagram">
      ${insta}
    </React.Fragment>
  );

  const renderCTA = () => (
    <React.Fragment key="cta">
      ${cta}
    </React.Fragment>
  );

  const layoutMap = {
    hero: renderHero,
    portfolio: renderPortfolio,
    highlights: renderHighlights,
    about: renderAbout,
    testimonials: renderTestimonials,
    instagram: renderInstagram,
    cta: renderCTA
  };

  const defaultLayout = ['hero', 'portfolio', 'highlights', 'about', 'testimonials', 'instagram', 'cta'];
  let currentLayout = defaultLayout;
  if (s.homepage_layout) {
      if (Array.isArray(s.homepage_layout)) {
          currentLayout = s.homepage_layout;
      } else if (typeof s.homepage_layout === 'string') {
          try {
              currentLayout = JSON.parse(s.homepage_layout);
          } catch(e) {}
      }
  }
  
  // Filter out any missing map entries
  currentLayout = currentLayout.filter(k => !!layoutMap[k]);

  return (
    <div className="home-page">
      <VisualBuilderHeader onSaveComplete={() => window.location.reload()} />
      <VisualBuilderSidebar />
      <CookieBanner />
      
      {/* Side Drawer Navigation Menu */}
      <div className={\`side-drawer \${isSidebarOpen ? 'open' : ''}\`}>
        <div className="drawer-header">
          <img src="/logo.png" alt="Mayclick" className="drawer-logo" />
          <button className="btn-icon" onClick={() => setIsSidebarOpen(false)} aria-label="Fechar menu">
            <X size={28} />
          </button>
        </div>
        <nav className="drawer-nav">
          <a onClick={() => handleNav('/')}>Início</a>
          <a onClick={() => handleNav('/portfolio')}>Portfólio</a>
          <a onClick={() => handleNav('/sobre')}>Sobre Nós</a>
          <a onClick={() => handleNav('/formulario')} className="drawer-cta">Solicitar Orçamento</a>
        </nav>
      </div>
      {isSidebarOpen && <div className="drawer-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <header className="home-header fade-in">
        <div className="container header-inner">
          <div className="logo-area" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="Mayclick" className="header-logo" />
          </div>
          <nav className="main-nav desktop-only">
            <a onClick={() => navigate('/portfolio')}>Portfólio</a>
            <a onClick={() => navigate('/sobre')}>Sobre Nós</a>
            <a onClick={() => navigate('/formulario')} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={16} /> Orçamento
            </a>
          </nav>
          <button className="mobile-menu-btn mobile-only btn-icon" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menu">
            <Menu size={28} />
          </button>
        </div>
      </header>

      {currentLayout.map(sectionId => layoutMap[sectionId]())}

      `;

// In preHero, we must remove the parts that are inside the return (div className="home-page"... Side Drawer, header)
// Because we just manually recreated them above.
const returnStmtIdx = preHero.indexOf('return (\n    <div className="home-page">');
const cleanPreHero = preHero.substring(0, returnStmtIdx);

const finalContent = cleanPreHero + renderFunctions + postCta;

fs.writeFileSync(homePath, finalContent, 'utf8');
console.log("Successfully refactored Home.jsx!");
