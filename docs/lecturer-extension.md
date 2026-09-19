# תוסף המרצה של Syllo

התוסף נשאר local-first: כל מפגש נשמר ב־`chrome.storage.local`, כולל כשהרשת או Syllo אינם זמינים. רק לאחר סיום שיעור אפשר לסנכרן ידנית מתוך הסקירה או היסטוריית התוסף. העלאה חוזרת של אותו `session_id` מעדכנת את אותו מפגש, ולכן אינה יוצרת מפגש, שקף או סימון כפולים.

## חיבור ל־Syllo

ה־API הוא `POST /api/lecturer/sessions`. הוא מקבל מפגש מרצה בלבד ומאמת את ארבעת סוגי הסימונים: `PASS`, `HARD`, `DEEPEN`, `REVISIT`. נתוני סטודנטים, זהויות, תגובות או פרטי התחברות אינם נשלחים.

הגנת ה־MVP משתמשת באימות המרצה הקיים: מדף ההגדרות של התוסף בוחרים **הנפקת אסימון Syllo**, מזינים את פרטי הכניסה לאזור המרצה, ומקבלים אסימון חתום קצר־חיים ל־8 שעות. הסיסמה אינה נשמרת; רק האסימון נשמר מקומית. בשרת חובה להגדיר `LECTURER_USERNAME`, `LECTURER_PASSWORD` ו־`LECTURER_SYNC_TOKEN_SECRET`.

הגדרות היעד מרוכזות ב־[config.js](/Users/noam.sheffi/EDX/extensions/lecturer-reflection/config.js). בפיתוח הכתובת היא `http://localhost:3000`. לפני אריזת גרסת production יש להחליף אותה בדומיין Syllo ולהוסיף את אותו דומיין, ורק אותו, ל־`host_permissions` ב־`manifest.json`. בשרת יש להגדיר `SYLLO_EXTENSION_ORIGIN` ל־`chrome-extension://<extension-id>` כדי לאפשר CORS עבור אותו תוסף. לא משתמשים ב־`<all_urls>`.

יש להריץ את [migration 003](/Users/noam.sheffi/EDX/db/migrations/003_create_lecturer_sessions.sql) מול מסד הנתונים לפני סנכרון. התצוגה למרצה נמצאת ב־`/lecturer/sessions` ומוגנת על ידי אימות המרצה הקיים.

`id_source: index-fallback` מוצג כאזהרה: מזהה כזה תקף להשוואה רק בתוך אותה `deck_version`; אין לקשר אותו בשקט בין גרסאות מצגת שונות.
