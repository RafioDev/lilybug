import React, { useState, useEffect } from 'react';
import { Wind, Heart, Volume2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const CalmPage: React.FC = () => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!isBreathing) {
      setScale(1);
      return;
    }

    const inhaleTime = 4000;
    const holdTime = 4000;
    const exhaleTime = 6000;
    const totalCycle = inhaleTime + holdTime + exhaleTime;

    const animateBreath = () => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = (Date.now() - startTime) % totalCycle;

        if (elapsed < inhaleTime) {
          setBreathPhase('inhale');
          setScale(1 + (elapsed / inhaleTime) * 0.5);
        } else if (elapsed < inhaleTime + holdTime) {
          setBreathPhase('hold');
          setScale(1.5);
        } else {
          setBreathPhase('exhale');
          const exhaleProgress = (elapsed - inhaleTime - holdTime) / exhaleTime;
          setScale(1.5 - exhaleProgress * 0.5);
        }

        if (isBreathing) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    };

    animateBreath();
  }, [isBreathing]);

  const calmingMessages = [
    "You're doing an amazing job.",
    "This moment will pass. You've got this.",
    "It's okay to feel overwhelmed. You're not alone.",
    "Take it one breath at a time.",
    "Your baby is lucky to have you.",
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  const getPhaseText = () => {
    if (breathPhase === 'inhale') return 'Breathe In';
    if (breathPhase === 'hold') return 'Hold';
    return 'Breathe Out';
  };

  return (
    <Layout title="Calm Kit">
      <div className="space-y-5">
        <Card className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
          <div className="flex items-center gap-3">
            <Wind size={32} className="flex-shrink-0" />
            <div>
              <p className="text-lg font-semibold">You're Not Alone</p>
              <p className="text-sm opacity-90">Take a moment for yourself</p>
            </div>
          </div>
        </Card>

        <Card className="min-h-[320px] flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-blue-50 to-teal-50">
          <div className="text-center space-y-6 z-10">
            {!isBreathing ? (
              <>
                <div className="p-6 bg-white rounded-full shadow-lg">
                  <Wind size={48} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Breathing Exercise</h2>
                  <p className="text-gray-600 mb-4">A 1-minute calming breath to center yourself</p>
                  <Button onClick={() => setIsBreathing(true)} size="lg">
                    Start Breathing
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 shadow-2xl flex items-center justify-center transition-transform duration-1000 ease-in-out"
                  style={{ transform: `scale(${scale})` }}
                >
                  <Heart size={64} className="text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-800 mb-2">{getPhaseText()}</p>
                  <p className="text-gray-600">Follow the circle's rhythm</p>
                </div>
                <Button onClick={() => setIsBreathing(false)} variant="outline">
                  Stop
                </Button>
              </>
            )}
          </div>
        </Card>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 px-1">
            Reminders for Hard Moments
          </h3>
          <div className="space-y-3">
            {calmingMessages.map((message, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${
                  currentMessage === index ? 'border-teal-500 bg-teal-50' : ''
                }`}
                onClick={() => setCurrentMessage(index)}
              >
                <p className="text-gray-700 leading-relaxed">{message}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-gradient-to-r from-blue-500 to-teal-500 text-white border-0">
          <div className="flex items-start gap-3">
            <Volume2 size={24} className="flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold mb-1">White Noise</p>
              <p className="text-sm opacity-90 mb-3">
                Coming soon: soothing sounds to help you and baby relax
              </p>
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                Feature in development
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-rose-50 border-rose-200">
          <h4 className="font-semibold text-rose-900 mb-2">If you're in crisis</h4>
          <p className="text-sm text-rose-800 mb-3">
            Postpartum depression and anxiety are real. You deserve support.
          </p>
          <p className="text-sm text-rose-800">
            <strong>Postpartum Support International:</strong> 1-800-944-4773
          </p>
          <p className="text-xs text-rose-700 mt-2">
            Available in English and Spanish
          </p>
        </Card>
      </div>
    </Layout>
  );
};
