const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'src', 'components', 'Home.jsx');
let content = fs.readFileSync(homePath, 'utf8');

const regexHero = /({\/\* Hero Section \*\/}[\s\S]*?)(?=<\!--|\{\/\* Bloco Conheça)/;
const regexPortfolio = /({\/\* Bloco Conheça Nosso Trabalho \(Mosaico\) \*\/}[\s\S]*?)(?=<\!--|\{\/\* Destaques)/;
const regexHighlights = /({\/\* Destaques Adicionais \*\/}[\s\S]*?)(?=<\!--|\{\/\* Sobre a Mayclick)/;
const regexAbout = /({\/\* Sobre a Mayclick \(Parallax\) \*\/}[\s\S]*?)(?=<\!--|\{\/\* Depoimentos)/;
const regexTestimonials = /({\/\* Depoimentos \*\/}[\s\S]*?)(?=<\!--|\{\/\* Instagram)/;
const regexInstagram = /({\/\* Instagram Widget \*\/}[\s\S]*?)(?=<\!--|\{\/\* Call to Action Final)/;
const regexCTA = /({\/\* Call to Action Final \*\/}[\s\S]*?)(?=<\!--|<PublicFooter)/;

const rHero = content.match(regexHero);
const rPortfolio = content.match(regexPortfolio);
const rHighlights = content.match(regexHighlights);
const rAbout = content.match(regexAbout);
const rTestimonials = content.match(regexTestimonials);
const rInstagram = content.match(regexInstagram);
const rCTA = content.match(regexCTA);

if (rHero && rPortfolio && rHighlights && rAbout && rTestimonials && rInstagram && rCTA) {
    const layoutMapStr = `
  const renderHero = () => (
    <React.Fragment key="hero">
      ${rHero[1].trim()}
    </React.Fragment>
  );

  const renderPortfolio = () => (
    <React.Fragment key="portfolio">
      ${rPortfolio[1].trim()}
    </React.Fragment>
  );

  const renderHighlights = () => (
    <React.Fragment key="highlights">
      ${rHighlights[1].trim()}
    </React.Fragment>
  );

  const renderAbout = () => (
    <React.Fragment key="about">
      ${rAbout[1].trim()}
    </React.Fragment>
  );

  const renderTestimonials = () => (
    <React.Fragment key="testimonials">
      ${rTestimonials[1].trim()}
    </React.Fragment>
  );

  const renderInstagram = () => (
    <React.Fragment key="instagram">
      ${rInstagram[1].trim()}
    </React.Fragment>
  );

  const renderCTA = () => (
    <React.Fragment key="cta">
      ${rCTA[1].trim()}
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
  if (s.homepage_layout && Array.isArray(s.homepage_layout)) {
      currentLayout = s.homepage_layout;
  } else if (typeof s.homepage_layout === 'string') {
      try {
          currentLayout = JSON.parse(s.homepage_layout);
      } catch (e) {
          console.error('Failed to parse layout', e);
      }
  }

  // Filter out any invalid sections
  currentLayout = currentLayout.filter(key => layoutMap[key]);
`;

    // Now replace everything between Header and PublicFooter
    const returnRegex = /(<Header \/>)([\s\S]*?)(<PublicFooter \/>)/;
    const newContent = content.replace(returnRegex, `$1\n      {currentLayout.map(section => layoutMap[section]())}\n      $3`);
    
    // Insert the render functions before return
    const beforeReturnRegex = /(return \(\s*<div className="home-page">)/;
    const finalContent = newContent.replace(beforeReturnRegex, layoutMapStr + '\n  $1');

    fs.writeFileSync(homePath, finalContent, 'utf8');
    console.log('Successfully refactored Home.jsx!');
} else {
    console.log('Failed to match one of the sections.');
    console.log('Hero:', !!rHero);
    console.log('Portfolio:', !!rPortfolio);
    console.log('Highlights:', !!rHighlights);
    console.log('About:', !!rAbout);
    console.log('Testimonials:', !!rTestimonials);
    console.log('Instagram:', !!rInstagram);
    console.log('CTA:', !!rCTA);
}
