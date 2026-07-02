import React from 'react';

const getFontImport = (fontName) => {
  if (!fontName) return null;
  // Replace spaces with + for Google Fonts URL
  const formattedName = fontName.replace(/ /g, '+');
  return `https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;600;700;800&display=swap`;
};

const DynamicStyles = ({ settings }) => {
  if (!settings) return null;

  const { color_primary, color_accent, font_heading, font_body } = settings;

  const headingFontImport = getFontImport(font_heading);
  const bodyFontImport = getFontImport(font_body);

  return (
    <>
      {/* Import dynamic fonts if specified */}
      {headingFontImport && <link href={headingFontImport} rel="stylesheet" />}
      {bodyFontImport && bodyFontImport !== headingFontImport && (
        <link href={bodyFontImport} rel="stylesheet" />
      )}

      {/* Inject custom CSS variables */}
      <style>{`
        :root, html[data-theme='dark'] {
          ${color_accent ? `--accent: ${color_accent};` : ''}
          ${font_heading ? `--font-heading: '${font_heading}', sans-serif;` : ''}
          ${font_body ? `--font-body: '${font_body}', sans-serif;` : ''}
        }
        
        :root:not([data-theme='dark']) {
          ${color_primary ? `--primary: ${color_primary};` : ''}
        }
        
        body {
          ${font_body ? `font-family: var(--font-body);` : ''}
        }
        
        h1, h2, h3, h4, h5, h6, .font-heading {
          ${font_heading ? `font-family: var(--font-heading);` : ''}
        }
      `}</style>
    </>
  );
};

export default DynamicStyles;
