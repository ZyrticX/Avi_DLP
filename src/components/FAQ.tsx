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
      question: "האם העיבוד מתבצע בענן או במחשב שלי?",
      answer: "העיבוד מתבצע בשרתי הענן המאובטחים שלנו, ללא צורך בהתקנות מקומיות. הקבצים מעובדים לצורך הפעולה בלבד, ולאחר מכן נמחקים בהתאם למדיניות." 
    },
    {
      question: "מה כוללת גרסת הפרימיום?",
      answer: "פרימיום מעניקה מהירויות עיבוד גבוהות, עדיפות בתורים, אורך וידאו ארוך יותר, הורדות באיכות גבוהה (עד 1080p/4K כשזמין), דיבוב אוטומטי לריבוי שפות, תרגום ויצוא כתוביות, עיבוד באצווה וזיהוי מתקדם." 
    },
    {
      question: "למה כדאי לשדרג לפרימיום?",
      answer: "כדי לחסוך זמן וכסף בעבודה שוטפת: פחות המתנות, פחות הגבלות, יכולות דיבוב ותרגום מתקדמות, ותהליכי עבודה אוטומטיים שמתאימים ליוצרים, לעורכים ולצוותים מקצועיים." 
    },
    {
      question: "האם אפשר להוריד סרט ולדבב אותו לשפה שלי?",
      answer: "בהחלט. המערכת יודעת להפיק פסקול מדובב בעזרת AI במספר שפות, תוך שמירה על תזמונים, כדי שתוכלו לצפות בתוכן בשפה שלכם." 
    },
    {
      question: "האם אפשר להוריד סרט עם כתוביות מובנות או להוסיף כתוביות מתורגמות?",
      answer: "כן. נזהה כתוביות קיימות וניתן להוריד עם או בלי כתוביות. בנוסף ניתן ליצור כתוביות מתורגמות לשפה שלכם ולצרוב אותן לקובץ או לייצא כקובץ כתוביות נפרד." 
    },
    {
      question: "האם אפשר להוריד ולחבר מספר מקטעים מסרט או ממקור סטרימינג?",
      answer: "כן. תוכלו לבחור נקודות התחלה וסיום למספר סגמנטים, להוריד אותם בנפרד או למזג לקובץ אחד. זה חוסך המון זמן וכסף בעבודות חיתוך וניהול תוכן." 
    },
    {
      question: "איך הזיהוי של תכנים/שירים עובד?",
      answer: "הזיהוי מתבצע בשרת בעזרת טכנולוגיות AI מתקדמות, שמאתרות שירים, דיבור וקטעי מוזיקה ומציגות פרטי מטא-דאטה רלוונטיים כשזמין." 
    },
    {
      question: "אילו פורמטים נתמכים להורדה?",
      answer: "תומכים בפורמטי וידאו ואודיו נפוצים: MP4, AVI, MOV, WMV לוידאו, ו‑MP3, AAC, WAV, FLAC לאודיו. ניתן גם לחלץ אודיו מתוך וידאו." 
    },
    {
      question: "איך אני משנה איכות וידאו?",
      answer: "בהגדרות הפרויקט ניתן לבחור רזולוציה: 360p, 480p, 720p, 1080p (וכאשר זמין גם 4K). כך אפשר להקטין גודל קובץ או לשפר איכות לפי הצורך." 
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
          <p className="text-muted-foreground mb-2">
            צור איתנו קשר ואנחנו נשמח לעזור!
          </p>
          <p className="text-muted-foreground mb-4">נשמח להצעות ייעול ובקשות לתוספות.</p>
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
