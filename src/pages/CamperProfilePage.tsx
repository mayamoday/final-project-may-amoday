import { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';

export default function CamperProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'פרטים אישיים', icon: 'person' },
    { id: 'medical', label: 'מידע רפואי', icon: 'health_and_safety' },
    { id: 'docs', label: 'מסמכים', icon: 'description' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Profile Header */}
      <Card variant="glass" className="rounded-lg p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-summer-sky to-vibrant-pink opacity-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-32 h-32 rounded-lg border-4 border-white shadow-soft overflow-hidden -mt-12 bg-white">
            <img src="https://i.pravatar.cc/150?u=noam" alt="Camper" className="w-full h-full object-cover" />
          </div>

          <div className="text-center md:text-right flex-1">
            <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3 mb-2">
              <h1 className="text-h1-display text-deep-slate">נועם ישראלי</h1>
              <Badge variant="success" className="uppercase tracking-wider">Checked-in</Badge>
            </div>
            <p className="text-body-medium text-slate-500 font-medium">חניך • שכבה צעירה • אוהל 4 • קבוצת "אריות"</p>
          </div>

          <div className="flex gap-3">
            <button className="p-4 rounded-md bg-slate-100 text-slate-500 hover:bg-summer-sky hover:text-white transition-all shadow-sm">
              <Icon name="call" className="text-2xl" />
            </button>
            <button className="p-4 rounded-md bg-slate-100 text-slate-500 hover:bg-summer-sky hover:text-white transition-all shadow-sm">
              <Icon name="chat" className="text-2xl" />
            </button>
            <Button>עריכת פרופיל</Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface-container-low rounded-md mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-md font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-deep-slate shadow-soft'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon name={tab.icon} className="text-xl" fill={activeTab === tab.id} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="glass" className="p-6 rounded-lg">
              <h3 className="text-h2-section mb-4 text-deep-slate">פרטי קשר הורים</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <span className="text-caption-bold text-slate-400">שם האב:</span>
                  <span className="font-bold">דוד ישראלי</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <span className="text-caption-bold text-slate-400">טלפון:</span>
                  <span className="font-bold" dir="ltr">054-1234567</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <span className="text-caption-bold text-slate-400">אימייל:</span>
                  <span className="font-bold">david@example.com</span>
                </div>
              </div>
            </Card>
            <Card variant="glass" className="p-6 rounded-lg">
              <h3 className="text-h2-section mb-4 text-deep-slate">פרטים לוגיסטיים</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <span className="text-caption-bold text-slate-400">תאריך לידה:</span>
                  <span className="font-bold">12/05/2012 (בן 12)</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <span className="text-caption-bold text-slate-400">מידת חולצה:</span>
                  <span className="font-bold">M</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <span className="text-caption-bold text-slate-400">אוטובוס חזור:</span>
                  <span className="font-bold">קו 402 - ת"א</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-6">
            <div className="bg-red-50 border-2 border-red-100 p-6 rounded-lg flex items-start gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-md">
                <Icon name="warning" fill className="text-2xl" />
              </div>
              <div className="text-right">
                <h3 className="text-h2-section text-red-700 mb-1">מידע קריטי - אלרגיות</h3>
                <p className="text-red-600 font-bold text-xl">אלרגיה חריפה לבוטנים (אפיפן בתיק)</p>
              </div>
            </div>

            <Card variant="glass" className="p-6 rounded-lg">
              <h3 className="text-h2-section mb-4 text-deep-slate">הערות רפואיות ודיאטה</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-slate-50">
                  <p className="text-caption-bold text-slate-400 mb-1">דיאטה מיוחדת:</p>
                  <p className="font-bold">צמחוני, ללא גלוטן</p>
                </div>
                <div className="p-4 rounded-md bg-slate-50">
                  <p className="text-caption-bold text-slate-400 mb-1">תרופות קבועות:</p>
                  <p className="font-bold">ריטלין (10mg) כל בוקר אחרי ארוחת בוקר</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'docs' && (
          <Card variant="glass" className="p-6 rounded-lg">
            <h3 className="text-h2-section mb-4 text-deep-slate">מסמכים שהועלו</h3>
            <div className="space-y-3">
              {[
                { name: 'אישור רפואי חתום.pdf', size: '1.2 MB', date: '01/05/2024' },
                { name: 'צילום דרכון.jpg', size: '2.4 MB', date: '28/04/2024' },
                { name: 'פוליסת ביטוח.pdf', size: '0.8 MB', date: '15/04/2024' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-md text-slate-400 group-hover:text-summer-sky transition-colors">
                      <Icon name="description" className="text-xl" />
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{doc.name}</p>
                      <p className="text-caption-bold text-slate-400">{doc.size} • הועלה ב-{doc.date}</p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-summer-sky">
                    <Icon name="download" className="text-xl" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
