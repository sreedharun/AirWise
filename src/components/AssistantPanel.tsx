import React, { useState, useMemo } from 'react';
import { UserGroup, AdviceReport } from '../api/types';
import { generateAdvice } from '../utils/adviceEngine';

interface AssistantPanelProps {
  aqi: number;
  userGroup: UserGroup;
  locationName: string;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({ aqi, userGroup, locationName }) => {
  const advice: AdviceReport = useMemo(() => generateAdvice(aqi, userGroup), [aqi, userGroup]);

  // Quick inquiry prompts for the chat assistant
  const QUICK_QUESTIONS = [
    { id: 'run', text: 'Can I exercise outdoors right now?' },
    { id: 'mask', text: 'Should I wear a mask outside?' },
    { id: 'windows', text: 'Can I open my windows for fresh air?' },
    { id: 'purifier', text: 'How should I run my indoor air purifier?' },
    { id: 'summary', text: 'What are the top precautions for my group?' },
  ];

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your AirWise health assistant for ${locationName}. Based on the current US AQI of ${aqi} (${advice.aqiLevel.replace('-', ' ')}), here is your tailored guidance for ${userGroup === 'general' ? 'the general public' : userGroup}: "${advice.headline}". Click any quick inquiry below or explore the recommendations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    },
  ]);

  const handleAskQuestion = (questionText: string, actionCategory?: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: timeNow,
    };

    let reply = '';
    if (actionCategory) {
      const match = advice.actions.find((a) => a.category === actionCategory);
      if (match) {
        reply = `**${match.title}:** ${match.recommendation}`;
      }
    }

    if (!reply) {
      if (
        questionText.toLowerCase().includes('exercise') ||
        questionText.toLowerCase().includes('run')
      ) {
        const act = advice.actions.find((a) => a.category === 'activity');
        reply = act ? `**Exercise Guidance:** ${act.recommendation}` : advice.overview;
      } else if (questionText.toLowerCase().includes('mask')) {
        const mask = advice.actions.find((a) => a.category === 'mask');
        reply = mask ? `**Mask Guidance:** ${mask.recommendation}` : advice.overview;
      } else if (questionText.toLowerCase().includes('window')) {
        const vent = advice.actions.find((a) => a.category === 'ventilation');
        reply = vent ? `**Window & Ventilation:** ${vent.recommendation}` : advice.overview;
      } else if (questionText.toLowerCase().includes('purifier')) {
        const pur = advice.actions.find((a) => a.category === 'purifier');
        reply = pur ? `**Air Purifier Setting:** ${pur.recommendation}` : advice.overview;
      } else {
        reply =
          `**Overview:** ${advice.overview} \n\n**Top Actions:**\n` +
          advice.actions.map((a) => `• ${a.title}: ${a.recommendation}`).join('\n');
      }
    }

    const assistantMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      sender: 'assistant',
      text: reply,
      timestamp: timeNow,
    };

    setChatHistory((prev) => [...prev, userMsg, assistantMsg]);
  };

  const getSeverityBadge = (severity: 'safe' | 'caution' | 'warning' | 'danger') => {
    switch (severity) {
      case 'safe':
        return { label: 'Safe', bg: '#dcfce7', text: '#14532d', icon: '✓' };
      case 'caution':
        return { label: 'Caution', bg: '#fef3c7', text: '#78350f', icon: '!' };
      case 'warning':
        return { label: 'Warning', bg: '#fed7aa', text: '#7c2d12', icon: '⚠️' };
      case 'danger':
        return { label: 'High Risk', bg: '#fee2e2', text: '#7f1d1d', icon: '⛔' };
    }
  };

  return (
    <section className="assistant-card card" aria-labelledby="assistant-heading">
      <div className="assistant-header">
        <div className="assistant-badge-title">
          <span className="bot-avatar" aria-hidden="true">
            🤖
          </span>
          <div>
            <h2 id="assistant-heading" className="assistant-title">
              AirWise Health Advisor
            </h2>
            <span className="offline-ready-tag">100% Offline Capable & Deterministic</span>
          </div>
        </div>
      </div>

      {/* Primary Headline & Overview */}
      <div className="advice-headline-box">
        <h3 className="headline-text">{advice.headline}</h3>
        <p className="overview-text">{advice.overview}</p>
      </div>

      {/* Action Cards Grid: Activity, Mask, Ventilation, Purifier, Special */}
      <div className="action-cards-grid" role="region" aria-label="Targeted Advice Actions">
        {advice.actions.map((action) => {
          const badge = getSeverityBadge(action.severity);
          return (
            <div key={action.id} className="action-card">
              <div className="action-card-top">
                <span className="action-icon" aria-hidden="true">
                  {action.icon}
                </span>
                <span
                  className="action-severity-pill"
                  style={{ backgroundColor: badge.bg, color: badge.text }}
                >
                  <span aria-hidden="true">{badge.icon}</span> {badge.label}
                </span>
              </div>
              <h4 className="action-title">{action.title}</h4>
              <p className="action-text">{action.recommendation}</p>
            </div>
          );
        })}
      </div>

      {/* Do's and Don'ts Checklist */}
      <div className="dos-donts-container">
        <div className="dos-box">
          <h4 className="dos-title">
            <span aria-hidden="true">✅</span> Recommended (Do)
          </h4>
          <ul className="checklist">
            {advice.dos.map((item, idx) => (
              <li key={`do-${idx}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="donts-box">
          <h4 className="donts-title">
            <span aria-hidden="true">🚫</span> Avoid (Don't)
          </h4>
          <ul className="checklist">
            {advice.donts.map((item, idx) => (
              <li key={`dont-${idx}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Chat Inquiries */}
      <div className="chat-layout-wrapper">
        <h3 className="chat-section-title">
          <span>Ask AirWise Assistant</span>
          <span className="chat-subtitle">Instant deterministic answers for {locationName}</span>
        </h3>

        {/* Conversation stream */}
        <div className="chat-stream" role="log" aria-live="polite" aria-atomic="false">
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
              <div className={`chat-bubble ${msg.sender}`}>
                <div className="bubble-header">
                  <span className="bubble-author">
                    {msg.sender === 'assistant' ? 'AirWise' : 'You'}
                  </span>
                  <span className="bubble-time">{msg.timestamp}</span>
                </div>
                <div className="bubble-body">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick prompt buttons */}
        <div className="quick-inquiries-group" role="group" aria-label="Common inquiry questions">
          <span className="quick-inquiries-label">Frequently Asked:</span>
          <div className="quick-buttons-row">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                className="quick-inquiry-btn"
                onClick={() => handleAskQuestion(q.text)}
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
