"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Check, AlertCircle, TrendingUp, Users, Shield, Target, Mail, Building, ArrowRight, Download, Clock, Brain, Zap, Sparkles, Heart, Leaf } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import PDFReport from './PDFReport';
import BenchmarkAnalytics from './BenchmarkAnalytics';
import { BenchmarkService } from '../services/benchmarkService';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Theme configuration
const THEMES = {
  levelai: {
    name: 'Level AI',
    tagline: 'Reclaim your time with AI that actually helps',
    logo: '/images/Level AI Avatar_Circular.png',
    colors: {
      primary: '#FEDA00',
      primaryHover: '#E5C400',
      primaryLight: 'bg-primary-50',
      primaryLightText: 'text-neutral-500',
      primaryLightBorder: 'border-primary-200',
      accent: '#296B42',
      gradient: 'from-primary-400 to-primary-500',
      bgGradient: 'from-surface-400 to-surface-300'
    },
    messaging: {
      heroTitle: 'How AI-Ready Are You?',
      heroSubtitle: 'Let\'s find out how much time AI could give back to your team',
      completionTitle: 'Nice work! 🎉',
      completionText: 'Get your personalised roadmap for reclaiming time with AI that actually works.',
      reportTitle: 'Your Time-Reclaiming AI Roadmap',
      ctaButton: 'Let\'s Chat About Your AI Journey',
      timeUnit: 'hours back to your team each month',
      certification: 'Level AI Partner'
    },
    sections: {
      'current-state': { icon: <Sparkles className="w-5 h-5" />, title: 'Where You\'re At Today' },
      'readiness': { icon: <TrendingUp className="w-5 h-5" />, title: 'Ready for Takeoff?' },
      'ethics': { icon: <Shield className="w-5 h-5" />, title: 'Playing It Safe' },
      'future': { icon: <Target className="w-5 h-5" />, title: 'Dream Big' }
    }
  },
  tech4good: {
    name: 'Tech4Good South West',
    tagline: 'Technology for positive social impact',
    logo: '💚',
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      primaryLight: 'bg-green-50',
      primaryLightText: 'text-neutral-500',
      primaryLightBorder: 'border-green-200',
      accent: '#0891b2',
      gradient: 'from-green-500 to-cyan-500',
      bgGradient: 'from-green-50 to-cyan-50'
    },
    messaging: {
      heroTitle: 'Tech for Good Readiness Check',
      heroSubtitle: 'See how technology can amplify your social impact',
      completionTitle: 'Nice work!',
      completionText: 'Get your personalised report on using tech for good.',
      reportTitle: 'Your Tech for Good Report',
      ctaButton: 'Join Our Community',
      timeUnit: 'hours for your mission',
      certification: 'Tech4Good Member'
    },
    sections: {
      'current-state': { icon: <Heart className="w-5 h-5" />, title: 'Current Impact' },
      'readiness': { icon: <Leaf className="w-5 h-5" />, title: 'Digital Maturity' },
      'ethics': { icon: <Shield className="w-5 h-5" />, title: 'Responsible Tech' },
      'future': { icon: <Target className="w-5 h-5" />, title: 'Impact Goals' }
    }
  },
  raise: {
    name: 'RAISE Foundation',
    tagline: 'Responsible AI for Shared Excellence',
    logo: '⏰',
    colors: {
      primary: '#293f3b',
      primaryHover: '#1f302c',
      primaryLight: 'bg-gray-50',
      primaryLightText: 'text-neutral-500',
      primaryLightBorder: 'border-gray-200',
      accent: '#475569',
      gradient: 'from-gray-600 to-gray-800',
      bgGradient: 'from-gray-50 to-gray-100'
    },
    messaging: {
      heroTitle: 'RAISE Certification Readiness',
      heroSubtitle: 'Assess your readiness for ethical AI adoption',
      completionTitle: 'Assessment Complete!',
      completionText: 'Enter your details to receive your RAISE readiness report.',
      reportTitle: 'Your RAISE Readiness Report',
      ctaButton: 'Start RAISE Certification',
      timeUnit: 'hours returned to your people',
      certification: 'RAISE Certified'
    },
    sections: {
      'current-state': { icon: <Users className="w-5 h-5" />, title: 'Current State' },
      'readiness': { icon: <TrendingUp className="w-5 h-5" />, title: 'Readiness Indicators' },
      'ethics': { icon: <Shield className="w-5 h-5" />, title: 'Ethics & Governance' },
      'future': { icon: <Target className="w-5 h-5" />, title: 'Future State' }
    }
  }
};

// Get theme from URL parameter or default to Level AI
const getActiveTheme = () => {
  if (typeof window === 'undefined') return THEMES.levelai;
  
  const urlParams = new URLSearchParams(window.location.search);
  const themeParam = urlParams.get('theme');
  
  // Default to Level AI for this domain
  return THEMES[themeParam] || THEMES.levelai;
};

const AssessmentTool = () => {
  const [theme] = useState(getActiveTheme());
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [userDetails, setUserDetails] = useState({
    email: '',
    name: '',
    organisation: '',
    role: ''
  });
  const [sessionId, setSessionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [benchmarkConsent, setBenchmarkConsent] = useState(true);

  // Generate unique session ID on mount
  useEffect(() => {
    const id = `${theme.name.toLowerCase().replace(/\s/g, '-')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(id);
    
    // Load any saved progress
    const savedProgress = localStorage.getItem(`${theme.name}_assessment_progress`);
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      if (parsed.sessionId === id) {
        setAnswers(parsed.answers);
        setCurrentSection(parsed.currentSection);
        setCurrentQuestion(parsed.currentQuestion);
      }
    }
  }, [theme.name]);

  // Save progress to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`${theme.name}_assessment_progress`, JSON.stringify({
        sessionId,
        answers,
        currentSection,
        currentQuestion,
        timestamp: new Date().toISOString()
      }));
    }
  }, [answers, currentSection, currentQuestion, sessionId, theme.name]);

  const sections = [
    {
      id: 'current-state',
      title: theme.sections['current-state'].title,
      icon: theme.sections['current-state'].icon,
      description: 'Tell us about your current setup (don\'t worry, we won\'t judge!)',
      questions: [
        {
          id: 'team-size',
          question: 'How many people are in your organisation?',
          type: 'single',
          weight: 1,
          options: [
            { value: '1-10', label: '1-10 people', score: 1 },
            { value: '11-50', label: '11-50 people', score: 2 },
            { value: '51-200', label: '51-200 people', score: 3 },
            { value: '200+', label: 'More than 200', score: 4 }
          ]
        },
        {
          id: 'sector',
          question: 'Which sector best describes your organisation?',
          type: 'single',
          weight: 0.5,
          options: [
            { value: 'charity', label: 'Charity / Non-profit', score: 2 },
            { value: 'public', label: 'Public sector', score: 2 },
            { value: 'private', label: 'Private sector', score: 2 },
            { value: 'social', label: 'Social enterprise', score: 2 }
          ]
        },
        {
          id: 'ai-usage',
          question: theme.name === 'Tech4Good South West' 
            ? 'Which digital tools are you currently using?'
            : 'Which AI tools are you currently using?',
          type: 'multiple',
          weight: 2,
          options: [
            { value: 'none', label: 'None yet', score: 0 },
            { value: 'chatgpt', label: theme.name === 'Tech4Good South West' ? 'Basic digital tools' : 'ChatGPT or similar', score: 1 },
            { value: 'automation', label: 'Automation tools (Zapier, Make, n8n)', score: 2 },
            { value: 'custom', label: theme.name === 'Tech4Good South West' ? 'Custom digital solutions' : 'Custom AI solutions', score: 3 },
            { value: 'comprehensive', label: theme.name === 'Tech4Good South West' ? 'Comprehensive digital strategy' : 'Comprehensive AI strategy', score: 4 }
          ]
        },
        {
          id: 'time-drains',
          question: 'What\'s eating up all your team\'s time? (We feel your pain)',
          type: 'multiple',
          weight: 1,
          options: [
            { value: 'admin', label: 'Administrative tasks', score: 1 },
            { value: 'comms', label: 'Communications & emails', score: 1 },
            { value: 'data', label: 'Data entry & reporting', score: 1 },
            { value: 'meetings', label: 'Meetings & coordination', score: 1 },
            { value: 'content', label: 'Content creation', score: 1 }
          ]
        },
        {
          id: 'pain-level',
          question: theme.name === 'Tech4Good South West'
            ? 'How much is inefficiency impacting your mission?'
            : 'How much is inefficiency impacting your organisation?',
          type: 'single',
          weight: 1.5,
          options: [
            { value: 'minimal', label: 'Minimal impact', score: 1 },
            { value: 'moderate', label: 'Moderate frustration', score: 2 },
            { value: 'significant', label: 'Significant challenge', score: 3 },
            { value: 'critical', label: 'Critical blocker', score: 4 }
          ]
        }
      ]
    },
    {
      id: 'readiness',
      title: theme.sections['readiness'].title,
      icon: theme.sections['readiness'].icon,
      description: theme.name === 'Tech4Good South West' 
        ? 'How prepared is your organisation for digital transformation?'
        : 'Let\'s see if your team is ready to embrace their AI sidekick',
      questions: [
        {
          id: 'leadership',
          question: theme.name === 'Tech4Good South West'
            ? 'How would you describe leadership\'s stance on technology?'
            : 'How would you describe leadership\'s stance on AI?',
          type: 'single',
          weight: 2,
          options: [
            { value: 'skeptical', label: 'Skeptical or unaware', score: 1 },
            { value: 'curious', label: 'Curious but cautious', score: 2 },
            { value: 'supportive', label: 'Supportive and engaged', score: 3 },
            { value: 'champion', label: 'Active champions', score: 4 }
          ]
        },
        {
          id: 'budget',
          question: theme.name === 'Tech4Good South West'
            ? 'Is there budget allocated for technology initiatives?'
            : 'Is there budget allocated for AI/automation initiatives?',
          type: 'single',
          weight: 1.5,
          options: [
            { value: 'none', label: 'No budget', score: 1 },
            { value: 'minimal', label: 'Minimal budget', score: 2 },
            { value: 'moderate', label: 'Moderate budget', score: 3 },
            { value: 'significant', label: 'Significant investment', score: 4 }
          ]
        },
        {
          id: 'innovation-culture',
          question: 'How does your team typically respond to new technology?',
          type: 'single',
          weight: 1.5,
          options: [
            { value: 'resistant', label: 'Generally resistant to change', score: 1 },
            { value: 'cautious', label: 'Cautious but open', score: 2 },
            { value: 'enthusiastic', label: 'Enthusiastic early adopters', score: 3 },
            { value: 'innovative', label: 'Innovation is in our DNA', score: 4 }
          ]
        },
        {
          id: 'skills',
          question: theme.name === 'Tech4Good South West'
            ? 'What\'s your team\'s current digital skills level?'
            : 'What\'s your team\'s current AI/digital skills level?',
          type: 'single',
          weight: 1,
          options: [
            { value: 'basic', label: 'Basic digital skills', score: 1 },
            { value: 'intermediate', label: 'Comfortable with technology', score: 2 },
            { value: 'advanced', label: theme.name === 'Tech4Good South West' ? 'Strong digital capabilities' : 'Some AI experience', score: 3 },
            { value: 'expert', label: theme.name === 'Tech4Good South West' ? 'Digital natives' : 'AI-savvy team', score: 4 }
          ]
        }
      ]
    },
    {
      id: 'ethics',
      title: theme.sections['ethics'].title,
      icon: theme.sections['ethics'].icon,
      description: theme.name === 'Tech4Good South West'
        ? 'Understanding your approach to responsible technology'
        : 'Making sure we keep things above board and human-friendly',
      questions: [
        {
          id: 'data-handling',
          question: 'How mature are your data handling practices?',
          type: 'single',
          weight: 2,
          options: [
            { value: 'basic', label: 'Basic compliance only', score: 1 },
            { value: 'documented', label: 'Documented policies in place', score: 2 },
            { value: 'robust', label: 'Robust governance framework', score: 3 },
            { value: 'advanced', label: 'Industry-leading practices', score: 4 }
          ]
        },
        {
          id: 'ai-policy',
          question: theme.name === 'Tech4Good South West'
            ? 'Do you have a technology usage policy?'
            : 'Do you have an AI usage policy?',
          type: 'single',
          weight: 1.5,
          options: [
            { value: 'none', label: 'No policy yet', score: 1 },
            { value: 'informal', label: 'Informal guidelines', score: 2 },
            { value: 'documented', label: 'Documented policy', score: 3 },
            { value: 'comprehensive', label: 'Comprehensive framework', score: 4 }
          ]
        },
        {
          id: 'transparency',
          question: theme.name === 'Tech4Good South West'
            ? 'How transparent are you about technology use with stakeholders?'
            : 'How transparent are you about AI use with stakeholders?',
          type: 'single',
          weight: 1,
          options: [
            { value: 'none', label: 'Haven\'t considered it', score: 1 },
            { value: 'internal', label: 'Internal transparency only', score: 2 },
            { value: 'partial', label: 'Some external communication', score: 3 },
            { value: 'full', label: 'Full transparency commitment', score: 4 }
          ]
        }
      ]
    },
    {
      id: 'future',
      title: theme.sections['future'].title,
      icon: theme.sections['future'].icon,
      description: 'Paint us a picture of your ideal future',
      questions: [
        {
          id: 'productivity-goals',
          question: 'What productivity gain would make this worthwhile?',
          type: 'single',
          weight: 1,
          options: [
            { value: '10', label: '10% improvement', score: 1 },
            { value: '20', label: '20% improvement', score: 2 },
            { value: '30', label: '30% improvement', score: 3 },
            { value: '40+', label: '40% or more', score: 4 }
          ]
        },
        {
          id: 'time-use',
          question: theme.name === 'Tech4Good South West'
            ? 'If technology saved your team time, how would you use it?'
            : 'If AI saved your team time, how would you use it?',
          type: 'single',
          weight: 2,
          options: [
            { value: 'more-work', label: 'Take on more work', score: 1 },
            { value: 'quality', label: theme.name === 'Tech4Good South West' ? 'Deepen your impact' : 'Improve quality of existing work', score: 2 },
            { value: 'innovation', label: theme.name === 'Tech4Good South West' ? 'Expand your mission' : 'Focus on innovation', score: 3 },
            { value: 'wellbeing', label: 'Improve work-life balance', score: 4 }
          ]
        },
        {
          id: 'timeline',
          question: theme.name === 'Tech4Good South West'
            ? 'When are you looking to implement new technology?'
            : 'When are you looking to implement AI solutions?',
          type: 'single',
          weight: 1,
          options: [
            { value: 'exploring', label: 'Just exploring', score: 1 },
            { value: '12months', label: 'Within 12 months', score: 2 },
            { value: '6months', label: 'Within 6 months', score: 3 },
            { value: 'asap', label: 'As soon as possible', score: 4 }
          ]
        }
      ]
    }
  ];

  const currentSectionData = sections[currentSection];
  const currentQuestionData = currentSectionData.questions[currentQuestion];
  const totalQuestions = sections.reduce((acc, section) => acc + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (questionId, value) => {
    if (currentQuestionData.type === 'multiple') {
      setAnswers(prev => {
        const current = prev[questionId] || [];
        if (current.includes(value)) {
          return { ...prev, [questionId]: current.filter(v => v !== value) };
        }
        return { ...prev, [questionId]: [...current, value] };
      });
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));

      // Auto-advance for single choice
      setTimeout(() => {
        advanceQuestion();
      }, 300);
    }
  };

  const advanceQuestion = () => {
    if (currentQuestion < currentSectionData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    } else {
      setShowEmailCapture(true);
    }
  };

  const calculateDetailedScore = () => {
    const sectionScores = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    sections.forEach(section => {
      let sectionScore = 0;
      let sectionWeight = 0;

      section.questions.forEach(question => {
        const answer = answers[question.id];
        const weight = question.weight || 1;
        
        if (answer) {
          if (question.type === 'multiple' && Array.isArray(answer)) {
            const scores = answer.map(val => {
              const option = question.options.find(opt => opt.value === val);
              return option?.score || 0;
            });
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            sectionScore += avgScore * weight;
          } else {
            const option = question.options.find(opt => opt.value === answer);
            sectionScore += (option?.score || 0) * weight;
          }
        }
        sectionWeight += weight * 4; // Max score per question is 4
      });

      const normalizedScore = (sectionScore / sectionWeight) * 100;
      sectionScores[section.id] = {
        score: Math.round(normalizedScore),
        title: section.title
      };

      totalWeightedScore += sectionScore;
      totalWeight += sectionWeight;
    });

    const overallScore = Math.round((totalWeightedScore / totalWeight) * 100);

    return {
      overall: overallScore,
      sections: sectionScores
    };
  };

  const getScoreInterpretation = (score) => {
    if (score < 25) return { 
      level: 'Beginning', 
      color: 'text-neutral-700 bg-neutral-50 border-neutral-200', 
      message: theme.name === 'Tech4Good South West'
        ? 'You\'re at the start of your digital journey. Exciting times ahead!'
        : 'Perfect! You\'re standing at the door of opportunity. AI is about to become your team\'s new best friend.',
      priority: theme.name === 'Tech4Good South West'
        ? 'Join our community and connect with others on similar journeys'
        : 'Start with quick wins - show your team what "AI that actually helps" looks like'
    };
    if (score < 50) return { 
      level: 'Developing', 
      color: 'text-neutral-700 bg-surface-200 border-surface-300', 
      message: theme.name === 'Tech4Good South West'
        ? 'You\'ve made a start with technology. Let\'s amplify your impact.'
        : 'Great start! You\'ve dipped your toes in the AI waters. Time to dive in and make some waves.',
      priority: theme.name === 'Tech4Good South West'
        ? 'Focus on high-impact digital tools for your mission'
        : 'Scale what\'s working and show your team how much time they can reclaim'
    };
    if (score < 75) return { 
      level: 'Advancing', 
      color: 'text-primary-700 bg-primary-50 border-primary-200', 
      message: theme.name === 'Tech4Good South West'
        ? 'You\'re leveraging tech well. Time to share your learnings!'
        : 'Impressive! You\'re already living the Level AI dream. Your team knows what "AI that actually helps" means.',
      priority: theme.name === 'Tech4Good South West'
        ? 'Share your knowledge with the Tech4Good community'
        : 'Time to become the AI success story everyone wants to copy'
    };
    return { 
      level: 'Leading', 
      color: 'text-success-800 bg-success-100 border-success-300', 
      message: theme.name === 'Tech4Good South West'
        ? 'You\'re a digital leader! Help others follow your path.'
        : 'Wow! You\'re not just AI-ready, you\'re AI-legendary. Your team has probably forgotten what manual work feels like.',
      priority: theme.name === 'RAISE Foundation'
        ? 'Share your learnings and pursue RAISE certification'
        : 'You\'re the poster child for "reclaiming time with AI that actually helps" - let\'s showcase your success!'
    };
  };

  const calculateRealisticTimeSavings = () => {
    const teamSize = answers['team-size'] || '1-10';
    const productivityGoal = answers['productivity-goals'] || '20';
    
    // Get team size factor (more conservative for larger teams due to coordination overhead)
    let teamFactor;
    if (teamSize.includes('1-10')) {
      teamFactor = 25; // Small teams: 15-35 hours total
    } else if (teamSize.includes('11-50')) {
      teamFactor = 60; // Medium teams: 40-80 hours total  
    } else if (teamSize.includes('51-200')) {
      teamFactor = 90; // Large teams: 60-120 hours total
    } else {
      teamFactor = 115; // Very large teams: 80-150 hours total
    }
    
    // Productivity goal modifier (conservative)
    let goalModifier;
    if (productivityGoal.includes('10')) {
      goalModifier = 0.6; // Conservative implementation
    } else if (productivityGoal.includes('20')) {
      goalModifier = 1.0; // Baseline expectation
    } else if (productivityGoal.includes('30')) {
      goalModifier = 1.3; // Optimistic but realistic
    } else {
      goalModifier = 1.5; // Aggressive but capped
    }
    
    // Calculate realistic savings (much more conservative)
    const totalSavings = Math.round(teamFactor * goalModifier);
    
    // Cap at reasonable maximums
    return Math.min(totalSavings, 150);
  };

  const getRecommendations = (scores) => {
    const recs = [];
    
    // Analyze weak areas
    Object.entries(scores.sections).forEach(([sectionId, data]) => {
      if (data.score < 50) {
        switch(sectionId) {
          case 'current-state':
            recs.push({
              icon: <Brain className="w-5 h-5" />,
              title: theme.name === 'Tech4Good South West' ? 'Start Small, Think Big' : 'Start Small, Think Big',
              description: theme.name === 'Tech4Good South West' 
                ? 'Pick one process that frustrates your team. Digital transformation starts there.'
                : 'Begin with one high-impact use case. Measure time saved religiously.'
            });
            break;
          case 'readiness':
            recs.push({
              icon: <Users className="w-5 h-5" />,
              title: 'Build Your Coalition',
              description: theme.name === 'Tech4Good South West'
                ? 'Connect with other Tech4Good organisations. Learn from their journeys.'
                : 'Identify AI champions across departments. Create a cross-functional AI task force.'
            });
            break;
          case 'ethics':
            recs.push({
              icon: <Shield className="w-5 h-5" />,
              title: theme.name === 'Tech4Good South West' ? 'Responsible Tech' : 'Ethics First',
              description: theme.name === 'Tech4Good South West'
                ? 'Create a simple digital ethics statement. Your beneficiaries will appreciate it.'
                : 'Draft an AI usage policy. Start simple - even a one-pager is better than nothing.'
            });
            break;
          case 'future':
            recs.push({
              icon: <Target className="w-5 h-5" />,
              title: 'Define Success',
              description: theme.name === 'Tech4Good South West'
                ? 'Set clear goals for your digital transformation. Think impact, not just efficiency.'
                : 'Set clear, measurable goals for AI adoption. Think hours saved, not just efficiency.'
            });
            break;
        }
      }
    });

    // Add time-based recommendation
    const timeline = answers['timeline'];
    if (timeline === 'asap' || timeline === '6months') {
      recs.push({
        icon: <Zap className="w-5 h-5" />,
        title: 'Quick Win Focus',
        description: theme.name === 'Tech4Good South West'
          ? 'Start with simple automation tools. Show impact within weeks.'
          : 'Start with email automation or meeting summaries. Show value fast.'
      });
    }

    return recs.slice(0, 3); // Top 3 recommendations
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const scores = calculateDetailedScore();
    const interpretation = getScoreInterpretation(scores.overall);
    const recommendations = getRecommendations(scores);

    try {
      // Save to Supabase with theme info
      await supabase.from('assessments').insert({
        session_id: sessionId,
        theme: theme.name,
        email: userDetails.email,
        name: userDetails.name,
        organisation: userDetails.organisation,
        role: userDetails.role,
        answers: answers,
        scores: scores,
        interpretation: interpretation.level,
        benchmark_consent: benchmarkConsent,
        created_at: new Date().toISOString()
      });

      // Generate PDF for email attachment
      const pdfDoc = (
        <PDFReport
          userDetails={userDetails}
          scores={scores}
          interpretation={interpretation}
          recommendations={recommendations}
          answers={answers}
          theme={theme}
        />
      );
      
      const pdfBlob = await pdf(pdfDoc).toBlob();
      const pdfBuffer = await pdfBlob.arrayBuffer();
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

      // Send email with PDF attachment (non-blocking)
      try {
        const emailResponse = await fetch('/api/send-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userDetails.email,
            name: userDetails.name,
            organisation: userDetails.organisation,
            theme: theme.name,
            scores: scores,
            interpretation: interpretation,
            pdfData: pdfBase64
          })
        });
        
        if (!emailResponse.ok) {
          console.warn('Email sending failed, but assessment was saved');
        }
      } catch (emailError) {
        console.warn('Email sending error:', emailError);
        // Continue anyway - assessment is already saved
      }

      // Send to HubSpot via your n8n webhook
      if (process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
        await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: theme.name,
            email: userDetails.email,
            properties: {
              firstname: userDetails.name.split(' ')[0],
              lastname: userDetails.name.split(' ').slice(1).join(' '),
              company: userDetails.organisation,
              jobtitle: userDetails.role,
              [`${theme.name.toLowerCase().replace(/\s/g, '_')}_readiness_score`]: scores.overall,
              [`${theme.name.toLowerCase().replace(/\s/g, '_')}_readiness_level`]: interpretation.level,
              assessment_date: new Date().toISOString()
            }
          })
        });
      }

      // Fetch benchmark data if user consented
      if (benchmarkConsent) {
        const benchmarks = await BenchmarkService.getBenchmarkData(answers, scores);
        setBenchmarkData(benchmarks);
      }

      // Clear local storage
      localStorage.removeItem(`${theme.name}_assessment_progress`);
      
      setShowEmailCapture(false);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Sorry, there was an error submitting your assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResults) {
    const scores = calculateDetailedScore();
    const interpretation = getScoreInterpretation(scores.overall);
    const recommendations = getRecommendations(scores);

    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.colors.bgGradient} py-12 px-4`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              {theme.logo.startsWith('/') ? (
                <Image
                  src={theme.logo}
                  alt="Level AI Avatar"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="text-4xl">{theme.logo}</div>
              )}
            </div>
            <h1 className="text-4xl font-bold text-neutral-800 mb-2">{theme.messaging.reportTitle}</h1>
            <p className="text-lg text-neutral-500">
              {userDetails.name} · {userDetails.organisation}
            </p>
          </div>

          {/* Main Score Card */}
          <div className="card mb-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">Overall Readiness</h2>
                <div className="mb-6">
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-5xl font-bold text-neutral-800">{scores.overall}%</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${interpretation.color}`}>
                      {interpretation.level}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      style={{ width: `${scores.overall}%` }} 
                      className={`h-3 rounded-full bg-gradient-to-r ${theme.colors.gradient} transition-all duration-1000`}
                    />
                  </div>
                  <p className="text-neutral-500">{interpretation.message}</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    <strong>Priority:</strong> {interpretation.priority}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Section Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(scores.sections).map(([sectionId, data]) => (
                    <div key={sectionId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-500">{data.title}</span>
                        <span className="font-semibold text-neutral-800">{data.score}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          style={{ width: `${data.score}%` }} 
                          className="h-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-bold text-neutral-800 mb-6">Your Personalised Action Plan</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {recommendations.map((rec, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 ${theme.colors.primaryLight} rounded-lg flex-shrink-0`} style={{ backgroundColor: `${theme.colors.primary}20` }}>
                        {rec.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-800 mb-1">{rec.title}</h4>
                        <p className="text-sm text-neutral-500">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Savings Calculator */}
            <div className={`mt-8 p-6 ${theme.colors.primaryLight} rounded-lg`}>
              <h4 className={`font-semibold ${theme.colors.primaryLightText} mb-2`}>Potential Time Savings</h4>
              <p className={`text-sm ${theme.colors.primaryLightText}`}>
                Based on your responses, {theme.name === 'Tech4Good South West' ? 'technology' : 'AI that actually helps'} could give your team approximately{' '}
                <strong>{calculateRealisticTimeSavings()} {theme.messaging.timeUnit}</strong>.
                Imagine what your team could do with all that extra time! 🚀
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="card">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-neutral-800 mb-4">Ready to Reclaim Your Time?</h3>
              <p className="text-neutral-500 mb-6">
                {theme.name === 'Tech4Good South West'
                  ? 'Join our community of purpose-driven organisations using tech for good.'
                  : 'Let\'s turn this assessment into action. Get your personalised roadmap for implementing AI that actually helps your team.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PDFDownloadLink
                  document={
                    <PDFReport
                      userDetails={userDetails}
                      scores={scores}
                      interpretation={interpretation}
                      recommendations={recommendations}
                      answers={answers}
                      theme={theme}
                    />
                  }
                  fileName={`${userDetails.name.replace(/\s+/g, '-')}-AI-Readiness-Roadmap.pdf`}
                  className="flex items-center justify-center gap-2 bg-surface-200 text-neutral-500 font-semibold py-3 px-6 rounded-lg hover:bg-surface-300 transition-colors"
                >
                  {({ blob, url, loading, error }) => (
                    loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Get Your AI Roadmap
                      </>
                    )
                  )}
                </PDFDownloadLink>
                <button 
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {theme.messaging.ctaButton}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Benchmark Analytics */}
          <div className="mt-8">
            <BenchmarkAnalytics 
              benchmarkData={benchmarkData}
              userScores={scores}
              theme={theme}
            />
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-neutral-500">
              Powered by {theme.name} · {theme.tagline}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showEmailCapture) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.colors.bgGradient} py-12 px-4 flex items-center`}>
        <div className="max-w-md mx-auto w-full">
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">{theme.messaging.completionTitle}</h2>
              <p className="text-neutral-500">
                {theme.messaging.completionText}
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={userDetails.email}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': theme.colors.primary }}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={userDetails.name}
                  onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': theme.colors.primary }}
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  Organisation *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={userDetails.organisation}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, organisation: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': theme.colors.primary }}
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={userDetails.role}
                  onChange={(e) => setUserDetails(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': theme.colors.primary }}
                  placeholder="CEO, CTO, Operations Manager..."
                />
              </div>

              <div className="bg-surface-50 p-4 rounded-lg border border-surface-200">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={benchmarkConsent}
                    onChange={(e) => setBenchmarkConsent(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-neutral-700">Help improve benchmarks</div>
                    <div className="text-neutral-500">
                      Include my anonymous data in future benchmarking insights to help other organizations. 
                      Your personal information will never be shared.
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get My Report
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-neutral-500 text-center mt-4">
                By submitting, you agree to receive relevant resources from {theme.name}.
                We respect your privacy and won't spam you.
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.colors.bgGradient} py-12 px-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Header with branding */}
        <div className="text-center mb-8">
          <div className="mb-2 flex justify-center">
            {theme.logo.startsWith('/') ? (
              <Image
                src={theme.logo}
                alt="Level AI Avatar"
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="text-4xl">{theme.logo}</div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-neutral-800">{theme.messaging.heroTitle}</h1>
          <p className="text-neutral-500">{theme.messaging.heroSubtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-500">Progress</span>
            <span className="text-sm font-medium text-neutral-500">{answeredQuestions} of {totalQuestions}</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2 shadow-inner">
            <div 
              className={`bg-gradient-to-r ${theme.colors.gradient} h-2 rounded-full transition-all duration-500 shadow-sm`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main card */}
        <div className="card">
          {/* Section header */}
          <div className="mb-8 p-4 bg-surface-100 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-primary-100 border border-primary-200">
                {currentSectionData.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-800">{currentSectionData.title}</h2>
                <p className="text-sm text-neutral-500">{currentSectionData.description}</p>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-800 mb-6">
              {currentQuestionData.question}
            </h3>
            
            <div className="space-y-3">
              {currentQuestionData.options.map((option) => {
                const isSelected = currentQuestionData.type === 'multiple' 
                  ? (answers[currentQuestionData.id] || []).includes(option.value)
                  : answers[currentQuestionData.id] === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(currentQuestionData.id, option.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? 'border-current bg-opacity-5' 
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-surface-50'
                    }`}
                    style={{ 
                      borderColor: isSelected ? theme.colors.primary : undefined,
                      backgroundColor: isSelected ? `${theme.colors.primary}10` : undefined
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-500">{option.label}</span>
                      {isSelected && (
                        <Check className="w-5 h-5 flex-shrink-0 ml-2" style={{ color: theme.colors.primary }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {currentQuestionData.type === 'multiple' && (
              <p className="text-sm text-neutral-500 mt-3">Select all that apply</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1);
                } else if (currentSection > 0) {
                  setCurrentSection(currentSection - 1);
                  setCurrentQuestion(sections[currentSection - 1].questions.length - 1);
                }
              }}
              disabled={currentSection === 0 && currentQuestion === 0}
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-2">
              {sections.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSection ? 'bg-current shadow-md scale-110' : 'bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  style={{ backgroundColor: index === currentSection ? theme.colors.primary : undefined }}
                />
              ))}
            </div>

            {currentQuestionData.type === 'multiple' ? (
              <button
                onClick={advanceQuestion}
                disabled={!answers[currentQuestionData.id] || answers[currentQuestionData.id].length === 0}
                className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-20" /> // Spacer for layout consistency
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-neutral-500">
            <Clock className="w-4 h-4 inline mr-1" />
            5 minutes to discover how much time AI can give back to your team
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            {theme.name} · {theme.tagline}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTool;