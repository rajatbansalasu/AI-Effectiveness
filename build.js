#!/usr/bin/env node

/**
 * Build script for AI Effectiveness Presentation Deck
 * Compiles template.html and slides/*.html into standalone index.html
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const TEMPLATE_PATH = path.join(ROOT_DIR, 'template.html');
const SLIDES_DIR = path.join(ROOT_DIR, 'slides');
const OUTPUT_PATH = path.join(ROOT_DIR, 'index.html');

function build() {
  const startTime = Date.now();

  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`❌ Error: Template file not found: ${TEMPLATE_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(SLIDES_DIR)) {
    console.error(`❌ Error: Slides directory not found: ${SLIDES_DIR}`);
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // Read and sort all HTML files in slides directory
  const slideFiles = fs.readdirSync(SLIDES_DIR)
    .filter(file => file.endsWith('.html'))
    .sort();

  if (slideFiles.length === 0) {
    console.warn('⚠️ Warning: No HTML slide files found in slides/ directory.');
  }

  const slidesContent = slideFiles.map((file, idx) => {
    const filePath = path.join(SLIDES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8').trim();
    return `    <!-- Slide ${idx + 1}: ${file} -->\n    ${content}`;
  }).join('\n\n');

  if (!template.includes('<!-- SLIDES_PLACEHOLDER -->')) {
    console.error('❌ Error: <!-- SLIDES_PLACEHOLDER --> tag missing in template.html');
    process.exit(1);
  }

  const outputHtml = template.replace('<!-- SLIDES_PLACEHOLDER -->', slidesContent);

  fs.writeFileSync(OUTPUT_PATH, outputHtml, 'utf8');
  const elapsed = Date.now() - startTime;
  console.log(`✅ [Build Success] Compiled ${slideFiles.length} slides into index.html (${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

// Check for --watch argument
const isWatchMode = process.argv.includes('--watch') || process.argv.includes('-w');

build();

if (isWatchMode) {
  console.log('👀 Watching for changes in template.html and slides/ ... (Press Ctrl+C to stop)');

  let debounceTimer = null;
  const triggerDebouncedBuild = (filename) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`\n🔄 File changed (${filename}), rebuilding...`);
      build();
    }, 100);
  };

  fs.watch(TEMPLATE_PATH, (eventType) => {
    triggerDebouncedBuild('template.html');
  });

  fs.watch(SLIDES_DIR, (eventType, filename) => {
    if (filename && filename.endsWith('.html')) {
      triggerDebouncedBuild(`slides/${filename}`);
    }
  });
}
