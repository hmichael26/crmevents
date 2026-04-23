const fs = require('fs');
const path = require('path');

const langs = ['en', 'fr'];
const basePath = path.join(__dirname, 'app/constants/translations');

langs.forEach(lang => {
  const filePath = path.join(basePath, `${lang}.json`);
  if (!fs.existsSync(filePath)) return;
  
  const dict = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const targetDir = path.join(basePath, lang);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);
  
  // For top-level keys that are objects, create files.
  Object.keys(dict).forEach(key => {
    if (typeof dict[key] === 'object' && dict[key] !== null) {
      fs.writeFileSync(path.join(targetDir, `${key}.json`), JSON.stringify(dict[key], null, 2));
    } else {
      // For top level scalar strings? we could put them in common.json
      const commonPath = path.join(targetDir, 'common.json');
      let commonDict = {};
      if (fs.existsSync(commonPath)) {
        commonDict = JSON.parse(fs.readFileSync(commonPath, 'utf8'));
      }
      commonDict[key] = dict[key];
      fs.writeFileSync(commonPath, JSON.stringify(commonDict, null, 2));
    }
  });
  console.log(`Split ${lang}.json successfully.`);
});
