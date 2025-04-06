import React from 'react';

export default function DocumentationContent({ language = 'en' }) {
  const content = language === 'he' ? hebrewContent : englishContent;
  
  return (
    <div className="space-y-6">
      {content.map((section, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-white">{section.title}</h2>
          {section.content.map((paragraph, pIndex) => (
            <div key={pIndex} className="mb-4">
              {paragraph.heading && (
                <h3 className="text-lg font-semibold mb-2 text-white">{paragraph.heading}</h3>
              )}
              <p className="text-gray-300">{paragraph.text}</p>
              
              {paragraph.steps && (
                <ol className="list-decimal pl-5 mt-2 space-y-2">
                  {paragraph.steps.map((step, sIndex) => (
                    <li key={sIndex} className="text-gray-300">{step}</li>
                  ))}
                </ol>
              )}
              
              {paragraph.bullets && (
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  {paragraph.bullets.map((bullet, bIndex) => (
                    <li key={bIndex} className="text-gray-300">{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const englishContent = [
  {
    title: "Getting Started",
    content: [
      {
        heading: "Welcome to Budget Master",
        text: "Budget Master is a comprehensive personal finance management application designed to help you track expenses, monitor accounts, and achieve financial goals."
      },
      {
        heading: "Initial Setup",
        text: "Before you begin tracking your finances, set up your basic information:",
        steps: [
          "Go to 'Settings' and set your preferred language and currency",
          "Create bank accounts under the 'Bank Accounts' section",
          "Add your credit cards under the 'Credit Cards' section",
          "Create relevant expense and income categories in 'Settings > Categories'"
        ]
      }
    ]
  },
  {
    title: "Managing Accounts",
    content: [
      {
        heading: "Bank Accounts",
        text: "Track all your bank accounts in one place:",
        steps: [
          "Navigate to 'Bank Accounts' from the sidebar",
          "Click 'Add Bank Account' and fill in the required information",
          "You can add multiple accounts with different currencies",
          "Each account will show the current balance and transaction history"
        ]
      },
      {
        heading: "Credit Cards",
        text: "Link credit cards to your bank accounts:",
        steps: [
          "Navigate to 'Credit Cards' from the sidebar",
          "Click 'Add Credit Card' and select the linked bank account",
          "Enter card details including spending limit and billing day",
          "Track expenses and monitor your credit usage"
        ]
      }
    ]
  },
  {
    title: "Tracking Transactions",
    content: [
      {
        heading: "Recording Expenses and Income",
        text: "Keep track of all your financial movements:",
        steps: [
          "Go to 'Transactions' and click 'Add Transaction'",
          "Select the transaction type (income or expense)",
          "Choose the account or credit card for the transaction",
          "Assign a category and subcategory for better reporting",
          "Enter the amount, date, and description"
        ]
      },
      {
        heading: "Recurring Transactions",
        text: "Automate tracking of regular payments or income:",
        steps: [
          "Navigate to 'Recurring Transactions'",
          "Click 'Add Recurring Transaction'",
          "Set up the frequency, amount, and category",
          "The system will remind you when these transactions are due"
        ]
      },
      {
        heading: "Business Transactions",
        text: "For business owners, separate business and personal expenses:",
        steps: [
          "Mark transactions as business-related by checking the 'Is Business' option",
          "Assign business categories and client information when applicable",
          "View business-specific reports in the 'Business' section"
        ]
      }
    ]
  },
  {
    title: "Financial Planning",
    content: [
      {
        heading: "Setting Financial Goals",
        text: "Define and track progress towards your financial objectives:",
        steps: [
          "Go to the 'Goals' section and click 'Add Goal'",
          "Name your goal and set a target amount and date",
          "Define monthly contributions to stay on track",
          "Monitor your progress in real-time"
        ]
      },
      {
        heading: "Emergency Fund",
        text: "Build a safety net for unexpected expenses:",
        steps: [
          "Navigate to 'Emergency Fund' and set up your target amount",
          "Track contributions to and withdrawals from your emergency fund",
          "Monitor your financial resilience score"
        ]
      }
    ]
  },
  {
    title: "Investments and Loans",
    content: [
      {
        heading: "Investment Tracking",
        text: "Monitor the performance of your investments:",
        steps: [
          "Go to 'Investments' and click 'Add Investment'",
          "Enter details including investment type, amount, and start date",
          "Update current values periodically to track growth",
          "View performance metrics and return rates"
        ]
      },
      {
        heading: "Loan Management",
        text: "Keep track of loans and debt repayment:",
        steps: [
          "Navigate to 'Loans' and click 'Add Loan'",
          "Enter loan details including interest rate, start date, and payment amount",
          "Track payments and monitor remaining balance",
          "View amortization schedules for each loan"
        ]
      }
    ]
  },
  {
    title: "Reporting and Analysis",
    content: [
      {
        heading: "Dashboard Overview",
        text: "Get a quick snapshot of your financial situation:",
        bullets: [
          "Total balance across all accounts",
          "Monthly income and expenses",
          "Investment performance",
          "Recent transactions"
        ]
      },
      {
        heading: "Detailed Reports",
        text: "Generate insights from your financial data:",
        steps: [
          "Go to 'Reports' to access various financial reports",
          "View spending by category, month, or account",
          "Analyze trends and patterns in your financial behavior",
          "Export reports for tax purposes or financial planning"
        ]
      },
      {
        heading: "Net Worth Tracking",
        text: "Monitor your overall financial health:",
        steps: [
          "Navigate to 'Net Worth' to see your assets minus liabilities",
          "Track changes in your net worth over time",
          "Add assets and debts for a complete financial picture"
        ]
      }
    ]
  },
  {
    title: "Business Features",
    content: [
      {
        heading: "Business Management",
        text: "For entrepreneurs and small business owners:",
        steps: [
          "Set up business profiles in the 'Business' section",
          "Track business income and expenses separately",
          "Manage clients, projects, and invoices",
          "Generate business-specific reports and tax information"
        ]
      }
    ]
  },
  {
    title: "System Settings",
    content: [
      {
        heading: "Customization",
        text: "Personalize Budget Master to fit your needs:",
        bullets: [
          "Change language, theme, and currency in Settings",
          "Customize categories and subcategories",
          "Arrange sidebar items in your preferred order",
          "Set your default account for the dashboard"
        ]
      },
      {
        heading: "Data Management",
        text: "Protect and manage your financial data:",
        steps: [
          "Create regular backups of your data",
          "Import data from external sources",
          "Reset your data if needed"
        ]
      }
    ]
  }
];

const hebrewContent = [
  {
    title: "התחלה",
    content: [
      {
        heading: "ברוכים הבאים לניהול תקציב",
        text: "ניהול תקציב הוא יישום מקיף לניהול פיננסי אישי שנועד לעזור לך לעקוב אחר הוצאות, לפקח על חשבונות ולהשיג יעדים פיננסיים."
      },
      {
        heading: "הגדרה ראשונית",
        text: "לפני שתתחיל לעקוב אחר הפיננסים שלך, הגדר את המידע הבסיסי שלך:",
        steps: [
          "עבור ל'הגדרות' וקבע את השפה והמטבע המועדפים עליך",
          "צור חשבונות בנק תחת 'חשבונות בנק'",
          "הוסף את כרטיסי האשראי שלך תחת 'כרטיסי אשראי'",
          "צור קטגוריות הוצאות והכנסות רלוונטיות ב'הגדרות > קטגוריות'"
        ]
      }
    ]
  },
  {
    title: "ניהול חשבונות",
    content: [
      {
        heading: "חשבונות בנק",
        text: "עקוב אחר כל חשבונות הבנק שלך במקום אחד:",
        steps: [
          "נווט אל 'חשבונות בנק' מסרגל הצד",
          "לחץ על 'הוסף חשבון בנק' ומלא את המידע הנדרש",
          "ניתן להוסיף חשבונות מרובים במטבעות שונים",
          "כל חשבון יציג את היתרה הנוכחית והיסטוריית העסקאות"
        ]
      },
      {
        heading: "כרטיסי אשראי",
        text: "קשר כרטיסי אשראי לחשבונות הבנק שלך:",
        steps: [
          "נווט אל 'כרטיסי אשראי' מסרגל הצד",
          "לחץ על 'הוסף כרטיס אשראי' ובחר את חשבון הבנק המקושר",
          "הזן פרטי כרטיס כולל מגבלת הוצאות ויום חיוב",
          "עקוב אחר הוצאות ופקח על השימוש באשראי שלך"
        ]
      }
    ]
  },
  {
    title: "מעקב אחר עסקאות",
    content: [
      {
        heading: "רישום הוצאות והכנסות",
        text: "עקוב אחר כל התנועות הפיננסיות שלך:",
        steps: [
          "עבור ל'עסקאות' ולחץ על 'הוסף עסקה'",
          "בחר את סוג העסקה (הכנסה או הוצאה)",
          "בחר את החשבון או כרטיס האשראי עבור העסקה",
          "הקצה קטגוריה ותת-קטגוריה לדיווח טוב יותר",
          "הזן את הסכום, התאריך והתיאור"
        ]
      },
      {
        heading: "עסקאות חוזרות",
        text: "אוטומציה של מעקב אחר תשלומים או הכנסות קבועים:",
        steps: [
          "נווט אל 'עסקאות חוזרות'",
          "לחץ על 'הוסף עסקה חוזרת'",
          "הגדר את התדירות, הסכום והקטגוריה",
          "המערכת תזכיר לך מתי עסקאות אלה צפויות"
        ]
      },
      {
        heading: "עסקאות עסקיות",
        text: "לבעלי עסקים, הפרד בין הוצאות עסקיות ואישיות:",
        steps: [
          "סמן עסקאות כעסקיות על ידי סימון האפשרות 'עסקי'",
          "הקצה קטגוריות עסקיות ומידע לקוח כאשר רלוונטי",
          "צפה בדוחות ספציפיים לעסק בחלק 'עסקים'"
        ]
      }
    ]
  },
  {
    title: "תכנון פיננסי",
    content: [
      {
        heading: "הגדרת יעדים פיננסיים",
        text: "הגדר ועקוב אחר ההתקדמות לקראת היעדים הפיננסיים שלך:",
        steps: [
          "עבור לחלק 'יעדים' ולחץ על 'הוסף יעד'",
          "תן שם ליעד שלך וקבע סכום יעד ותאריך",
          "הגדר תרומות חודשיות כדי להישאר במסלול",
          "עקוב אחר ההתקדמות שלך בזמן אמת"
        ]
      },
      {
        heading: "קרן חירום",
        text: "בנה רשת ביטחון להוצאות בלתי צפויות:",
        steps: [
          "נווט אל 'קרן חירום' והגדר את סכום היעד שלך",
          "עקוב אחר הפקדות ומשיכות מקרן החירום שלך",
          "פקח על ציון החוסן הפיננסי שלך"
        ]
      }
    ]
  },
  {
    title: "השקעות והלוואות",
    content: [
      {
        heading: "מעקב אחר השקעות",
        text: "פקח על הביצועים של ההשקעות שלך:",
        steps: [
          "עבור ל'השקעות' ולחץ על 'הוסף השקעה'",
          "הזן פרטים כולל סוג השקעה, סכום ותאריך התחלה",
          "עדכן ערכים נוכחיים מעת לעת כדי לעקוב אחר הצמיחה",
          "צפה במדדי ביצועים ושיעורי תשואה"
        ]
      },
      {
        heading: "ניהול הלוואות",
        text: "עקוב אחר הלוואות והחזרי חובות:",
        steps: [
          "נווט אל 'הלוואות' ולחץ על 'הוסף הלוואה'",
          "הזן פרטי הלוואה כולל שיעור ריבית, תאריך התחלה וסכום תשלום",
          "עקוב אחר תשלומים ופקח על היתרה הנותרת",
          "צפה בלוחות סילוקין לכל הלוואה"
        ]
      }
    ]
  },
  {
    title: "דיווח וניתוח",
    content: [
      {
        heading: "סקירת לוח המחוונים",
        text: "קבל תמונה מהירה של מצבך הפיננסי:",
        bullets: [
          "יתרה כוללת בכל החשבונות",
          "הכנסות והוצאות חודשיות",
          "ביצועי השקעות",
          "עסקאות אחרונות"
        ]
      },
      {
        heading: "דוחות מפורטים",
        text: "הפק תובנות מהנתונים הפיננסיים שלך:",
        steps: [
          "עבור ל'דוחות' כדי לגשת לדוחות פיננסיים שונים",
          "צפה בהוצאות לפי קטגוריה, חודש או חשבון",
          "נתח מגמות ודפוסים בהתנהגות הפיננסית שלך",
          "ייצא דוחות למטרות מס או תכנון פיננסי"
        ]
      },
      {
        heading: "מעקב אחר ההון הנקי",
        text: "פקח על בריאותך הפיננסית הכוללת:",
        steps: [
          "נווט אל 'הון נקי' כדי לראות את הנכסים שלך פחות התחייבויות",
          "עקוב אחר שינויים בהון הנקי שלך לאורך זמן",
          "הוסף נכסים וחובות לתמונה פיננסית מלאה"
        ]
      }
    ]
  },
  {
    title: "תכונות עסקיות",
    content: [
      {
        heading: "ניהול עסקי",
        text: "ליזמים ובעלי עסקים קטנים:",
        steps: [
          "הגדר פרופילים עסקיים בחלק 'עסקים'",
          "עקוב אחר הכנסות והוצאות עסקיות בנפרד",
          "נהל לקוחות, פרויקטים וחשבוניות",
          "הפק דוחות ייעודיים לעסק ומידע מס"
        ]
      }
    ]
  },
  {
    title: "הגדרות מערכת",
    content: [
      {
        heading: "התאמה אישית",
        text: "התאם אישית את ניהול התקציב לצרכים שלך:",
        bullets: [
          "שנה שפה, ערכת נושא ומטבע בהגדרות",
          "התאם אישית קטגוריות ותת-קטגוריות",
          "סדר פריטי סרגל צד בסדר המועדף עליך",
          "הגדר את חשבון ברירת המחדל שלך ללוח המחוונים"
        ]
      },
      {
        heading: "ניהול נתונים",
        text: "הגן ונהל את הנתונים הפיננסיים שלך:",
        steps: [
          "צור גיבויים קבועים של הנתונים שלך",
          "ייבא נתונים ממקורות חיצוניים",
          "אפס את הנתונים שלך במידת הצורך"
        ]
      }
    ]
  }
];