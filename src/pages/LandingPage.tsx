import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Card from '../components/Card';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-summer-sky/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-vibrant-pink/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

      <div className="max-w-4xl w-full text-center relative z-10">
        <div className="mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-summer-sky to-vibrant-pink rounded-lg mx-auto mb-6 flex items-center justify-center text-white shadow-soft">
            <span className="text-3xl font-black">MC</span>
          </div>
          <h1 className="text-h1-display text-deep-slate mb-4 tracking-tight">My Camp</h1>
          <p className="text-body-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
            הבית הדיגיטלי של משלחות הקיץ. מחברים בין צוות המחנה, המפקדה וההורים ברגע אחד.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card
            variant="glass"
            className="p-10 rounded-lg group hover:border-summer-sky transition-all duration-300 text-right flex flex-col items-start cursor-pointer"
            onClick={() => navigate('/feed')}
          >
            <div className="w-14 h-14 rounded-md bg-summer-sky/10 text-summer-sky flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Icon name="groups" className="text-4xl" />
            </div>
            <h2 className="text-h2-section text-deep-slate mb-2">כניסת הורים</h2>
            <p className="text-body-medium text-slate-400 mb-6">צפו בעדכונים מהשטח, תמונות של הילדים והודעות חשובות.</p>
            <div className="flex items-center gap-2 text-summer-sky font-bold group-hover:gap-4 transition-all">
              <span>התחברות</span>
              <Icon name="arrow_back" className="text-xl" />
            </div>
          </Card>

          <Card
            variant="glass"
            className="p-10 rounded-lg group hover:border-vibrant-pink transition-all duration-300 text-right flex flex-col items-start cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-14 h-14 rounded-md bg-vibrant-pink/10 text-vibrant-pink flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Icon name="admin_panel_settings" className="text-4xl" />
            </div>
            <h2 className="text-h2-section text-deep-slate mb-2">כניסת צוות וסגל</h2>
            <p className="text-body-medium text-slate-400 mb-6">ניהול תקציב, דיווחי בטיחות, יומן פעילות ועדכונים שוטפים.</p>
            <div className="flex items-center gap-2 text-vibrant-pink font-bold group-hover:gap-4 transition-all">
              <span>כניסת מערכת</span>
              <Icon name="arrow_back" className="text-xl" />
            </div>
          </Card>
        </div>

        <p className="text-caption-bold text-slate-400">
          פיתוח ע״י צוות הדיגיטל של הסוכנות היהודית • קיץ 2024
        </p>
      </div>
    </div>
  );
}
