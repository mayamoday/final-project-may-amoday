# My Camp — מסמך הגשת פרויקט גמר

מערכת Full-Stack לניהול משלחות קיץ של הסוכנות היהודית בארה"ב — ריכוז נתוני חניכים, עדכונים יומיים וניהול אדמיניסטרטיבי לצוות, מנהלי המשלחת והורים, בפלטפורמה אחת.

## 1. קישור לפרויקט חי

🔗 [https://final-project-may-amoday.vercel.app](https://final-project-may-amoday.vercel.app)

## 2. קישור ל-GitHub (עם README)

🔗 [https://github.com/mayamoday/final-project-may-amoday](https://github.com/mayamoday/final-project-may-amoday)

## 3. תרשים ERD של בסיס הנתונים

תרשים ה-ERD משקף את הטבלאות והקשרים כפי שהם מיושמים בקוד הנוכחי (`src/lib/api.ts`, `src/contexts/AuthContext.tsx`, ועוד).

```
mermaid
erDiagram
    auth_users   ||--o| profiles        : "has"
    auth_users   ||--o{ study_sessions  : "owns"
    auth_users   ||--o{ tasks           : "owns"
    study_sessions ||--o{ tasks         : "contains"
    staff        ||--o{ tasks           : "assigned to"
    staff        ||--o{ post            : "authors"
    staff        ||--o{ expense         : "reports"
    staff        ||--o{ document        : "authors"
    staff        ||--o{ events          : "reports"
    staff        ||--o{ staff_campers   : "links"
    staff        ||--o{ post_likes      : "gives"
    staff        ||--o{ post_comments   : "writes"
    camper       ||--o{ document        : "has"
    camper       ||--o{ events          : "involved in"
    camper       ||--o{ staff_campers   : "links"
    camper       ||--o{ parent_inquiries: "subject of"
    post         ||--o{ post_likes      : "receives"
    post         ||--o{ post_comments   : "has"

    auth_users {
        uuid id PK
    }
    profiles {
        uuid id PK
        uuid user_id FK "UNIQUE"
        text full_name
        text avatar_url
        timestamptz created_at
    }
    study_sessions {
        uuid id PK
        uuid user_id FK
        text title
        text description
        integer duration_minutes
        timestamptz started_at
        timestamptz created_at
    }
    tasks {
        uuid id PK
        uuid user_id FK
        uuid session_id FK
        text title
        boolean completed
        timestamptz created_at
        text description
        text status
        text priority
        uuid assignee_id FK
        date due_date
        text category
    }
    staff {
        uuid id PK
        text full_name
        text role
        text email
        text avatar_url
        timestamptz created_at
        text phone
    }
    camper {
        uuid id PK
        text full_name
        integer age
        text medical_notes
        text avatar_url
        timestamptz created_at
        text parent_name
        date birth_date
        text shirt_size
        text parent_phone
        text parent_email
        text critical_medical_info
        text dietary_requirements
        text medications
        text profile_image_url
        text age_group
        text tent
        text group_name
    }
    post {
        uuid id PK
        text content
        text image_url
        uuid user_id FK
        timestamptz created_at
    }
    expense {
        uuid id PK
        text description
        numeric amount
        text category
        text receipt_url
        uuid reporter_id FK
        timestamptz created_at
        date date
        text status
    }
    document {
        uuid id PK
        text file_name
        text file_url
        text file_type
        uuid camper_id FK
        timestamptz created_at
        text content
        text type
        uuid author_id FK
        text title
        text description
        text category
    }
    staff_campers {
        uuid staff_id PK,FK
        uuid camper_id PK,FK
    }
    events {
        uuid id PK
        text event_type
        text severity
        date event_date
        time event_time
        text location
        uuid camper_id FK
        text witnesses
        uuid reporter_id FK
        text description
        text actions_taken
        boolean requires_follow_up
        timestamptz created_at
    }
    camp_settings {
        integer id PK
        numeric total_budget
    }
    parent_inquiries {
        uuid id PK
        uuid camper_id FK
        text parent_name
        text subject
        text message
        text status
        timestamptz created_at
    }
    post_likes {
        uuid id PK
        uuid post_id FK
        uuid staff_id FK
        timestamptz created_at
    }
    post_comments {
        uuid id PK
        uuid post_id FK
        uuid staff_id FK
        text content
        timestamptz created_at
    }
```

**Storage Buckets (Supabase Storage):** `camper_profiles`, `receipts`, `documents`, `avatars`

> ⚠️ הערה לתיעוד: בקוד הנוכחי קיימת חוסר אחידות בשמות טבלאות בין יחיד לרבים (למשל `posts`/`post`, `expenses`/`expense`, `documents`/`document`, `incidents`/`events`). מומלץ לאחד את שמות הטבלאות בבסיס הנתונים לפני ההגשה הסופית כדי שהתרשים יתאר במדויק את הסכמה בפועל.

## 4. רשימת שירותים חיצוניים ואינטגרציות

הטבלה משקפת את **המצב האמיתי בפועל** של הקוד הנוכחי, ולא רשימת שירותים מתוכננת.

| שירות | סוג | למה משמש | סטטוס |
| --- | --- | --- | --- |
| Supabase Auth | אוטנטיקציה | הרשמה/התחברות עם אימייל וסיסמה, ניהול session, הפרדת תפקידים (`staff`/`camper`) דרך `user_metadata` | ✅ מיושם (`src/contexts/AuthContext.tsx`) |
| Supabase PostgreSQL | בסיס נתונים | אחסון כל נתוני האפליקציה — חניכים, צוות, פיד, הוצאות, משימות, תקריות, מסמכים | ✅ מיושם (`src/lib/api.ts`) |
| Supabase Storage | אחסון קבצים | העלאת תמונות פרופיל, קבלות הוצאות, מסמכים ותמונות פרופיל אישיות (Buckets: `camper_profiles`, `receipts`, `documents`, `avatars`) | ✅ מיושם |
| Google OAuth | אוטנטיקציה | התחברות דרך חשבון גוגל | ❌ לא מיושם בקוד הנוכחי |
| OpenAI / שירות AI | קריאת API | יצירת טקסט / ניתוח קלט המשתמש | ❌ לא מיושם בקוד הנוכחי |
| Supabase Edge Function | לוגיקת שרת | קריאות מאובטחות ל-API חיצוני | ❌ לא מיושם בקוד הנוכחי |
| Supabase Realtime | Push בזמן אמת | עדכון פיד בזמן אמת בעת תגובה/לייק/אינסידנט | ❌ לא נמצא שימוש ב-`.channel()` בקוד הנוכחי |
