const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'src', 'components', 'Home.jsx');
let content = fs.readFileSync(homePath, 'utf8');

// Find the return ( 
// and the ) right before <PublicFooter
const returnRegex = /return \(\s*<div className="home-page">([\s\S]*?)<PublicFooter \/>/m;
const match = content.match(returnRegex);

if (match) {
  const innerJSX = match[1];
  
  // We need to split innerJSX into the different sections.
  // We can look for comments like {/* Hero Section */} or just standard tags.
  // 1. Header (lines containing nav, logo)
  // 2. Hero (<main className="hero-section">)
  // 3. Portfolio (<section className="portfolio-mosaico">)
  // 4. Highlights (<section className="highlights-section">)
  // 5. About (<section className="sobre-parallax">)
  // 6. Testimonials (<section className="depoimentos-section">)
  // 7. Instagram (<section className="instagram-section">)
  // 8. CTA (<section className="cta-section">)
  
  console.log("Found return block, length: ", innerJSX.length);
} else {
  console.log("Could not find return block");
}
