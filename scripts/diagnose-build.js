#!/usr/bin/env node

/**
 * Script de diagnostic pour identifier les différences entre build local et production
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic des différences de build...\n');

// Vérifier les versions
console.log('📋 Vérification des versions:');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log(`- app.json version: ${appJson.expo.version}`);
console.log(`- package.json version: ${packageJson.version}`);
console.log(`- Android versionName: ${appJson.expo.android.versionName}`);
console.log(`- Android versionCode: ${appJson.expo.android.versionCode}`);
console.log(`- iOS buildNumber: ${appJson.expo.ios.buildNumber}`);

// Vérifier la cohérence
const versions = [
  appJson.expo.version,
  packageJson.version,
  appJson.expo.android.versionName,
  appJson.expo.ios.buildNumber
];

const uniqueVersions = [...new Set(versions)];
if (uniqueVersions.length > 1) {
  console.log('⚠️  ATTENTION: Versions incohérentes détectées!');
} else {
  console.log('✅ Versions cohérentes');
}

console.log('\n🎨 Vérification des assets:');

// Vérifier les polices
const fontDir = 'app/assets/fonts';
if (fs.existsSync(fontDir)) {
  const fonts = fs.readdirSync(fontDir);
  console.log(`- Polices trouvées: ${fonts.length}`);
  fonts.forEach(font => {
    const stats = fs.statSync(path.join(fontDir, font));
    console.log(`  - ${font}: ${(stats.size / 1024).toFixed(2)} KB`);
  });
} else {
  console.log('❌ Dossier des polices introuvable');
}

// Vérifier les images
const imageDir = 'app/assets/images';
if (fs.existsSync(imageDir)) {
  const images = fs.readdirSync(imageDir).filter(file => 
    file.match(/\.(png|jpg|jpeg|gif|svg)$/i)
  );
  console.log(`- Images trouvées: ${images.length}`);
} else {
  console.log('❌ Dossier des images introuvable');
}

console.log('\n⚙️  Configuration de build:');
console.log(`- userInterfaceStyle: ${appJson.expo.userInterfaceStyle}`);
console.log(`- orientation: ${appJson.expo.orientation}`);
console.log(`- compileSdkVersion: ${appJson.expo.android.compileSdkVersion}`);
console.log(`- targetSdkVersion: ${appJson.expo.android.targetSdkVersion}`);

console.log('\n🔧 Recommandations:');
console.log('1. Utilisez le même profil de build pour local et production');
console.log('2. Vérifiez que les polices sont correctement chargées');
console.log('3. Testez avec le profil "production-debug" pour comparer');
console.log('4. Vérifiez les logs de build pour les warnings');

console.log('\n✅ Diagnostic terminé!');
