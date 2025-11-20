/**
 * Extract 295 Tom Cruise Running Instances
 *
 * Data source: Movies, Films & Flix - "The Tom Cruise Running Special"
 * URL: https://moviesfilmsandflix.com/2025/04/27/the-tom-cruise-running-special-ranking-his-best-running-moments-since-1981/
 *
 * This script transforms the ranked running instances into MongoDB-ready documents
 * with inferred metadata (intensity, location) and placeholders for manual data entry.
 */

const fs = require('fs');
const path = require('path');

// Helper function to infer intensity from description
function inferIntensity(description) {
  const desc = description.toLowerCase();
  if (desc.includes('sprint')) return 'sprint';
  if (desc.includes('jog')) return 'jog';
  if (desc.includes('chase') || desc.includes('pursuit') || desc.includes('runs from'))
    return 'pursuit';
  if (desc.includes('treadmill')) return 'treadmill';
  if (desc.includes('slow-mo')) return 'cinematic';
  if (desc.includes('run')) return 'run';
  return 'run'; // default
}

// Helper function to infer location from description
function inferLocation(description) {
  const desc = description.toLowerCase();

  // City/Country extraction
  const cities = {
    shanghai: { city: 'Shanghai', country: 'China' },
    berlin: { city: 'Berlin', country: 'Germany' },
    kashmir: { city: 'Kashmir', country: 'India' },
    venice: { city: 'Venice', country: 'Italy' },
    london: { city: 'London', country: 'UK' },
    dubai: { city: 'Dubai', country: 'UAE' },
    paris: { city: 'Paris', country: 'France' },
    'new orleans': { city: 'New Orleans', country: 'USA' },
    'mardi gras': { city: 'New Orleans', country: 'USA' },
  };

  for (const [key, value] of Object.entries(cities)) {
    if (desc.includes(key)) {
      return { ...value, setting: inferSetting(description) };
    }
  }

  // Setting-only
  return { city: null, country: null, setting: inferSetting(description) };
}

// Helper function to infer setting from description
function inferSetting(description) {
  const desc = description.toLowerCase();
  if (desc.includes('rooftop') || desc.includes('roof')) return 'rooftop';
  if (desc.includes('street') || desc.includes('road') || desc.includes('alley')) return 'street';
  if (desc.includes('beach') || desc.includes('sand')) return 'beach';
  if (desc.includes('hospital')) return 'hospital, indoor';
  if (desc.includes('building') || desc.includes('lobby') || desc.includes('hallway'))
    return 'building, indoor';
  if (desc.includes('tunnel') || desc.includes('sewer')) return 'tunnel, underground';
  if (desc.includes('train')) return 'train';
  if (desc.includes('airport')) return 'airport';
  if (desc.includes('forest') || desc.includes('woods')) return 'forest, outdoor';
  if (desc.includes('field')) return 'field, outdoor';
  if (desc.includes('desert') || desc.includes('sand')) return 'desert, outdoor';
  if (desc.includes('stairs') || desc.includes('stair')) return 'stairs';
  if (desc.includes('indoor') || desc.includes('inside') || desc.includes('office'))
    return 'indoor';
  if (desc.includes('outdoor') || desc.includes('outside')) return 'outdoor';
  return 'various';
}

// Helper to extract tags from description
function extractTags(description, rank) {
  const tags = [];
  const desc = description.toLowerCase();

  if (rank <= 10) tags.push('top-10');
  if (rank <= 25) tags.push('top-25');
  if (desc.includes('iconic')) tags.push('iconic');
  if (desc.includes('ankle') || desc.includes('break') || desc.includes('injury'))
    tags.push('injury');
  if (desc.includes('one take') || desc.includes('continuous')) tags.push('one-take');
  if (desc.includes('slow-mo') || desc.includes('slow motion')) tags.push('slow-motion');
  if (desc.includes('explosion')) tags.push('explosion');
  if (desc.includes('helicopter')) tags.push('helicopter');
  if (desc.includes('stunt')) tags.push('stunt');
  if (desc.includes('jump')) tags.push('jump');
  if (desc.includes('practical')) tags.push('practical-stunt');

  return tags;
}

// ALL 295 RUNNING INSTANCES
// Data from Movies, Films & Flix ranking
const instances = [
  // TOP 10 - Full detail with timestamps and analysis
  {
    rank: 1,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Shanghai rooftop to fishing village sprint',
    timestamp: '01:44:10',
    notes:
      'Took 6-7 takes to get perfect. Spidercam rig built for scene. Director J.J. Abrams: "I loved watching you run"',
    youtubeUrl: 'https://www.youtube.com/watch?v=[to be added]',
  },
  {
    rank: 2,
    film: 'Collateral',
    year: 2004,
    description: 'Throws chair through window, WIPES out on chair, keeps running',
    timestamp: '01:44:50',
    notes: 'Unplanned moment made it into film. Adds realism. Director: Michael Mann',
    youtubeUrl: 'https://www.youtube.com/watch?v=[to be added]',
  },
  {
    rank: 3,
    film: 'Vanilla Sky',
    year: 2001,
    description: 'Empty Times Square running',
    timestamp: '00:03:37',
    notes:
      'Closed Times Square for 3 hours, Sunday morning November. Character hates being alone, dreams of emptiness. Director: Cameron Crowe',
  },
  {
    rank: 4,
    film: 'Risky Business',
    year: 1983,
    description: 'Cigarette-smoking approach in sunglasses/suit coat',
    timestamp: '01:07:26',
    notes: 'Seven seconds. "When Cruise became Tom Cruise". Soundtrack: Mannish Boy',
    youtubeUrl: 'https://www.youtube.com/watch?v=[to be added]',
  },
  {
    rank: 5,
    film: 'Mission: Impossible',
    year: 1996,
    description: 'Restaurant explosion escape',
    timestamp: '31:59',
    notes: 'Made him action movie star. One of most iconic images of MI franchise',
  },
  {
    rank: 6,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: 'Blackfriars Railway bridge crossing',
    timestamp: '01:36:25',
    notes:
      'Cruise quote: "I loved doing this, but it hurt". Recovering from ankle break. Beautiful tracking shot. Director: Christopher McQuarrie',
  },
  {
    rank: 7,
    film: 'Mission: Impossible - Rogue Nation',
    year: 2015,
    description: 'Car jump wipeout',
    timestamp: '01:12:58',
    notes:
      'Surprising crew with ill-fated bit. Doesn\'t take himself seriously. Dialogue: "What are you talking about?"',
  },
  {
    rank: 8,
    film: 'Far and Away',
    year: 1992,
    description: 'Transition to explosion via running',
    timestamp: '01:40:13',
    notes: 'Film ends with Land Run of 1893. Director: Ron Howard',
  },
  {
    rank: 9,
    film: 'The Firm',
    year: 1993,
    description: 'Final chase sequence - runs, jumps, stairs while holding briefcase',
    timestamp: '02:12:23',
    notes: 'First film to fully showcase his soon-to-be-famous running form (elbows and knees)',
  },
  {
    rank: 10,
    film: 'Edge of Tomorrow',
    year: 2014,
    description: '"Arrest this man" office escape attempt',
    timestamp: null,
    notes:
      'Demonstrates charm weaponization. Heroic transformation setup. Failed escape ends arrest, sets tone for character arc',
  },

  // TOP 25 - With timestamps
  {
    rank: 11,
    film: 'Collateral',
    year: 2004,
    description: 'Hospital to overpass, fastest on screen',
    timestamp: '00:52:25',
  },
  {
    rank: 12,
    film: 'War of the Worlds',
    year: 2005,
    description: 'Runs from aliens, ash-covered',
    timestamp: '00:26:29',
  },
  {
    rank: 13,
    film: 'Days of Thunder',
    year: 1990,
    description: 'Races Robert Duvall',
    timestamp: '01:42:54',
  },
  {
    rank: 14,
    film: 'Risky Business',
    year: 1983,
    description: 'Takes drunk from train, runs back',
    timestamp: '01:20:45',
  },
  {
    rank: 15,
    film: 'Mission: Impossible II',
    year: 2000,
    description: 'Slow-mo building jump, dual guns',
    timestamp: '01:25:58',
  },
  {
    rank: 16,
    film: 'Jerry Maguire',
    year: 1996,
    description: 'Airport running',
    timestamp: '02:06:05',
  },
  {
    rank: 17,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: '"Must go faster" roof, foot-breaking jump',
    timestamp: '01:34:20',
  },
  {
    rank: 18,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Burj Khalifa escape',
    timestamp: null,
  },
  {
    rank: 19,
    film: 'Minority Report',
    year: 2002,
    description: 'House running, stop murder',
    timestamp: '00:15:28:00',
  },
  {
    rank: 20,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: 'Bathroom fight, wall slam',
    timestamp: '00:32:38',
  },
  {
    rank: 21,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: 'Roof running, two jumps',
    timestamp: '01:33:48',
  },
  {
    rank: 22,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: 'Circle running, overhead cathedral stairs',
    timestamp: '01:32:59',
  },
  {
    rank: 23,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: '"Keep going straight?" window smash',
    timestamp: '01:34:53',
  },
  {
    rank: 24,
    film: 'The Mummy',
    year: 2017,
    description: '"Slip in, slip out" shot sequence',
    timestamp: '00:10:15',
  },
  {
    rank: 25,
    film: 'Collateral',
    year: 2004,
    description: 'Subway, jump, angry',
    timestamp: '01:46:10',
  },

  // RANKS 26-100
  {
    rank: 26,
    film: 'The Firm',
    year: 1993,
    description: 'Chases Abbey - first super form showcase',
    timestamp: null,
  },
  {
    rank: 27,
    film: 'Mission: Impossible - Rogue Nation',
    year: 2015,
    description: 'Runs and jumps onto plane wing',
    timestamp: null,
  },
  {
    rank: 28,
    film: 'All the Right Moves',
    year: 1983,
    description: 'Interception, runs through players, touchdown',
    timestamp: null,
  },
  {
    rank: 29,
    film: 'War of the Worlds',
    year: 2005,
    description: 'Dead cow jumping',
    timestamp: null,
  },
  {
    rank: 30,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Runs and jumps off Shanghai building',
    timestamp: null,
  },
  {
    rank: 31,
    film: 'Oblivion',
    year: 2013,
    description: 'Runs to clone, punches',
    timestamp: null,
  },
  {
    rank: 32,
    film: 'Risky Business',
    year: 1983,
    description: 'Runs to catch egg',
    timestamp: null,
  },
  {
    rank: 33,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Runs up wall',
    timestamp: null,
  },
  {
    rank: 34,
    film: 'War of the Worlds',
    year: 2005,
    description: 'Enjoys storm, lightning, runs inside',
    timestamp: null,
  },
  {
    rank: 35,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Venice to Ilsa',
    timestamp: null,
  },
  {
    rank: 36,
    film: 'Mission: Impossible 2',
    year: 2000,
    description: 'Slow-mo dove kick',
    timestamp: null,
  },
  {
    rank: 37,
    film: 'Mission: Impossible - Rogue Nation',
    year: 2015,
    description: 'Run kick lands on Ilsa',
    timestamp: null,
  },
  {
    rank: 38,
    film: 'Born on the Fourth of July',
    year: 1989,
    description: 'Slow-mo beach running',
    timestamp: null,
  },
  {
    rank: 39,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Kitchen grease run, train jump',
    timestamp: null,
  },
  {
    rank: 40,
    film: 'The Mummy',
    year: 2017,
    description: 'Stone fence hop, leaves lady',
    timestamp: null,
  },
  {
    rank: 41,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: '"Terribly sorry" - funeral interruption',
    timestamp: null,
  },
  {
    rank: 42,
    film: 'Mission: Impossible - Rogue Nation',
    year: 2015,
    description: 'Hunt and Ilsa jump car, raptors',
    timestamp: null,
  },
  {
    rank: 43,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Venice jumping boat, wrong directions',
    timestamp: null,
  },
  {
    rank: 44,
    film: 'Taps',
    year: 1981,
    description: 'Group running, excellent posture',
    timestamp: null,
  },
  {
    rank: 45,
    film: 'Mission: Impossible - Rogue Nation',
    year: 2015,
    description: 'Limping, breathing, glass explosion',
    timestamp: null,
  },
  {
    rank: 46,
    film: 'Top Gun: Maverick',
    year: 2022,
    description: 'Long distance woods running, overhead shot',
    timestamp: null,
  },
  { rank: 47, film: 'Oblivion', year: 2013, description: 'Sand dune running', timestamp: null },
  {
    rank: 48,
    film: 'The Color of Money',
    year: 1986,
    description: 'Kicks guy, makes big, runs',
    timestamp: null,
  },
  {
    rank: 49,
    film: 'Mission: Impossible - Rogue Nation',
    year: 2015,
    description: 'Hunt and Ilsa running',
    timestamp: null,
  },
  {
    rank: 50,
    film: 'Oblivion',
    year: 2013,
    description: 'Sprints to battery drone',
    timestamp: null,
  },
  {
    rank: 51,
    film: 'Edge of Tomorrow',
    year: 2014,
    description: "Can't outrun beach fiery death",
    timestamp: null,
  },
  {
    rank: 52,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Skyscraper running',
    timestamp: null,
  },
  {
    rank: 53,
    film: 'Mission: Impossible 2',
    year: 2000,
    description: 'Beach fight running',
    timestamp: null,
  },
  {
    rank: 54,
    film: 'Jack Reacher: Never Go Back',
    year: 2016,
    description: 'Runs from thugs, parallel groups',
    timestamp: null,
  },
  {
    rank: 55,
    film: 'Mission: Impossible 2',
    year: 2000,
    description: 'Slow-mo helicopter running, flip shot goon',
    timestamp: null,
  },
  {
    rank: 56,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Runs up falling train',
    timestamp: null,
  },
  {
    rank: 57,
    film: 'Jack Reacher',
    year: 2012,
    description: 'Grabs rock, runs, knocks guy out',
    timestamp: null,
  },
  {
    rank: 58,
    film: 'Minority Report',
    year: 2002,
    description: 'Great run and spin',
    timestamp: null,
  },
  {
    rank: 59,
    film: 'Jack Reacher: Never Go Back',
    year: 2016,
    description: 'Parks running with Colby outpacing',
    timestamp: null,
  },
  {
    rank: 60,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Runs from Kremlin explosion',
    timestamp: null,
  },
  {
    rank: 61,
    film: 'Top Gun: Maverick',
    year: 2022,
    description: 'Runs to hanger, "Let\'s start running"',
    timestamp: null,
  },
  {
    rank: 62,
    film: 'Mission: Impossible - Rogue Nation',
    year: 2015,
    description: 'Opera, building, rope exit running',
    timestamp: null,
  },
  {
    rank: 63,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Running charge moment',
    timestamp: null,
  },
  {
    rank: 64,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Running/limping after car',
    timestamp: null,
  },
  {
    rank: 65,
    film: 'Collateral',
    year: 2004,
    description: 'Staircase and lobby running',
    timestamp: null,
  },
  {
    rank: 66,
    film: 'Far and Away',
    year: 1992,
    description: 'Runs and tackles spoon thief',
    timestamp: null,
  },
  { rank: 67, film: 'Far and Away', year: 1992, description: 'Runs and slips', timestamp: null },
  {
    rank: 68,
    film: 'Mission: Impossible 2',
    year: 2000,
    description: 'Runs, picks up Dougray, slams',
    timestamp: null,
  },
  {
    rank: 69,
    film: 'The Last Samurai',
    year: 2003,
    description: 'Teaches kids baseball',
    timestamp: null,
  },
  {
    rank: 70,
    film: 'Oblivion',
    year: 2013,
    description: 'Runs from fireball, good jump',
    timestamp: null,
  },
  {
    rank: 71,
    film: 'Cocktail',
    year: 1988,
    description: 'Uses breakaway speed past doorman',
    timestamp: null,
  },
  {
    rank: 72,
    film: 'All the Right Moves',
    year: 1983,
    description: '"You are not god!" - lots of running',
    timestamp: null,
  },
  {
    rank: 73,
    film: 'Minority Report',
    year: 2002,
    description: 'Runs through streets, pre-crime ads',
    timestamp: null,
  },
  {
    rank: 74,
    film: 'Vanilla Sky',
    year: 2001,
    description: 'Labored odd running, crane shot, REM',
    timestamp: null,
  },
  {
    rank: 75,
    film: 'Mission: Impossible',
    year: 1996,
    description: 'Runs up stairs, along bridge',
    timestamp: null,
  },
  {
    rank: 76,
    film: 'The Mummy',
    year: 2017,
    description: 'Runs through London avoiding sand',
    timestamp: null,
  },
  {
    rank: 77,
    film: 'The Mummy',
    year: 2017,
    description: 'Runs through library, glass shatters',
    timestamp: null,
  },
  { rank: 78, film: 'Oblivion', year: 2013, description: 'Runs, jumps, shoots', timestamp: null },
  {
    rank: 79,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Trailer featured explosion moment',
    timestamp: null,
  },
  {
    rank: 80,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Runs after villains',
    timestamp: null,
  },
  {
    rank: 81,
    film: 'Edge of Tomorrow',
    year: 2014,
    description: 'Beach running, truck hit',
    timestamp: null,
  },
  {
    rank: 82,
    film: 'Mission: Impossible 2',
    year: 2000,
    description: 'Rips off mask while running',
    timestamp: null,
  },
  {
    rank: 83,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Sand running',
    timestamp: null,
  },
  {
    rank: 84,
    film: 'Mission: Impossible',
    year: 1996,
    description: 'Climbs fence, sprints alley, phone booth',
    timestamp: null,
  },
  {
    rank: 85,
    film: 'Mission: Impossible',
    year: 1996,
    description: 'Slick cobbled road running',
    timestamp: null,
  },
  {
    rank: 86,
    film: 'The Last Samurai',
    year: 2003,
    description: '"CHARGE!" - dead man running',
    timestamp: null,
  },
  {
    rank: 87,
    film: 'War of the Worlds',
    year: 2005,
    description: 'Leather jacket running',
    timestamp: null,
  },
  {
    rank: 88,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: 'Limping, breaks into run, jumps shrubs',
    timestamp: null,
  },
  {
    rank: 89,
    film: 'Top Gun: Maverick',
    year: 2022,
    description: 'Runs from shooting helicopter',
    timestamp: null,
  },
  {
    rank: 90,
    film: 'Oblivion',
    year: 2013,
    description: 'Circular treadmill running',
    timestamp: null,
  },
  {
    rank: 91,
    film: 'Mission: Impossible III',
    year: 2006,
    description: "Street sprinting to grab Rabbit's Foot",
    timestamp: null,
  },
  {
    rank: 92,
    film: 'Top Gun: Maverick',
    year: 2022,
    description: 'Treadmill running',
    timestamp: null,
  },
  {
    rank: 93,
    film: 'The Outsiders',
    year: 1983,
    description: 'Runs, flips off car',
    timestamp: null,
  },
  {
    rank: 94,
    film: 'Jack Reacher: Never Go Back',
    year: 2016,
    description: 'Runs, climbs car, jumps balcony',
    timestamp: null,
  },
  {
    rank: 95,
    film: 'The Last Samurai',
    year: 2003,
    description: 'Explosiveness during ambush',
    timestamp: null,
  },
  {
    rank: 96,
    film: 'Oblivion',
    year: 2013,
    description: 'Runs and jumps over gap',
    timestamp: null,
  },
  {
    rank: 97,
    film: 'Mission: Impossible II',
    year: 2000,
    description: 'Runs up to goon, kicks',
    timestamp: null,
  },
  {
    rank: 98,
    film: 'Knight and Day',
    year: 2010,
    description: 'Beach running, explosions',
    timestamp: null,
  },
  {
    rank: 99,
    film: 'Jack Reacher: Never Go Back',
    year: 2016,
    description: 'Runs with Colby from dude',
    timestamp: null,
  },
  {
    rank: 100,
    film: 'War of the Worlds',
    year: 2005,
    description: "Can't outrun alien machine",
    timestamp: null,
  },

  // RANKS 101-200 (condensed descriptions)
  { rank: 101, film: 'Mission: Impossible 2', year: 2000, description: 'Runs and rolls into vent' },
  {
    rank: 102,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: 'Runs/walks/limps to fight Walker',
  },
  {
    rank: 103,
    film: 'Edge of Tomorrow',
    year: 2014,
    description: 'Follows roll, runs alongside truck',
  },
  { rank: 104, film: 'Risky Business', year: 1983, description: 'Wide shot into school' },
  { rank: 105, film: 'Knight and Day', year: 2010, description: 'Runs, jumps, hangs' },
  {
    rank: 106,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Runs to catch train',
  },
  {
    rank: 107,
    film: 'The Last Samurai',
    year: 2003,
    description: 'Runs during battle, saves life',
  },
  { rank: 108, film: 'The Mummy', year: 2017, description: 'Runs and jumps on building top' },
  { rank: 109, film: 'Edge of Tomorrow', year: 2014, description: 'PT - fun running' },
  { rank: 110, film: 'War of the Worlds', year: 2005, description: 'Street crack running' },
  {
    rank: 111,
    film: 'Born on the Fourth of July',
    year: 1989,
    description: 'Rain running - awkward',
  },
  {
    rank: 112,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Jumps balcony, runs through club',
  },
  {
    rank: 113,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: 'Hunts chased, runs into cathedral',
  },
  {
    rank: 114,
    film: 'Mission: Impossible',
    year: 1996,
    description: 'Runs around corner, car explodes, stairs',
  },
  { rank: 115, film: 'Edge of Tomorrow', year: 2014, description: 'Cage and Rita run at aliens' },
  { rank: 116, film: 'All the Right Moves', year: 1983, description: 'Pass interference in rain' },
  {
    rank: 117,
    film: 'Edge of Tomorrow',
    year: 2014,
    description: 'Gets past truck, Emily Blunt, drop ship',
  },
  {
    rank: 118,
    film: 'Born on the Fourth of July',
    year: 1989,
    description: 'Runs into village with group',
  },
  { rank: 119, film: 'Far and Away', year: 1992, description: 'Hoofs out of apartment' },
  {
    rank: 120,
    film: 'Knight and Day',
    year: 2010,
    description: 'Roof running, jump, slide, jump, river fall',
  },
  {
    rank: 121,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Airport ladder climbing, overhead shot',
  },
  {
    rank: 122,
    film: 'Mission: Impossible III',
    year: 2006,
    description: '"I\'m in approach position" - long shot',
  },
  { rank: 123, film: 'Minority Report', year: 2002, description: 'Runs from operatives' },
  { rank: 124, film: 'All the Right Moves', year: 1983, description: 'More left in tank' },
  { rank: 125, film: 'Legend', year: 1985, description: 'Jump, grab weapon, battle hell guard' },
  { rank: 126, film: 'Mission: Impossible - Fallout', year: 2018, description: 'Runs to Luther' },
  {
    rank: 127,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Shanghai street running',
  },
  {
    rank: 128,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Airport running',
  },
  {
    rank: 129,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Runs from Kremlin, collects breath',
  },
  {
    rank: 130,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: 'Sees helicopter, runs toward rope',
  },
  {
    rank: 131,
    film: 'Jack Reacher: Never Go Back',
    year: 2016,
    description: 'Runs, pushes guy off roof',
  },
  { rank: 132, film: 'Edge of Tomorrow', year: 2014, description: 'Runs and knocks car' },
  { rank: 133, film: 'Edge of Tomorrow', year: 2014, description: 'Kicks alien butt' },
  {
    rank: 134,
    film: 'Jack Reacher: Never Go Back',
    year: 2016,
    description: 'Roof running, charges goon',
  },
  {
    rank: 135,
    film: 'Minority Report',
    year: 2002,
    description: 'Creeps hallway, chases eyeballs',
  },
  { rank: 136, film: 'Vanilla Sky', year: 2001, description: 'Wobbly lobby running, spin' },
  {
    rank: 137,
    film: 'Edge of Tomorrow',
    year: 2014,
    description: 'Bumps guy, helicopter lands on Cruise',
  },
  { rank: 138, film: 'Vanilla Sky', year: 2001, description: 'Runs down stairs - wobbly' },
  { rank: 139, film: 'American Made', year: 2017, description: 'Chases car, explodes' },
  {
    rank: 140,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Suit running to catch villains',
  },
  {
    rank: 141,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Runs with walkie talkie',
  },
  { rank: 142, film: 'Knight and Day', year: 2010, description: 'Roof running' },
  {
    rank: 143,
    film: 'Mission: Impossible - Rogue Nation',
    year: 2015,
    description: 'Cruise and Renner chase Benji',
  },
  { rank: 144, film: 'Legend', year: 1985, description: 'Swamp running to save comrade' },
  {
    rank: 145,
    film: 'War of the Worlds',
    year: 2005,
    description: '"Rachel!" - protects daughter',
  },
  {
    rank: 146,
    film: 'Born on the Fourth of July',
    year: 1989,
    description: 'Rounds up team before battle',
  },
  {
    rank: 147,
    film: 'Knight and Day',
    year: 2010,
    description: 'Ducks and runs from Cameron Diaz',
  },
  {
    rank: 148,
    film: 'War of the Worlds',
    year: 2005,
    description: 'Get out of water, shore, woods running',
  },
  {
    rank: 149,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: '"Open the door!" - prison running',
  },
  {
    rank: 150,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Bridge running, long jump',
  },
  {
    rank: 151,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Slick move on Italian guys',
  },
  {
    rank: 152,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Runs from crew, darted in parking lot',
  },
  { rank: 153, film: 'Far and Away', year: 1992, description: 'Irish hill running' },
  {
    rank: 154,
    film: 'The Last Samurai',
    year: 2003,
    description: 'Runs before battle, crouch running/jogging',
  },
  { rank: 155, film: 'Far and Away', year: 1992, description: 'Irish hill running' },
  { rank: 156, film: 'Edge of Tomorrow', year: 2014, description: 'Runs from alien to grab gun' },
  {
    rank: 157,
    film: 'Risky Business',
    year: 1983,
    description: 'Leaves cab, runs along street, to apartment',
  },
  { rank: 158, film: 'Oblivion', year: 2013, description: 'Gets blown backward while running' },
  { rank: 159, film: 'Collateral', year: 2004, description: 'Runs from crashed taxi' },
  { rank: 160, film: 'Minority Report', year: 2002, description: 'Jumps bed, grabs guy' },
  {
    rank: 161,
    film: 'War of the Worlds',
    year: 2005,
    description: 'Field running, basement running',
  },
  { rank: 162, film: 'Jerry Maguire', year: 1996, description: 'Runs through dark hallway' },
  {
    rank: 163,
    film: 'Mission: Impossible 2',
    year: 2000,
    description: 'Shoots guys, runs to steal motorcycle',
  },
  {
    rank: 164,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: 'Runs across elevator to ladder',
  },
  {
    rank: 165,
    film: 'Jack Reacher',
    year: 2012,
    description: 'Runs up steps, kicks door with gun',
  },
  { rank: 166, film: 'War of the Worlds', year: 2005, description: '"Stay together" - chases kid' },
  {
    rank: 167,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Puddle running, factory running',
  },
  { rank: 168, film: 'War of the Worlds', year: 2005, description: 'Basement running' },
  {
    rank: 169,
    film: 'Mission: Impossible - Rogue Nation',
    year: 2015,
    description: 'Runs away, talks to Ilsa, hallway running',
  },
  { rank: 170, film: 'Cocktail', year: 1988, description: 'Wide shot through snow with props' },
  {
    rank: 171,
    film: 'Mission: Impossible',
    year: 1996,
    description: 'Disguised as firefighter jogging',
  },
  { rank: 172, film: 'The Firm', year: 1993, description: 'Runs with books' },
  { rank: 173, film: 'Endless Love', year: 1981, description: 'Plays soccer, takes off shirt' },
  { rank: 174, film: 'Jack Reacher', year: 2012, description: 'More quarry running' },
  { rank: 175, film: 'Jack Reacher', year: 2012, description: 'Quarry running' },
  {
    rank: 176,
    film: 'Far and Away',
    year: 1992,
    description: 'Jumps off train, runs through field',
  },
  { rank: 177, film: 'Legend', year: 1985, description: 'Runs and jumps into lake' },
  { rank: 178, film: 'The Mummy', year: 2017, description: 'Runs up stairs from Mummy' },
  { rank: 179, film: 'Top Gun: Maverick', year: 2022, description: 'Beach running, football' },
  { rank: 180, film: 'Risky Business', year: 1983, description: 'Backyard running with lawn gear' },
  { rank: 181, film: 'Interview With the Vampire', year: 1994, description: 'Creepy running' },
  { rank: 182, film: 'Cocktail', year: 1988, description: 'Jets past bouncers' },
  {
    rank: 183,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'More Venice running',
  },
  { rank: 184, film: 'Cocktail', year: 1988, description: 'Running in white pants' },
  { rank: 185, film: 'Rain Man', year: 1988, description: 'Runs through house after fire alarm' },
  { rank: 186, film: 'Oblivion', year: 2013, description: 'Lands plane, runs to Julia' },
  {
    rank: 187,
    film: 'Oblivion',
    year: 2013,
    description: 'Sand running to help Julia, back to ship',
  },
  {
    rank: 188,
    film: 'Jack Reacher: Never Go Back',
    year: 2016,
    description: 'Moves through doors, runs after food truck',
  },
  { rank: 189, film: 'War of the Worlds', year: 2005, description: 'Runs and grabs Fanning' },
  { rank: 190, film: 'Far and Away', year: 1992, description: 'Irish fog running' },
  { rank: 191, film: 'American Made', year: 2017, description: 'Runs to grab cash' },
  {
    rank: 192,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Bridge running, fun slide',
  },
  { rank: 193, film: 'Far and Away', year: 1992, description: 'Runs with mule and gun' },
  {
    rank: 194,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Sand running',
  },
  {
    rank: 195,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Runs into building',
  },
  {
    rank: 196,
    film: 'Jerry Maguire',
    year: 1996,
    description: 'Runs through rain to copy manifesto',
  },
  { rank: 197, film: 'Eyes Wide Shut', year: 1999, description: 'Runs across street, toward cab' },
  { rank: 198, film: 'The Firm', year: 1993, description: 'Runs around backyard' },
  {
    rank: 199,
    film: 'Mission: Impossible III',
    year: 2006,
    description: '"Get down" shenanigans, jumps car',
  },
  {
    rank: 200,
    film: 'War of the Worlds',
    year: 2005,
    description: 'Family on ferry, running through ferry',
  },

  // RANKS 201-295 (brief descriptions)
  {
    rank: 201,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Crouched running to car',
  },
  {
    rank: 202,
    film: 'War of the Worlds',
    year: 2005,
    description: 'Running through woods carrying Dakota Fanning',
  },
  {
    rank: 203,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Tight Venice alley running',
  },
  {
    rank: 204,
    film: 'Mission: Impossible III',
    year: 2006,
    description: '"Get down!" - runs from helicopter gunfire',
  },
  { rank: 205, film: 'Far and Away', year: 1992, description: 'Snow running' },
  { rank: 206, film: 'All The Right Moves', year: 1983, description: 'Goes for man, not ball' },
  { rank: 207, film: 'Legend', year: 1985, description: 'Runs to pick sword' },
  { rank: 208, film: 'Legend', year: 1985, description: 'Runs through closing hell gate' },
  { rank: 209, film: 'Edge of Tomorrow', year: 2014, description: 'Training' },
  { rank: 210, film: 'Edge of Tomorrow', year: 2014, description: 'Runs to bridge' },
  {
    rank: 211,
    film: 'All the Right Moves',
    year: 1983,
    description: 'Runs outside to kiss Leah Thompson',
  },
  {
    rank: 212,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Runs into shelter, gunfight running',
  },
  {
    rank: 213,
    film: 'War of the Worlds',
    year: 2005,
    description: 'Stair, street, backyard running',
  },
  {
    rank: 214,
    film: 'Jack Reacher: Never Go Back',
    year: 2016,
    description: 'Runs across street, up steps',
  },
  { rank: 215, film: 'Days of Thunder', year: 1990, description: "Runs to Nicole Kidman's car" },
  { rank: 216, film: 'Rain Man', year: 1988, description: 'Runs from phone booth' },
  {
    rank: 217,
    film: 'Born on the Fourth of July',
    year: 1989,
    description: 'Intense snow running, wrestling practice',
  },
  { rank: 218, film: 'Risky Business', year: 1983, description: 'Jumps car, runs to house' },
  {
    rank: 219,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Runs to fight in Venice',
  },
  { rank: 220, film: 'Minority Report', year: 2002, description: 'Runs around precog platform' },
  {
    rank: 221,
    film: 'The Color of Money',
    year: 1986,
    description: 'Runs across street to chat Paul Newman',
  },
  { rank: 222, film: 'The Mummy', year: 2017, description: 'Runs to grab weapon' },
  {
    rank: 223,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Train run, parachuting',
  },
  {
    rank: 224,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Sewer running',
  },
  { rank: 225, film: 'The Mummy', year: 2017, description: 'Gallops from Russell Crowe' },
  {
    rank: 226,
    film: 'War of the Worlds',
    year: 2005,
    description: 'Sprints from crashing alien ship',
  },
  { rank: 227, film: 'Oblivion', year: 2013, description: 'Med kit running' },
  {
    rank: 228,
    film: 'Minority Report',
    year: 2002,
    description: 'Runs down platform, puts on shirt',
  },
  { rank: 229, film: 'War of the Worlds', year: 2005, description: 'Crowd running' },
  { rank: 230, film: 'War of the Worlds', year: 2005, description: 'Runs behind car door' },
  { rank: 231, film: 'Cocktail', year: 1988, description: 'Beach running' },
  { rank: 232, film: 'The Firm', year: 1993, description: 'Runs into office to answer call' },
  {
    rank: 233,
    film: 'Jack Reacher: Never Go Back',
    year: 2016,
    description: 'New Orleans running',
  },
  { rank: 234, film: 'Taps', year: 1981, description: 'Runs with gun' },
  { rank: 235, film: 'Legend', year: 1985, description: 'Running from little demons' },
  { rank: 236, film: 'Taps', year: 1981, description: 'Leads students to front' },
  { rank: 237, film: 'All the Right Moves', year: 1983, description: 'Runs onto football field' },
  {
    rank: 238,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Runs into room, shoots goon',
  },
  { rank: 239, film: 'Knight and Day', year: 2010, description: 'Rescue running' },
  { rank: 240, film: 'Edge of Tomorrow', year: 2014, description: 'Outruns exploding helicopter' },
  {
    rank: 241,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Train running',
  },
  { rank: 242, film: 'The Mummy', year: 2017, description: 'More zombie running' },
  { rank: 243, film: 'The Mummy', year: 2017, description: 'Runs from zombies' },
  {
    rank: 244,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Shrub running, hospital running',
  },
  { rank: 245, film: 'The Mummy', year: 2017, description: 'Runs from Mummy and rats' },
  {
    rank: 246,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Prison running',
  },
  { rank: 247, film: 'The Mummy', year: 2017, description: 'Even more running from Mummy' },
  { rank: 248, film: 'The Mummy', year: 2017, description: 'More running from Mummy' },
  {
    rank: 249,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: 'Runs for cover in tunnel',
  },
  { rank: 250, film: 'Legend', year: 1985, description: 'More snow running' },
  {
    rank: 251,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'MORE help running Russell',
  },
  {
    rank: 252,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'More help running Russell',
  },
  { rank: 253, film: 'Mission: Impossible III', year: 2006, description: 'Helps Keri Russell' },
  { rank: 254, film: 'Edge of Tomorrow', year: 2014, description: 'Running with limp' },
  { rank: 255, film: 'Legend', year: 1985, description: 'Snow running' },
  {
    rank: 256,
    film: 'Edge of Tomorrow',
    year: 2014,
    description: '"We\'ve been through worse" - final run',
  },
  { rank: 257, film: 'Rain Man', year: 1988, description: 'Runs to help Raymond in street' },
  {
    rank: 258,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Flashback running',
  },
  { rank: 259, film: 'Jack Reacher: Never Go Back', year: 2016, description: 'Rain jogging' },
  { rank: 260, film: 'Rain Man', year: 1988, description: 'Runs across street' },
  {
    rank: 261,
    film: 'Mission: Impossible 2',
    year: 2000,
    description: 'Sneaky running through tunnel',
  },
  { rank: 262, film: 'Legend', year: 1985, description: 'Hell prison running and crouching' },
  {
    rank: 263,
    film: 'Mission: Impossible - Ghost Protocol',
    year: 2011,
    description: 'Kremlin running',
  },
  { rank: 264, film: 'Legend', year: 1985, description: 'More hell prison running' },
  { rank: 265, film: 'Legend', year: 1985, description: 'Hell prison running' },
  { rank: 266, film: 'Knight and Day', year: 2010, description: 'Sprints through jungle' },
  {
    rank: 267,
    film: 'All the Right Moves',
    year: 1983,
    description: 'Mud running on football field',
  },
  { rank: 268, film: 'Oblivion', year: 2013, description: 'Runs and hides behind pillar' },
  {
    rank: 269,
    film: 'The Outsiders',
    year: 1983,
    description: 'Animated running around house corner',
  },
  { rank: 270, film: 'Cocktail', year: 1988, description: 'Jumps car, runs to bus' },
  { rank: 271, film: 'Jerry Maguire', year: 1996, description: 'Panicked running to office' },
  { rank: 272, film: 'Risky Business', year: 1983, description: 'Front door running' },
  {
    rank: 273,
    film: 'Mission: Impossible - Fallout',
    year: 2018,
    description: 'Runs through gunfire',
  },
  { rank: 274, film: 'Legend', year: 1985, description: 'Forest running' },
  {
    rank: 275,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Runs toward car, steals it',
  },
  {
    rank: 276,
    film: 'Mission: Impossible - Rogue Nation',
    year: 2015,
    description: 'Runs from Ilsa during opera shooting',
  },
  {
    rank: 277,
    film: 'Jack Reacher: Never Go Back',
    year: 2016,
    description: 'Mardi Gras running (5 combined moments)',
  },
  {
    rank: 278,
    film: 'Mission: Impossible III',
    year: 2006,
    description: 'Quick run through Vatican catacombs',
  },
  { rank: 279, film: 'All the Right Moves', year: 1983, description: "Can't catch running back" },
  { rank: 280, film: 'Knight and Day', year: 2010, description: 'Duck and run' },
  { rank: 281, film: 'Taps', year: 1981, description: 'Jogs to Timothy Hutton' },
  { rank: 282, film: 'Taps', year: 1981, description: 'Runs to front of students' },
  { rank: 283, film: 'Mission: Impossible', year: 1996, description: 'Jogs to ladder' },
  { rank: 284, film: 'The Firm', year: 1993, description: 'Super fast house running' },
  {
    rank: 285,
    film: 'Mission: Impossible - Dead Reckoning Part One',
    year: 2023,
    description: 'Running to safe car',
  },
  { rank: 286, film: 'The Mummy', year: 2017, description: 'Runs to horse' },
  { rank: 287, film: 'Legend', year: 1985, description: 'Hell prison crouched jogging' },
  { rank: 288, film: 'The Firm', year: 1993, description: 'Stair running' },
  { rank: 289, film: 'Days of Thunder', year: 1990, description: 'Jogs through parking garage' },
  { rank: 290, film: 'Top Gun', year: 1986, description: 'Quick run before steps' },
  { rank: 291, film: 'Mission: Impossible II', year: 2000, description: 'Runs up stairs' },
  { rank: 292, film: 'Top Gun', year: 1986, description: 'Runs to hit volleyball' },
  {
    rank: 293,
    film: "Losin' It",
    year: 1983,
    description: 'Runs to convertible while being chased',
  },
  { rank: 294, film: "Losin' It", year: 1983, description: 'Runs to get into a car' },
  {
    rank: 295,
    film: "Losin' It",
    year: 1983,
    description: 'Quick moment featuring Cruise starting to run',
  },
];

// Transform into MongoDB-ready documents
const mongoDocuments = instances.map((instance) => {
  const location = inferLocation(instance.description);
  const intensity = inferIntensity(instance.description);
  const tags = extractTags(instance.description, instance.rank);

  return {
    filmTitle: instance.film,
    filmYear: instance.year,
    rank: instance.rank,
    sequenceNumber: null, // Will be calculated per-film during import

    scene: {
      context: instance.description,
      timestampStart: instance.timestamp || null,
      timestampEnd: null,
      intensity: intensity,
      location: location,
    },

    measurement: {
      distanceFeet: null, // Placeholder for manual entry
      durationSeconds: null, // Placeholder for manual entry
      calculatedBy: null,
      confidence: null,
      source: null,
      calculatedAt: null,
    },

    media: {
      youtubeUrl: instance.youtubeUrl || null,
      youtubeTimestamp: instance.timestamp || null,
      clips: [],
      screenshots: [],
    },

    metadata: {
      director: null,
      cinematographer: null,
      stunts: {
        isTomCruise: null,
        stuntDouble: null,
        injuries: [],
      },
      behindTheScenes: instance.notes || null,
      directorQuotes: [],
    },

    tags: tags,

    sources: {
      ranking: {
        provider: 'Movies Films & Flix',
        url: 'https://moviesfilmsandflix.com/2025/04/27/the-tom-cruise-running-special-ranking-his-best-running-moments-since-1981/',
        publishedAt: new Date('2025-04-27'),
      },
      description: {
        provider: 'Movies Films & Flix',
        author: 'Mark Hobin',
      },
      distance: {
        provider: 'Rotten Tomatoes',
        methodology: '14.6 feet/second calculation (6-minute mile pace)',
        note: 'Manual calculation needed from video timing',
      },
    },
  };
});

// Write to JSON file
const outputPath = path.join(__dirname, 'extracted295instances.json');
fs.writeFileSync(outputPath, JSON.stringify(mongoDocuments, null, 2));

console.log(`✅ Extracted ${mongoDocuments.length} running instances to ${outputPath}`);
console.log('\nSummary:');
console.log(`  - Total instances: ${mongoDocuments.length}`);
console.log(`  - With timestamps: ${mongoDocuments.filter((d) => d.scene.timestampStart).length}`);
console.log(
  `  - With behind-the-scenes notes: ${mongoDocuments.filter((d) => d.metadata.behindTheScenes).length}`
);
console.log(`  - With YouTube links: ${mongoDocuments.filter((d) => d.media.youtubeUrl).length}`);
console.log('\nTop 10 instances:');
mongoDocuments.slice(0, 10).forEach((d) => {
  console.log(
    `  ${d.rank}. ${d.filmTitle} (${d.filmYear}): ${d.scene.context.substring(0, 50)}...`
  );
});
