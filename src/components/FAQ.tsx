import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "איך אני מוריד סרטון מיוטיוב?",
      answer: "פשוט הדבק את קישור היוטיוב בשדה הייעודי ולחץ על 'טען וידאו'. המערכת תוריד את הסרטון אוטומטית ותאפשר לך לערוך אותו בקלות."
    },
    {
      question: "אילו פורמטים נתמכים להורדה?",
      answer: "תומכים בכל פורמטי הוידאו והאודיו הנפוצים: MP4, AVI, MOV, WMV לוידאו, ו-MP3, AAC, WAV, FLAC לאודיו. ניתן גם לחלץ אודיו מוידאו."
    },
    {
      question: "איך אני חותך סגמנט מסרטון?",
      answer: "בחר את זמני ההתחלה והסיום בעזרת הסליידרים, שנה את שם הסגמנט לפי הצורך, ולחץ על 'הוסף סגמנט'. תוכל ליצור מספר סגמנטים ולארגן אותם בגרירה."
    },
    {
      question: "האם אפשר למזג כמה סגמנטים לסרטון אחד?",
      answer: "בהחלט! לאחר יצירת הסגמנטים, סדר אותם בסדר הרצוי וגרור אותם למקום שתרצה. לחץ על 'מזג סגמנטים' ליצירת סרטון אחד משולב."
    },
    {
      question: "איך זיהוי השירים עובד?",
      answer: "לאחר חיתוך סגמנט שמכיל מוזיקה, לחץ על כפתור 'זיהוי'. המערכת תשתמש בטכנולוגיית זיהוי מתקדמת כדי לזהות את שם השיר והאמן."
    },
    {
      question: "איך אני משנה איכות וידאו?",
      answer: "בהגדרות הפרויקט תוכל לבחור ברזולוציה הרצויה: 360p, 480p, 720p או 1080p. זה חשוב במיוחד אם אתה רוצה להקטין את גודל הקובץ או לשפר איכות."
    },
    {
      question: "מה זה Fade In ו-Fade Out?",
      answer: "אלה אפקטים שמאפשרים הדרגה חלקה של הקול - Fade In מעלה את הווליום בהדרגה בתחילת הסגמנט, ו-Fade Out מוריד אותו בהדרגה בסוף."
    },
    {
      question: "האם אפשר להסיר קול של זמר ולהשאיר רק מוזיקת רקע?",
      answer: "כן! בחר את הסגמנט ולחץ על 'הסר ווקאל'. המערכת תשתמש בטכנולוגיה מתקדמת להפרדת קול ומוזיקה, ותשאיר רק את המוזיקת רקע."
    },
    {
      question: "האם העריכה מתבצעת באופן מקומי במחשב שלי?",
      answer: "כן! כל העריכה מתבצעת בדפדפן שלך באמצעות טכנולוגיית FFmpeg. הקבצים שלך לא עוברים לשרת חיצוני, מה שמבטיח פרטיות מלאה."
    },
    {
      question: "איך אני שומר את הפרויקט שלי?",
      answer: "כל הסגמנטים והעריכות נשמרים באופן אוטומטי. תוכל לתת שם לפרויקט, ולהוריד את הסגמנטים בנפרד או למזג אותם לקובץ אחד."
    }
  ];

  return (
    <div className="w-full py-16 px-4 bg-gradient-to-br from-background via-background to-background/80">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10 text-primary" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              שאלות נפוצות
            </h2>
          </div>
          <p className="text-muted-foreground text-lg">
            מצא תשובות לשאלות הנפוצות ביותר על YouTube Cutter Pro
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-secondary/20 rounded-lg px-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <AccordionTrigger className="text-right hover:no-underline py-5">
                <span className="text-lg font-semibold text-foreground pr-2">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-right text-muted-foreground leading-relaxed pt-2 pb-5 text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-secondary/20">
          <h3 className="text-xl font-semibold mb-2">יש לך שאלה נוספת?</h3>
          <p className="text-muted-foreground mb-4">
            צור איתנו קשר ואנחנו נשמח לעזור!
          </p>
          <a
            href="mailto:ncohenavi@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            שלח אימייל
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
