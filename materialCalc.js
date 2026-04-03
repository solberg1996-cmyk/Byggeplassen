// ── Materialkalkulator ─────────────────────────────────
// Frittstående hjelpeverktøy for raske materialberegninger.
// Ikke koblet til hovedkalkylen.

var matCalcDefs = {
  stender: {
    label: 'Stender',
    icon: '',
    desc: 'Beregn total løpemeter virke (stender+svill/rem) for en veggstrekning.',
    fields: [
      { id: 'veggLengde', label: 'Vegglengde (m)', type: 'number', placeholder: '6' },
      { id: 'veggHoyde', label: 'Vegghøyde (m)', type: 'number', placeholder: '2.4', default: 2.4 },
      { id: 'dim', label: 'Dimensjon', type: 'select', options: [
        { value: '36x98', label: '36 × 98 mm' },
        { value: '48x98', label: '48 × 98 mm' },
        { value: '36x148', label: '36 × 148 mm' },
        { value: '48x148', label: '48 × 148 mm (standard)' },
        { value: '48x198', label: '48 × 198 mm' }
      ], default: '48x148' },
      { id: 'cc', label: 'Senteravstand c/c', type: 'select', options: [
        { value: '300', label: '300 mm' },
        { value: '400', label: '400 mm' },
        { value: '600', label: '600 mm (standard)' }
      ], default: '600' },
      { id: 'svill', label: 'Inkl. svill og rem', type: 'checkbox', default: true },
      { id: 'ekstra', label: 'Ekstra stendere (hjørner, åpninger)', type: 'number', placeholder: '0', default: 0 }
    ],
    calc: function(v) {
      var lengde = Number(v.veggLengde) || 0;
      var hoyde = Number(v.veggHoyde) || 2.4;
      var cc = Number(v.cc) || 600;
      var ekstra = Number(v.ekstra) || 0;
      if (lengde <= 0) return null;
      var antStender = Math.ceil((lengde * 1000) / cc) + 1 + ekstra;
      var stenderLm = Math.ceil(antStender * hoyde * 1.05 * 10) / 10;
      var svilLm = v.svill ? Math.ceil(lengde * 2 * 1.1 * 10) / 10 : 0;
      var totalVirke = Math.ceil((stenderLm + svilLm) * 10) / 10;
      var dim = v.dim || '48x148';
      var results = [
        { label: 'Virke ' + dim + ' C24 (stender+svill/rem)', value: totalVirke, unit: 'lm' },
        { label: 'Dimensjon', value: dim, unit: 'mm' },
        { label: 'Antall stendere', value: antStender, unit: 'stk' },
        { label: 'Stendere løpemeter', value: stenderLm, unit: 'lm' }
      ];
      if (v.svill) {
        results.push({ label: 'Svill + rem', value: svilLm, unit: 'lm' });
      }
      var skruer = antStender * 4;
      results.push({ label: 'Vinkler / festemidler', value: skruer, unit: 'stk' });
      return results;
    }
  },

  kledning: {
    label: 'Kledning',
    icon: '',
    desc: 'Beregn materialbehov for utvendig eller innvendig kledning.',
    fields: [
      { id: 'areal', label: 'Areal å kle (m²)', type: 'number', placeholder: '40' },
      { id: 'bordBredde', label: 'Bordbrede (mm)', type: 'select', options: [
        { value: '98', label: '98 mm (4")' },
        { value: '123', label: '123 mm (5")' },
        { value: '148', label: '148 mm (6")' }
      ], default: '148' },
      { id: 'type', label: 'Kledningstype', type: 'select', options: [
        { value: 'enkelfalset', label: 'Enkelfalset (not/fjær)' },
        { value: 'staaende', label: 'Stående med overlegg' },
        { value: 'liggende', label: 'Liggende med overlegg' },
        { value: 'panel', label: 'Panel (innvendig)' }
      ], default: 'enkelfalset' },
      { id: 'bordLengde', label: 'Bordlengde (m)', type: 'select', options: [
        { value: '3', label: '3,0 m' },
        { value: '3.6', label: '3,6 m' },
        { value: '4', label: '4,0 m' },
        { value: '4.8', label: '4,8 m' },
        { value: '5.4', label: '5,4 m' }
      ], default: '4' },
      { id: 'svinn', label: 'Svinn / kapp (%)', type: 'number', placeholder: '10', default: 10 }
    ],
    calc: function(v) {
      var areal = Number(v.areal) || 0;
      var bredde = Number(v.bordBredde) || 148;
      var svinn = Number(v.svinn) || 10;
      var bordLengde = Number(v.bordLengde) || 4;
      if (areal <= 0) return null;
      // Dekkbredde avhenger av type
      var dekkbredde = bredde;
      if (v.type === 'enkelfalset' || v.type === 'panel') {
        dekkbredde = bredde - 12;
      } else if (v.type === 'staaende' || v.type === 'liggende') {
        dekkbredde = bredde - 25;
      }
      var lmPerM2 = 1000 / dekkbredde;
      var lmNetto = areal * lmPerM2;
      var lmBrutto = lmNetto * (1 + svinn / 100);
      var antBord = Math.ceil(lmBrutto / bordLengde);
      var spiker = Math.ceil(areal * 25);
      return [
        { label: 'Dekkbredde per bord', value: dekkbredde, unit: 'mm' },
        { label: 'Kledning netto', value: Math.ceil(lmNetto), unit: 'lm' },
        { label: 'Kledning inkl. svinn', value: Math.ceil(lmBrutto), unit: 'lm' },
        { label: 'Antall bord (' + bordLengde + 'm)', value: antBord, unit: 'stk' },
        { label: 'Spiker / skrue', value: spiker, unit: 'stk' }
      ];
    }
  },

  gips: {
    label: 'Gips',
    icon: '',
    desc: 'Beregn antall gipsplater, skruer, sparkel og tape.',
    fields: [
      { id: 'areal', label: 'Areal (m²)', type: 'number', placeholder: '25' },
      { id: 'plateStr', label: 'Platestørrelse', type: 'select', options: [
        { value: '1.2x2.4', label: '1200 × 2400 mm (standard)' },
        { value: '1.2x2.7', label: '1200 × 2700 mm' },
        { value: '0.9x2.4', label: '900 × 2400 mm' }
      ], default: '1.2x2.4' },
      { id: 'lag', label: 'Antall lag', type: 'select', options: [
        { value: '1', label: '1 lag' },
        { value: '2', label: '2 lag' }
      ], default: '1' },
      { id: 'svinn', label: 'Svinn / kapp (%)', type: 'number', placeholder: '10', default: 10 }
    ],
    calc: function(v) {
      var areal = Number(v.areal) || 0;
      var lag = Number(v.lag) || 1;
      var svinn = Number(v.svinn) || 10;
      if (areal <= 0) return null;
      var dims = (v.plateStr || '1.2x2.4').split('x');
      var plateAreal = Number(dims[0]) * Number(dims[1]);
      var totalAreal = areal * lag;
      var antPlater = Math.ceil((totalAreal * (1 + svinn / 100)) / plateAreal);
      var skruer = Math.ceil(totalAreal * 28);
      var sparkel = Math.ceil(totalAreal * 0.5 * 10) / 10;
      // Ca. 2.5 lm fugletape per m² (alle skjøter + kant)
      var tape = Math.ceil(totalAreal * 2.5);
      return [
        { label: 'Totalt areal (' + lag + ' lag)', value: Math.ceil(totalAreal * 10) / 10, unit: 'm²' },
        { label: 'Antall plater', value: antPlater, unit: 'stk' },
        { label: 'Gipsskruer', value: skruer, unit: 'stk' },
        { label: 'Sparkel', value: sparkel, unit: 'kg' },
        { label: 'Fugletape', value: tape, unit: 'lm' }
      ];
    }
  },

  isolasjon: {
    label: 'Isolasjon',
    icon: '',
    desc: 'Beregn isolasjonsbehov for vegg, tak eller gulv.',
    fields: [
      { id: 'areal', label: 'Areal (m²)', type: 'number', placeholder: '30' },
      { id: 'tykkelse', label: 'Tykkelse (mm)', type: 'select', options: [
        { value: '50', label: '50 mm' },
        { value: '70', label: '70 mm' },
        { value: '100', label: '100 mm' },
        { value: '148', label: '148 mm' },
        { value: '198', label: '198 mm' },
        { value: '250', label: '250 mm' },
        { value: '300', label: '300 mm' }
      ], default: '148' },
      { id: 'bruk', label: 'Bruksområde', type: 'select', options: [
        { value: 'vegg', label: 'Vegg (inkl. vindsperre)' },
        { value: 'tak', label: 'Tak / himling' },
        { value: 'gulv', label: 'Gulv / bjelkelag' }
      ], default: 'vegg' },
      { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '5', default: 5 }
    ],
    calc: function(v) {
      var areal = Number(v.areal) || 0;
      var svinn = Number(v.svinn) || 5;
      var tykkelse = Number(v.tykkelse) || 148;
      if (areal <= 0) return null;
      var arealBrutto = areal * (1 + svinn / 100);
      // Pakkestørrelser (m²) basert på tykkelse (typisk Glava/Rockwool)
      var pakkStr = 0;
      if (tykkelse <= 50) pakkStr = 10.8;
      else if (tykkelse <= 70) pakkStr = 8.17;
      else if (tykkelse <= 100) pakkStr = 5.47;
      else if (tykkelse <= 148) pakkStr = 3.6;
      else if (tykkelse <= 198) pakkStr = 2.7;
      else if (tykkelse <= 250) pakkStr = 2.16;
      else pakkStr = 1.8;
      var antPakker = Math.ceil(arealBrutto / pakkStr);
      var results = [
        { label: 'Isolasjon netto', value: Math.ceil(areal * 10) / 10, unit: 'm²' },
        { label: 'Isolasjon inkl. svinn', value: Math.ceil(arealBrutto * 10) / 10, unit: 'm²' },
        { label: 'Antall pakker', value: antPakker, unit: 'pk (' + pakkStr + ' m²)' }
      ];
      if (v.bruk === 'vegg') {
        // Vindsperre: ruller à 37.5 m² (1.5m × 25m)
        var vindsperreM2 = Math.ceil(areal * 1.1);
        var vindsperreRuller = Math.ceil(vindsperreM2 / 37.5);
        results.push({ label: 'Vindsperre', value: vindsperreM2, unit: 'm²' });
        results.push({ label: 'Vindsperreruller', value: vindsperreRuller, unit: 'rull (37,5 m²)' });
        results.push({ label: 'Stifter / tape', value: Math.ceil(areal * 8), unit: 'stk' });
      }
      if (v.bruk === 'tak') {
        // Dampsperre for tak
        var dampsperreM2 = Math.ceil(areal * 1.15);
        results.push({ label: 'Dampsperre', value: dampsperreM2, unit: 'm²' });
        results.push({ label: 'Dampsperretape', value: Math.ceil(areal * 0.8), unit: 'lm' });
      }
      return results;
    }
  },

  gulv: {
    label: 'Gulv',
    icon: '',
    desc: 'Beregn materialbehov for gulvlegging.',
    fields: [
      { id: 'lengde', label: 'Romlengde (m)', type: 'number', placeholder: '5' },
      { id: 'bredde', label: 'Rombredde (m)', type: 'number', placeholder: '4' },
      { id: 'type', label: 'Gulvtype', type: 'select', options: [
        { value: 'parkett', label: 'Parkett / laminat' },
        { value: 'heltre', label: 'Heltregulv (bord)' },
        { value: 'vinyl', label: 'Vinylplanker' }
      ], default: 'parkett' },
      { id: 'bordBredde', label: 'Bordbredde heltre (mm)', type: 'select', options: [
        { value: '98', label: '98 mm' },
        { value: '120', label: '120 mm' },
        { value: '148', label: '148 mm' }
      ], default: '120' },
      { id: 'svinn', label: 'Svinn / kapp (%)', type: 'number', placeholder: '10', default: 10 }
    ],
    calc: function(v) {
      var lengde = Number(v.lengde) || 0;
      var bredde = Number(v.bredde) || 0;
      if (lengde <= 0 || bredde <= 0) return null;
      var areal = lengde * bredde;
      var svinn = Number(v.svinn) || 10;
      var brutto = areal * (1 + svinn / 100);
      var results = [
        { label: 'Romareal', value: Math.round(areal * 100) / 100, unit: 'm²' },
        { label: 'Inkl. svinn', value: Math.ceil(brutto * 10) / 10, unit: 'm²' }
      ];
      if (v.type === 'parkett' || v.type === 'vinyl') {
        var pakkStr = v.type === 'vinyl' ? 2.2 : 2.4;
        results.push({ label: 'Antall pakker', value: Math.ceil(brutto / pakkStr), unit: 'pk (' + pakkStr + ' m²)' });
      } else {
        var bordBr = Number(v.bordBredde) || 120;
        var lmPerM2 = 1000 / bordBr;
        var lmBrutto = brutto * lmPerM2;
        results.push({ label: 'Gulvbord løpemeter', value: Math.ceil(lmBrutto), unit: 'lm' });
        results.push({ label: 'Antall bord (4m)', value: Math.ceil(lmBrutto / 4), unit: 'stk' });
      }
      results.push({ label: 'Underlagsmatte', value: Math.ceil(brutto), unit: 'm²' });
      var fotlist = Math.ceil((lengde + bredde) * 2 * 1.1);
      results.push({ label: 'Fotlister', value: fotlist, unit: 'lm' });
      return results;
    }
  },

  tak: {
    label: 'Tak',
    icon: '',
    desc: 'Beregn materialbehov for taktekking (shingel, stål eller takstein).',
    fields: [
      { id: 'lengde', label: 'Taklengde (m)', type: 'number', placeholder: '12' },
      { id: 'bredde', label: 'Takbredde / rafthøyde (m)', type: 'number', placeholder: '6' },
      { id: 'tekking', label: 'Tekkingstype', type: 'select', options: [
        { value: 'shingel', label: 'Shingel' },
        { value: 'staaltak', label: 'Stålplater / trapesplater' },
        { value: 'takstein', label: 'Takstein (betong)' },
        { value: 'takpapp', label: 'Takpapp / underlagspapp' }
      ], default: 'shingel' },
      { id: 'svinn', label: 'Svinn / kapp (%)', type: 'number', placeholder: '10', default: 10 }
    ],
    calc: function(v) {
      var lengde = Number(v.lengde) || 0;
      var bredde = Number(v.bredde) || 0;
      var svinn = Number(v.svinn) || 10;
      if (lengde <= 0 || bredde <= 0) return null;
      var areal = lengde * bredde;
      var brutto = areal * (1 + svinn / 100);
      var results = [
        { label: 'Takareal', value: Math.round(areal * 10) / 10, unit: 'm²' },
        { label: 'Inkl. svinn', value: Math.ceil(brutto * 10) / 10, unit: 'm²' }
      ];
      if (v.tekking === 'shingel') {
        // 1 pakke shingel dekker ca. 3 m²
        results.push({ label: 'Shingelpakker', value: Math.ceil(brutto / 3), unit: 'pk (3 m²)' });
        results.push({ label: 'Shingelpapp (underlag)', value: Math.ceil(brutto / 15), unit: 'rull (15 m²)' });
        results.push({ label: 'Shingel-spiker', value: Math.ceil(brutto * 10), unit: 'stk' });
      } else if (v.tekking === 'staaltak') {
        // Plater ca. 1.1m effektiv bredde
        var antPlater = Math.ceil(lengde / 1.05);
        results.push({ label: 'Antall plater', value: antPlater, unit: 'stk' });
        results.push({ label: 'Takskruer', value: Math.ceil(brutto * 6), unit: 'stk' });
        results.push({ label: 'Underlagspapp', value: Math.ceil(brutto / 15), unit: 'rull (15 m²)' });
      } else if (v.tekking === 'takstein') {
        // Ca. 10 stein per m²
        results.push({ label: 'Takstein', value: Math.ceil(brutto * 10), unit: 'stk' });
        results.push({ label: 'Lekter (30x48)', value: Math.ceil(brutto * 3.3), unit: 'lm' });
        results.push({ label: 'Sløyfer (36x48)', value: Math.ceil(lengde * Math.ceil(bredde / 0.6)), unit: 'lm' });
      } else {
        results.push({ label: 'Takpapp', value: Math.ceil(brutto / 10), unit: 'rull (10 m²)' });
        results.push({ label: 'Pappspiker', value: Math.ceil(brutto * 8), unit: 'stk' });
      }
      // Felles
      var mone = Math.ceil(lengde * 1.1);
      results.push({ label: 'Mønekam / beslag', value: mone, unit: 'lm' });
      return results;
    }
  },

  lekter: {
    label: 'Lekter / sløyfer',
    icon: '',
    desc: 'Beregn lekter og sløyfer for vegg eller tak.',
    fields: [
      { id: 'areal', label: 'Areal (m²)', type: 'number', placeholder: '50' },
      { id: 'type', label: 'Type', type: 'select', options: [
        { value: 'sloeyfe', label: 'Sløyfer (vertikale, for kledning)' },
        { value: 'lekt_vegg', label: 'Utlekting vegg (horisontale)' },
        { value: 'lekt_tak', label: 'Nedlekting tak' },
        { value: 'krysslekt', label: 'Krysslekting (begge retninger)' }
      ], default: 'sloeyfe' },
      { id: 'cc', label: 'Senteravstand c/c', type: 'select', options: [
        { value: '300', label: '300 mm' },
        { value: '400', label: '400 mm' },
        { value: '600', label: '600 mm (standard)' }
      ], default: '600' },
      { id: 'dim', label: 'Dimensjon', type: 'select', options: [
        { value: '23x36', label: '23 × 36 mm (sløyfe)' },
        { value: '25x48', label: '25 × 48 mm' },
        { value: '30x48', label: '30 × 48 mm (standard lekt)' },
        { value: '36x48', label: '36 × 48 mm (trykkimpregnert)' },
        { value: '48x48', label: '48 × 48 mm' }
      ], default: '30x48' },
      { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '10', default: 10 }
    ],
    calc: function(v) {
      var areal = Number(v.areal) || 0;
      var cc = Number(v.cc) || 600;
      var svinn = Number(v.svinn) || 10;
      if (areal <= 0) return null;
      // lm per m²: 1000 / cc-avstand
      var lmPerM2 = 1000 / cc;
      var lmNetto = areal * lmPerM2;
      if (v.type === 'krysslekt') {
        lmNetto = lmNetto * 2;
      }
      var lmBrutto = lmNetto * (1 + svinn / 100);
      var skruer = Math.ceil(areal * 8);
      return [
        { label: 'Dimensjon', value: v.dim || '30x48', unit: 'mm' },
        { label: 'Lekt/sløyfe netto', value: Math.ceil(lmNetto), unit: 'lm' },
        { label: 'Inkl. svinn', value: Math.ceil(lmBrutto), unit: 'lm' },
        { label: 'Antall lengder (4m)', value: Math.ceil(lmBrutto / 4), unit: 'stk' },
        { label: 'Skruer', value: skruer, unit: 'stk' }
      ];
    }
  },

  terrasse: {
    label: 'Terrasse',
    icon: '',
    desc: 'Beregn terrassebord, bjelkelag og skruer.',
    fields: [
      { id: 'lengde', label: 'Terrasselengde (m)', type: 'number', placeholder: '5' },
      { id: 'bredde', label: 'Terrassebredde (m)', type: 'number', placeholder: '3' },
      { id: 'bordType', label: 'Terrassebord', type: 'select', options: [
        { value: '28x120', label: '28 × 120 mm royalimpregnert' },
        { value: '28x145', label: '28 × 145 mm royalimpregnert' },
        { value: '28x120k', label: '28 × 120 mm kompositt' },
        { value: '26x118', label: '26 × 118 mm furu trykkimpregnert' }
      ], default: '28x120' },
      { id: 'bjelkeCC', label: 'Bjelke c/c', type: 'select', options: [
        { value: '400', label: '400 mm' },
        { value: '600', label: '600 mm (standard)' }
      ], default: '600' },
      { id: 'bjelkeDim', label: 'Bjelkedimensjon', type: 'select', options: [
        { value: '48x148', label: '48 × 148 mm' },
        { value: '48x198', label: '48 × 198 mm' },
        { value: '73x198', label: '73 × 198 mm' }
      ], default: '48x148' },
      { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '10', default: 10 }
    ],
    calc: function(v) {
      var lengde = Number(v.lengde) || 0;
      var bredde = Number(v.bredde) || 0;
      var svinn = Number(v.svinn) || 10;
      var bjelkeCC = Number(v.bjelkeCC) || 600;
      if (lengde <= 0 || bredde <= 0) return null;
      var areal = lengde * bredde;
      // Terrassebord
      var bordBr = 120;
      if ((v.bordType || '').indexOf('145') >= 0) bordBr = 145;
      else if ((v.bordType || '').indexOf('118') >= 0) bordBr = 118;
      var gap = 5;
      var dekkBr = bordBr + gap;
      var lmPerM2 = 1000 / dekkBr;
      var bordLmNetto = areal * lmPerM2;
      var bordLmBrutto = bordLmNetto * (1 + svinn / 100);
      // Bjelker
      var antBjelker = Math.ceil((lengde * 1000) / bjelkeCC) + 1;
      var bjelkeLm = antBjelker * bredde;
      // Skruer: 2 per bord per bjelke-krysning
      var skruer = Math.ceil(bordLmBrutto / lengde) * antBjelker * 2;
      return [
        { label: 'Terrasseareal', value: Math.round(areal * 10) / 10, unit: 'm²' },
        { label: 'Terrassebord netto', value: Math.ceil(bordLmNetto), unit: 'lm' },
        { label: 'Terrassebord inkl. svinn', value: Math.ceil(bordLmBrutto), unit: 'lm' },
        { label: 'Bjelker (' + (v.bjelkeDim || '48x148') + ')', value: antBjelker, unit: 'stk à ' + bredde + 'm' },
        { label: 'Bjelker løpemeter', value: Math.ceil(bjelkeLm * 10) / 10, unit: 'lm' },
        { label: 'Terrasseskruer', value: skruer, unit: 'stk' }
      ];
    }
  },

  rekkverk: {
    label: 'Rekkverk',
    icon: '',
    desc: 'Beregn materialbehov for rekkverk (terrasse, trapp, balkong).',
    fields: [
      { id: 'lengde', label: 'Total lengde (m)', type: 'number', placeholder: '8' },
      { id: 'type', label: 'Rekkverkstype', type: 'select', options: [
        { value: 'sprosser', label: 'Med sprosser (vertikale)' },
        { value: 'glass', label: 'Med glass' },
        { value: 'liggende', label: 'Liggende bord (3 stk)' }
      ], default: 'sprosser' },
      { id: 'hoyde', label: 'Rekkverkshøyde (m)', type: 'select', options: [
        { value: '0.9', label: '0,9 m (terrasse < 0,5m)' },
        { value: '1.0', label: '1,0 m (standard)' },
        { value: '1.2', label: '1,2 m (balkong / høyt)' }
      ], default: '1.0' },
      { id: 'stolpeCC', label: 'Stolpe c/c', type: 'select', options: [
        { value: '1000', label: '1000 mm' },
        { value: '1200', label: '1200 mm (standard)' },
        { value: '1500', label: '1500 mm' }
      ], default: '1200' }
    ],
    calc: function(v) {
      var lengde = Number(v.lengde) || 0;
      var hoyde = Number(v.hoyde) || 1.0;
      var stolpeCC = Number(v.stolpeCC) || 1200;
      if (lengde <= 0) return null;
      var antStolper = Math.ceil((lengde * 1000) / stolpeCC) + 1;
      var stolpeLm = antStolper * (hoyde + 0.3);
      var results = [
        { label: 'Stolper', value: antStolper, unit: 'stk' },
        { label: 'Stolper løpemeter', value: Math.ceil(stolpeLm * 10) / 10, unit: 'lm' },
        { label: 'Håndlist', value: Math.ceil(lengde * 1.05), unit: 'lm' }
      ];
      if (v.type === 'sprosser') {
        // Maks 100mm mellom sprosser (TEK17)
        var sprosserPerSeksjon = Math.ceil((stolpeCC - 50) / 100);
        var totSprosser = (antStolper - 1) * sprosserPerSeksjon;
        results.push({ label: 'Sprosser', value: totSprosser, unit: 'stk' });
        results.push({ label: 'Sprosser løpemeter', value: Math.ceil(totSprosser * hoyde * 10) / 10, unit: 'lm' });
      } else if (v.type === 'glass') {
        var antGlass = antStolper - 1;
        results.push({ label: 'Glasseksjoner', value: antGlass, unit: 'stk' });
        results.push({ label: 'Glasslister', value: Math.ceil(lengde * 2.2), unit: 'lm' });
      } else {
        results.push({ label: 'Liggende bord (3 stk)', value: Math.ceil(lengde * 3 * 1.05), unit: 'lm' });
      }
      var bolter = antStolper * 2;
      results.push({ label: 'Stolpebolter / beslag', value: bolter, unit: 'stk' });
      return results;
    }
  },

  listverk: {
    label: 'Listverk',
    icon: '',
    desc: 'Beregn listverk for rom (fotlist, taklist, gerikter).',
    fields: [
      { id: 'romLengde', label: 'Romlengde (m)', type: 'number', placeholder: '5' },
      { id: 'romBredde', label: 'Rombredde (m)', type: 'number', placeholder: '4' },
      { id: 'dorer', label: 'Antall dører', type: 'number', placeholder: '2', default: 1 },
      { id: 'vinduer', label: 'Antall vinduer', type: 'number', placeholder: '2', default: 1 },
      { id: 'inkl', label: 'Skal beregnes', type: 'select', options: [
        { value: 'alle', label: 'Fotlist + taklist + gerikter' },
        { value: 'fotlist', label: 'Kun fotlister' },
        { value: 'taklist', label: 'Kun taklister' },
        { value: 'gerikter', label: 'Kun gerikter (dør/vindu)' }
      ], default: 'alle' },
      { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '10', default: 10 }
    ],
    calc: function(v) {
      var lengde = Number(v.romLengde) || 0;
      var bredde = Number(v.romBredde) || 0;
      var dorer = Number(v.dorer) || 0;
      var vinduer = Number(v.vinduer) || 0;
      var svinn = Number(v.svinn) || 10;
      if (lengde <= 0 || bredde <= 0) return null;
      var omkrets = (lengde + bredde) * 2;
      var mult = 1 + svinn / 100;
      var results = [];
      var dorAapning = 0.9;
      var vinduBredde = 1.0;
      if (v.inkl === 'alle' || v.inkl === 'fotlist') {
        var fotNetto = omkrets - (dorer * dorAapning);
        results.push({ label: 'Fotlister', value: Math.ceil(fotNetto * mult), unit: 'lm' });
      }
      if (v.inkl === 'alle' || v.inkl === 'taklist') {
        results.push({ label: 'Taklister', value: Math.ceil(omkrets * mult), unit: 'lm' });
      }
      if (v.inkl === 'alle' || v.inkl === 'gerikter') {
        // Dørgerikt: 2 sider + 1 topp = ca. 5,1 lm per dør (2×2,1m + 0,9m)
        var dorGerikt = dorer * 5.1;
        // Vindu: 4 sider, ca. 4,0 lm per vindu (2×1,0 + 2×1,0)
        var vinduGerikt = vinduer * 4.0;
        if (dorer > 0) results.push({ label: 'Gerikter dør', value: Math.ceil(dorGerikt * mult), unit: 'lm' });
        if (vinduer > 0) results.push({ label: 'Gerikter vindu', value: Math.ceil(vinduGerikt * mult), unit: 'lm' });
      }
      // Hjørnelister
      results.push({ label: 'Hjørnelister (innv.)', value: 4, unit: 'stk à 2,4m' });
      var totLm = results.reduce(function(s, r) {
        return s + (r.unit === 'lm' ? r.value : 0);
      }, 0);
      results.push({ label: 'Totalt listverk', value: totLm, unit: 'lm' });
      results.push({ label: 'Dykkert / spikerpistol', value: Math.ceil(totLm * 4), unit: 'stk' });
      return results;
    }
  },

  vindu: {
    label: 'Vindu / dør',
    icon: '',
    desc: 'Beregn material for omramming, foring og beslag rundt vindu eller dør.',
    fields: [
      { id: 'antall', label: 'Antall vinduer/dører', type: 'number', placeholder: '4', default: 1 },
      { id: 'bredde', label: 'Gjennomsnittlig bredde (m)', type: 'number', placeholder: '1.2', default: 1.2 },
      { id: 'hoyde', label: 'Gjennomsnittlig høyde (m)', type: 'number', placeholder: '1.5', default: 1.5 },
      { id: 'type', label: 'Type', type: 'select', options: [
        { value: 'vindu', label: 'Vindu (4 sider)' },
        { value: 'dor', label: 'Dør (3 sider, uten bunn)' }
      ], default: 'vindu' },
      { id: 'inkl', label: 'Inkluderer', type: 'select', options: [
        { value: 'alt', label: 'Foring + gerikt + beslag' },
        { value: 'foring', label: 'Kun foring' },
        { value: 'gerikt', label: 'Kun gerikt' },
        { value: 'beslag', label: 'Kun beslag / vannbrett' }
      ], default: 'alt' }
    ],
    calc: function(v) {
      var antall = Number(v.antall) || 0;
      var bredde = Number(v.bredde) || 1.2;
      var hoyde = Number(v.hoyde) || 1.5;
      if (antall <= 0) return null;
      var sider = v.type === 'dor' ? 3 : 4;
      var omkrets = v.type === 'dor'
        ? (hoyde * 2 + bredde)
        : (hoyde * 2 + bredde * 2);
      var totalOmkrets = omkrets * antall;
      var results = [];
      if (v.inkl === 'alt' || v.inkl === 'foring') {
        results.push({ label: 'Foring', value: Math.ceil(totalOmkrets * 1.1), unit: 'lm' });
      }
      if (v.inkl === 'alt' || v.inkl === 'gerikt') {
        // Gerikt på begge sider
        results.push({ label: 'Gerikt (2 sider)', value: Math.ceil(totalOmkrets * 2 * 1.05), unit: 'lm' });
      }
      if (v.inkl === 'alt' || v.inkl === 'beslag') {
        // Vannbrett / beslag under vindu
        var vannbrett = v.type === 'vindu' ? antall : 0;
        if (vannbrett > 0) results.push({ label: 'Vannbrett / beslag', value: vannbrett, unit: 'stk' });
        results.push({ label: 'Tetteband', value: Math.ceil(totalOmkrets * 1.1), unit: 'lm' });
      }
      results.push({ label: 'Dykkert', value: Math.ceil(totalOmkrets * 2 * 4), unit: 'stk' });
      results.push({ label: 'Fugemasse', value: Math.ceil(antall * 0.5), unit: 'patron' });
      return results;
    }
  }
};

var _matCalcCurrent = 'stender';

function openMatCalc() {
  var el = $('#matCalcModal');
  if (el) {
    el.classList.remove('hidden');
    renderMatCalcTabs();
    renderMatCalcBody();
  }
}

function closeMatCalc() {
  var el = $('#matCalcModal');
  if (el) el.classList.add('hidden');
}

function switchMatCalc(id) {
  _matCalcCurrent = id;
  renderMatCalcTabs();
  renderMatCalcBody();
}

function renderMatCalcTabs() {
  var container = $('#matCalcTabs');
  if (!container) return;
  var html = '';
  Object.keys(matCalcDefs).forEach(function(key) {
    var d = matCalcDefs[key];
    var active = key === _matCalcCurrent ? ' mc-tab-active' : '';
    html += '<button class="mc-tab' + active + '" onclick="switchMatCalc(\'' + key + '\')">' + (d.icon ? d.icon + ' ' : '') + d.label + '</button>';
  });
  container.innerHTML = html;
}

function renderMatCalcBody() {
  var container = $('#matCalcBody');
  if (!container) return;
  var def = matCalcDefs[_matCalcCurrent];
  if (!def) return;

  var html = '<div class="mc-desc">' + def.desc + '</div>';
  html += '<div class="mc-fields">';
  def.fields.forEach(function(f) {
    html += '<div class="mc-field">';
    html += '<label for="mc_' + f.id + '">' + f.label + '</label>';
    if (f.type === 'select') {
      html += '<select id="mc_' + f.id + '" onchange="calcMatCalc()">';
      f.options.forEach(function(opt) {
        var sel = (f.default !== undefined && String(f.default) === opt.value) ? ' selected' : '';
        html += '<option value="' + opt.value + '"' + sel + '>' + opt.label + '</option>';
      });
      html += '</select>';
    } else if (f.type === 'checkbox') {
      var checked = f.default ? ' checked' : '';
      html += '<label class="mc-checkbox"><input type="checkbox" id="mc_' + f.id + '"' + checked + ' onchange="calcMatCalc()" /> Ja</label>';
    } else {
      var defVal = f.default !== undefined ? ' value="' + f.default + '"' : '';
      html += '<input type="number" inputmode="decimal" id="mc_' + f.id + '" placeholder="' + (f.placeholder || '') + '"' + defVal + ' oninput="calcMatCalc()" />';
    }
    html += '</div>';
  });
  html += '</div>';
  html += '<div id="matCalcResult" class="mc-result mc-result-empty"><div class="mc-result-placeholder">Fyll inn verdier for å se resultat</div></div>';
  container.innerHTML = html;

  calcMatCalc();
}

function calcMatCalc() {
  var def = matCalcDefs[_matCalcCurrent];
  if (!def) return;
  var values = {};
  def.fields.forEach(function(f) {
    var el = document.getElementById('mc_' + f.id);
    if (!el) return;
    if (f.type === 'checkbox') {
      values[f.id] = el.checked;
    } else {
      values[f.id] = el.value;
    }
  });

  var results = def.calc(values);
  var container = $('#matCalcResult');
  if (!container) return;

  if (!results) {
    container.className = 'mc-result mc-result-empty';
    container.innerHTML = '<div class="mc-result-placeholder">Fyll inn verdier for å se resultat</div>';
    return;
  }

  container.className = 'mc-result mc-result-filled';
  var html = '<div class="mc-result-title">Resultat</div>';
  html += '<div class="mc-result-grid">';
  results.forEach(function(r) {
    html += '<div class="mc-result-item">';
    html += '<div class="mc-result-label">' + r.label + '</div>';
    html += '<div class="mc-result-value">' + r.value + ' <span class="mc-result-unit">' + r.unit + '</span></div>';
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}
