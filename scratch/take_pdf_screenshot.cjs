const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const pdfPath = path.resolve(__dirname, 'Orcamento_Mayclick_Teste_Mariana_Souza.pdf');
const outPath = 'C:\\Users\\niilp\\.gemini\\antigravity-ide\\brain\\5bb6fd39-44a2-4e33-8b82-9182a62dea84\\preview_orcamento.png';

const cmd = `"${edgePath}" --headless=new --screenshot="${outPath}" --window-size=1000,1400 "file:///${pdfPath.replace(/\\/g, '/')}"`;
console.log('Running:', cmd);

try {
  execSync(cmd);
  if (fs.existsSync(outPath)) {
    console.log('Successfully created PNG preview:', fs.statSync(outPath).size, 'bytes');
  } else {
    console.warn('PNG preview file was not created');
  }
} catch (err) {
  console.error('Error rendering screenshot:', err.message);
}
