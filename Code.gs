const SHEET_NAMES = {
  VOCABULARY: 'Vocabulary',
  PROGRESS: 'Progress',
  SETTINGS: 'Settings',
  HISTORY: 'History'
};

const DEFAULT_SETTINGS = {
  batch: 1,
  totalAnswered: 0,
  totalCorrect: 0
};

function doGet() {
  ensureSheets_();
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Easy English｜個人單字練習')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSS_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;

  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) {
    throw new Error(
      '找不到 Google Sheet。建議從 Google Sheet 的「擴充功能 → Apps Script」建立綁定專案；' +
      '若使用獨立 Apps Script，請在指令碼屬性設定 SPREADSHEET_ID。'
    );
  }
  return SpreadsheetApp.openById(id);
}

function ensureSheets_() {
  const ss = getSS_();

  let vocabulary = ss.getSheetByName(SHEET_NAMES.VOCABULARY);
  if (!vocabulary) {
    vocabulary = ss.insertSheet(SHEET_NAMES.VOCABULARY);
    vocabulary.getRange(1, 1, 1, 2).setValues([['en', 'zh']]);
    vocabulary.setFrozenRows(1);
  }

  let progress = ss.getSheetByName(SHEET_NAMES.PROGRESS);
  if (!progress) {
    progress = ss.insertSheet(SHEET_NAMES.PROGRESS);
    progress.getRange(1, 1, 1, 10).setValues([[
      'en', 'seen', 'correct', 'wrong', 'spellingWrong',
      'mastery', 'lastSeen', 'spellingPassed',
      'lastSpellingDate', 'crossDaySpellingSuccess'
    ]]);
    progress.setFrozenRows(1);
  }

  let settings = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!settings) {
    settings = ss.insertSheet(SHEET_NAMES.SETTINGS);
    settings.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
    settings.setFrozenRows(1);
  }

  let history = ss.getSheetByName(SHEET_NAMES.HISTORY);
  if (!history) {
    history = ss.insertSheet(SHEET_NAMES.HISTORY);
    history.getRange(1, 1, 1, 7).setValues([[
      'timestamp', 'en', 'zh', 'mode', 'result', 'input', 'batch'
    ]]);
    history.setFrozenRows(1);
  }
}

function getInitialData() {
  ensureSheets_();
  const ss = getSS_();

  const words = getObjects_(ss.getSheetByName(SHEET_NAMES.VOCABULARY))
    .map((r, i) => ({
      en: String(r.en || '').trim(),
      zh: String(r.zh || '').trim(),
      order: i + 1
    }))
    .filter(w => w.en && w.zh);

  const progress = {};
  getObjects_(ss.getSheetByName(SHEET_NAMES.PROGRESS)).forEach(r => {
    const en = String(r.en || '').trim();
    if (!en) return;

    progress[en] = {
      seen: Number(r.seen || 0),
      correct: Number(r.correct || 0),
      wrong: Number(r.wrong || 0),
      spellingWrong: Number(r.spellingWrong || 0),
      mastery: Number(r.mastery || 0),
      lastSeen: r.lastSeen ? new Date(r.lastSeen).getTime() : 0,
      spellingPassed:
        r.spellingPassed === true ||
        String(r.spellingPassed || '').toUpperCase() === 'TRUE',
      lastSpellingDate: r.lastSpellingDate
        ? new Date(r.lastSpellingDate).getTime()
        : 0,
      crossDaySpellingSuccess: Number(r.crossDaySpellingSuccess || 0)
    };
  });

  const settings = { ...DEFAULT_SETTINGS };
  getObjects_(ss.getSheetByName(SHEET_NAMES.SETTINGS)).forEach(r => {
    if (!r.key) return;
    settings[String(r.key)] = r.value;
  });

  const maxBatch = Math.max(1, Math.ceil(words.length / 20));
  settings.batch = Math.min(maxBatch, Math.max(1, Number(settings.batch || 1)));

  return {
    words,
    progress,
    settings: {
      batch: Number(settings.batch || 1),
      totalAnswered: Number(settings.totalAnswered || 0),
      totalCorrect: Number(settings.totalCorrect || 0)
    },
    dashboardStats: getDashboardStats_()
  };
}

function saveProgress(payload) {
  ensureSheets_();
  if (!payload || !payload.en) throw new Error('saveProgress: 缺少英文單字');

  const sheet = getSS_().getSheetByName(SHEET_NAMES.PROGRESS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const enCol = headers.indexOf('en');

  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][enCol] || '') === String(payload.en)) {
      rowIndex = i + 1;
      break;
    }
  }

  const obj = {
    en: String(payload.en),
    seen: Number(payload.seen || 0),
    correct: Number(payload.correct || 0),
    wrong: Number(payload.wrong || 0),
    spellingWrong: Number(payload.spellingWrong || 0),
    mastery: Number(payload.mastery || 0),
    lastSeen: payload.lastSeen ? new Date(payload.lastSeen) : new Date(),
    spellingPassed: !!payload.spellingPassed,
    lastSpellingDate: payload.lastSpellingDate
      ? new Date(payload.lastSpellingDate)
      : '',
    crossDaySpellingSuccess: Number(payload.crossDaySpellingSuccess || 0)
  };

  const row = headers.map(h =>
    Object.prototype.hasOwnProperty.call(obj, h) ? obj[h] : ''
  );

  if (rowIndex === -1) sheet.appendRow(row);
  else sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);

  return true;
}

function saveSettings(settings) {
  ensureSheets_();
  const sheet = getSS_().getSheetByName(SHEET_NAMES.SETTINGS);

  const values = {
    batch: Number(settings.batch || 1),
    totalAnswered: Number(settings.totalAnswered || 0),
    totalCorrect: Number(settings.totalCorrect || 0)
  };

  Object.keys(values).forEach(key => upsertSetting_(sheet, key, values[key]));
  return true;
}

function saveHistory(record) {
  ensureSheets_();
  const sheet = getSS_().getSheetByName(SHEET_NAMES.HISTORY);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);

  const obj = {
    timestamp: new Date(),
    en: record.en || '',
    zh: record.zh || '',
    mode: record.mode || '',
    result: record.result || '',
    input: record.input || '',
    batch: Number(record.batch || 1)
  };

  sheet.appendRow(headers.map(h =>
    Object.prototype.hasOwnProperty.call(obj, h) ? obj[h] : ''
  ));
  return true;
}

function resetLearningData() {
  ensureSheets_();
  const ss = getSS_();

  [SHEET_NAMES.PROGRESS, SHEET_NAMES.SETTINGS, SHEET_NAMES.HISTORY].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
  });

  return true;
}

function getDashboardStats_() {
  const sheet = getSS_().getSheetByName(SHEET_NAMES.HISTORY);
  if (!sheet || sheet.getLastRow() < 2) {
    return { todayAnswered: 0, todayCorrect: 0, learningStreak: 0 };
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const timeCol = headers.indexOf('timestamp');
  const resultCol = headers.indexOf('result');
  if (timeCol < 0) return { todayAnswered: 0, todayCorrect: 0, learningStreak: 0 };

  const tz = Session.getScriptTimeZone() || 'Asia/Taipei';
  const todayKey = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const learnedDates = {};
  let todayAnswered = 0;
  let todayCorrect = 0;

  for (let i = 1; i < values.length; i++) {
    const raw = values[i][timeCol];
    if (!raw) continue;
    const date = raw instanceof Date ? raw : new Date(raw);
    if (isNaN(date.getTime())) continue;

    const key = Utilities.formatDate(date, tz, 'yyyy-MM-dd');
    learnedDates[key] = true;

    if (key === todayKey) {
      todayAnswered++;
      if (
        resultCol >= 0 &&
        String(values[i][resultCol] || '').trim().toLowerCase() === 'correct'
      ) todayCorrect++;
    }
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = Utilities.formatDate(yesterday, tz, 'yyyy-MM-dd');

  let cursor = learnedDates[todayKey]
    ? new Date(today)
    : learnedDates[yesterdayKey]
      ? new Date(yesterday)
      : null;

  let learningStreak = 0;
  while (cursor) {
    const key = Utilities.formatDate(cursor, tz, 'yyyy-MM-dd');
    if (!learnedDates[key]) break;
    learningStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { todayAnswered, todayCorrect, learningStreak };
}

function upsertSetting_(sheet, key, value) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const keyCol = headers.indexOf('key');
  const valueCol = headers.indexOf('value');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][keyCol] || '') === String(key)) {
      sheet.getRange(i + 1, valueCol + 1).setValue(value);
      return;
    }
  }

  sheet.appendRow(headers.map(h => h === 'key' ? key : h === 'value' ? value : ''));
}

function getObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);

  return values.slice(1)
    .filter(row => row.some(v => v !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}
