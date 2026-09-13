# STEMFlow

מאגר מוצר לגילוי בעיות למידה פעילות בקורס מערכות תקשורת עבור סטודנטים להנדסאים ולתחומי STEM.

## מצב הפרויקט

הפרויקט נמצא בשלב **Product Discovery**. בשלב זה אוספים ראיות על בעיות הלמידה של הסטודנטים לפני שבוחרים פתרון או בונים מוצר. לצורך Product Lab #01 קיים סקר ווב קטן, שמטרתו איסוף תשובות בלבד ולא בדיקת פתרון.

הניסוי הראשון הוא Product Lab #01 — Problem Discovery: פעילות קצרה של 5–7 דקות שמטרתה להבין כיצד סטודנטים משתמשים בחומרי הקורס, היכן הם נתקעים, כיצד הם מתאוששים מקושי, ואיזה חיכוך קיים סביב Google Classroom וחומרי הקורס.

## מבנה המאגר

```text
docs/
  product-vision.md              # כיוון המוצר ועקרונות הגילוי
experiments/
  001-problem-discovery/         # חומרי Product Lab #01
research/
  raw-notes/                     # תצפיות ותמלולים ללא עיבוד
  synthesis.md                   # תובנות מחקר מצטברות
```

## הפעלת הסקר מקומית

נדרשת גרסת Node.js עדכנית.

```bash
npm install
npm run dev
```

1. העתיקו את `.env.example` ל-`.env.local` והזינו ערכים מקומיים אמיתיים עבור מסד הנתונים וגישה למרצה.
2. הריצו את קובץ הסכימה `db/migrations/001_create_survey_submissions.sql` ב-Neon SQL Editor.
3. הפעילו:

```bash
npm install
npm run dev
```

פתחו את [http://localhost:3000](http://localhost:3000). הסקר שולח הגשה אנונימית אל `POST /api/submissions`; טיוטה ומזהה דפדפן נשמרים ב-`localStorage` רק להתאוששות ולמניעת כפילות. התוצאות זמינות ב-`/lecturer` ומוגנות ב-HTTP Basic Auth.

## הגדרת Vercel ו-Neon

1. צרו פרויקט Vercel חדש וחברו אליו את GitHub repository `noamsheffi/stemflow`.
2. בפרויקט Vercel, הוסיפו **Neon Postgres** דרך Vercel Marketplace וחברו אותו לאותו פרויקט. ודאו ש-`DATABASE_URL` הוזרק ל-Production ול-Preview לפי הצורך.
3. פתחו את Neon SQL Editor והריצו פעם אחת את `db/migrations/001_create_survey_submissions.sql`.
4. ב-Vercel → Settings → Environment Variables הגדירו ערכים פרטיים ל-`LECTURER_USERNAME` ול-`LECTURER_PASSWORD`. אין להגדיר אותם כ-`NEXT_PUBLIC_*`.
5. לבדיקות מקומיות, העתיקו את אותם שמות משתנים ל-`.env.local` עם `DATABASE_URL` המתאים. קובץ זה מתעלם מ-Git.

לא נדרשת הגדרת Google Classroom, Google SSO, חשבון סטודנט או שירות AI.

## גבולות השלב הנוכחי

- הסקר אינו כולל אימות משתמשים לסטודנטים, Google Classroom, Google SSO או יכולות AI.
- אין יכולות AI.
- ההחלטות העתידיות יתבססו על ממצאי המחקר, ולא על הנחת פתרון מראש.

## עבודה עם Product Lab #01

לפני השיעור: עברו על `hypothesis.md` ועל `survey-questions.md`.

במהלך השיעור: הריצו את הסקר ואת שיחת ההמשך לפי `discussion-guide.md`.

אחרי השיעור: שמרו הערות גולמיות ב-`research/raw-notes/`, סכמו דפוסים ב-`research/synthesis.md`, ותעדו החלטה ב-`decision.md`.
