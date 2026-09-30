// ── Betegnelse «prisoverslag»: konvertering av lagrede tekster ──
// Kjør: node testTerminology.js

var fs = require('fs');
var vm = require('vm');
global.window = global;
global.localStorage = { getItem: function() { return null; }, setItem: function() {} };
global.document = { getElementById: function() { return null; } };
vm.runInThisContext(fs.readFileSync('utils.js', 'utf8'));

var totalOk = 0;
var totalFail = 0;

function assertEqual(actual, expected, name) {
  if (actual === expected) {
    console.log('✓ ' + name);
    totalOk++;
  } else {
    console.log('✗ ' + name + ' — fikk «' + actual + '», forventet «' + expected + '»');
    totalFail++;
  }
}

var OLD_FORBEHOLD = 'Tilbudet er basert på dagens priser på materialer og lønn.\n\nTilbudet er gyldig i {{gyldighet}} dager fra tilbudsdato, dersom annet ikke er avtalt.';

function createOldProject() {
  return {
    id: 'p1',
    offerState: {
      sectionTitles: { grunnlag: 'Grunnlag for tilbudet', ikkemedregnet: 'Ikke medregnet i tilbudet' },
      texts: { innledning: 'tilbygg på 18 m²', forbehold: OLD_FORBEHOLD },
      innledningTemplate: 'Tilbudet gjelder tømrerarbeider i forbindelse med {{beskrivelse}}.',
      freeSections: [{ id: 'f1', title: 'Om tilbudet', text: 'Tilbudene våre er alltid uforpliktende.' }],
      arbeidsomfangExtra: [],
      customPosts: [{ id: 'c1', name: 'Tilbudssum', price: 100 }],
      ikkemedregnet: { custom: ['Ting som ikke er med i tilbudet'] }
    }
  };
}

// ── toPrisoverslagTerms ──
assertEqual(toPrisoverslagTerms('Tilbudet gjelder tømrerarbeider'), 'Prisoverslaget gjelder tømrerarbeider',
  'should convert definite form at start of sentence');
assertEqual(toPrisoverslagTerms('Ikke medregnet i tilbudet'), 'Ikke medregnet i prisoverslaget',
  'should convert definite form inside sentence');
assertEqual(toPrisoverslagTerms('TILBUD'), 'PRISOVERSLAG',
  'should keep upper case');
assertEqual(toPrisoverslagTerms('Tilbudene våre'), 'Prisoverslagene våre',
  'should keep plural ending');
assertEqual(toPrisoverslagTerms('tilbudets gyldighet'), 'prisoverslagets gyldighet',
  'should keep genitive ending');
assertEqual(toPrisoverslagTerms('dager fra tilbudsdato'), 'dager fra datoen det er gitt',
  'should replace known compound phrase');
assertEqual(toPrisoverslagTerms('Tilbudssum'), 'Totalsum',
  'should replace default merged post name');
assertEqual(toPrisoverslagTerms('Vår tilbudspris'), 'Vår tilbudspris',
  'should leave unknown compound words untouched');
assertEqual(toPrisoverslagTerms(undefined), undefined,
  'should pass through non-text values');

// ── Standardmal ──
assertEqual(JSON.stringify(defaultOfferTemplate()).toLowerCase().indexOf('tilbud'), -1,
  'should have no tilbud wording in the default template');
assertEqual(defaultOfferTemplate().terminology, OFFER_TERMINOLOGY,
  'should mark the default template as already converted');

// ── migrateOfferTerminology: mal ──
var oldTemplate = defaultOfferTemplate();
oldTemplate.terminology = undefined;
oldTemplate.sections.forbehold.text = OLD_FORBEHOLD;
oldTemplate.sections.grunnlag.title = 'Grunnlag for tilbudet';
oldTemplate.emailSubject = 'Tilbud - {{prosjekt}} - {{firma}}';
var migratedState = migrateOfferTerminology({ offerTemplate: oldTemplate, projects: [] });
assertEqual(migratedState.offerTemplate.sections.forbehold.text,
  'Prisoverslaget er basert på dagens priser på materialer og lønn.\n\nPrisoverslaget er gyldig i {{gyldighet}} dager fra datoen det er gitt, dersom annet ikke er avtalt.',
  'should convert stored template text including validity sentence');
assertEqual(migratedState.offerTemplate.sections.grunnlag.title, 'Grunnlag for prisoverslaget',
  'should convert stored template section title');
assertEqual(migratedState.offerTemplate.emailSubject, 'Prisoverslag - {{prosjekt}} - {{firma}}',
  'should convert stored email subject');

// ── migrateOfferTerminology: prosjekter ──
var projectState = migrateOfferTerminology({ offerTemplate: defaultOfferTemplate(), projects: [createOldProject()] });
var os = projectState.projects[0].offerState;
assertEqual(os.sectionTitles.ikkemedregnet, 'Ikke medregnet i prisoverslaget',
  'should convert stored project section title');
assertEqual(os.innledningTemplate, 'Prisoverslaget gjelder tømrerarbeider i forbindelse med {{beskrivelse}}.',
  'should convert stored introduction template');
assertEqual(os.freeSections[0].text, 'Prisoverslagene våre er alltid uforpliktende.',
  'should convert own sections');
assertEqual(os.customPosts[0].name, 'Totalsum',
  'should convert merged custom post name');
assertEqual(os.ikkemedregnet.custom[0], 'Ting som ikke er med i prisoverslaget',
  'should convert own not-included lines');
assertEqual(os.terminology, OFFER_TERMINOLOGY,
  'should mark project as converted');

os.freeSections[0].text = 'Jeg skrev tilbud med vilje';
migrateOfferTerminology(projectState);
assertEqual(os.freeSections[0].text, 'Jeg skrev tilbud med vilje',
  'should never change text written after conversion');

console.log('\n' + totalOk + ' OK, ' + totalFail + ' feil');
if (totalFail > 0) process.exit(1);
