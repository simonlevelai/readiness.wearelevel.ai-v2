import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFDC',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 15,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#293F3B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#696969',
    marginBottom: 20,
  },
  scoreContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 25,
    marginBottom: 25,
    border: '1px solid #E5E5E5',
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#293F3B',
    marginBottom: 15,
  },
  overallScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FEDA00',
    marginBottom: 10,
    textAlign: 'center',
  },
  scoreLevel: {
    fontSize: 14,
    color: '#293F3B',
    textAlign: 'center',
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#FEDA00',
    borderRadius: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  sectionBreakdown: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#293F3B',
    marginBottom: 10,
  },
  sectionScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 12,
  },
  recommendationsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 25,
    marginBottom: 25,
    border: '1px solid #E5E5E5',
  },
  recommendationItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#FFFDF2',
    borderRadius: 8,
    borderLeft: '4px solid #FEDA00',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#293F3B',
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#696969',
    fontSize: 10,
    borderTop: '1px solid #E5E5E5',
    paddingTop: 15,
  },
  timeSavings: {
    backgroundColor: '#FFFDF2',
    padding: 20,
    borderRadius: 8,
    marginTop: 15,
    borderLeft: '4px solid #FEDA00',
  },
  timeSavingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#293F3B',
    marginBottom: 8,
  },
  timeSavingsText: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 1.4,
  },
});

const PDFReport = ({ userDetails, scores, interpretation, recommendations, answers, theme }) => {
  const calculateTimeSavings = () => {
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your AI Readiness Roadmap</Text>
          <Text style={styles.subtitle}>
            Personalized report for {userDetails.name} at {userDetails.organisation}
          </Text>
        </View>

        {/* Overall Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>Overall AI Readiness</Text>
          <Text style={styles.overallScore}>{scores.overall}%</Text>
          <Text style={styles.scoreLevel}>{interpretation.level}</Text>
          <Text style={[styles.recommendationText, { textAlign: 'center' }]}>
            {interpretation.message}
          </Text>

          {/* Section Breakdown */}
          <View style={styles.sectionBreakdown}>
            <Text style={styles.sectionTitle}>Section Breakdown</Text>
            {Object.entries(scores.sections).map(([sectionId, data]) => (
              <View key={sectionId} style={styles.sectionScore}>
                <Text>{data.title}</Text>
                <Text style={{ fontWeight: 'bold' }}>{data.score}%</Text>
              </View>
            ))}
          </View>

          {/* Time Savings */}
          <View style={styles.timeSavings}>
            <Text style={styles.timeSavingsTitle}>Potential Time Savings</Text>
            <Text style={styles.timeSavingsText}>
              Based on your responses, AI that actually helps could give your team approximately{' '}
              <Text style={{ fontWeight: 'bold' }}>{calculateTimeSavings()} hours back each month</Text>.
              Imagine what your team could do with all that extra time!
            </Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.scoreTitle}>Your Personalized Action Plan</Text>
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
              <Text style={styles.recommendationText}>{rec.description}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Level AI · Reclaim your time with AI that actually helps</Text>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFReport;