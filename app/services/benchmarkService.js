import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export class BenchmarkService {
  
  static async getBenchmarkData(userAnswers, userScores) {
    try {
      const sector = userAnswers['sector'];
      const teamSize = userAnswers['team-size'];
      const overallScore = userScores.overall;

      // Get all benchmark data in parallel
      const [
        sectorBenchmarks,
        teamSizeBenchmarks,
        userPercentile,
        topPerformerInsights,
        readinessTrends
      ] = await Promise.all([
        this.getSectorBenchmarks(sector),
        this.getTeamSizeBenchmarks(teamSize),
        this.getUserPercentile(overallScore, sector, teamSize),
        this.getTopPerformerInsights(sector, teamSize),
        this.getReadinessTrends()
      ]);

      return {
        sector: {
          name: sector,
          benchmarks: sectorBenchmarks,
          hasData: sectorBenchmarks.length > 0
        },
        teamSize: {
          name: teamSize,
          benchmarks: teamSizeBenchmarks,
          hasData: teamSizeBenchmarks.length > 0
        },
        percentiles: userPercentile[0] || {},
        topPerformers: topPerformerInsights[0] || {},
        trends: readinessTrends || [],
        insights: this.generateInsights(userScores, sectorBenchmarks[0], teamSizeBenchmarks[0], userPercentile[0])
      };
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
      return null;
    }
  }

  static async getSectorBenchmarks(sector) {
    const { data, error } = await supabase.rpc('get_sector_benchmarks', {
      user_sector: sector
    });
    
    if (error) {
      console.error('Error fetching sector benchmarks:', error);
      return [];
    }
    
    return data || [];
  }

  static async getTeamSizeBenchmarks(teamSize) {
    const { data, error } = await supabase.rpc('get_team_size_benchmarks', {
      user_team_size: teamSize
    });
    
    if (error) {
      console.error('Error fetching team size benchmarks:', error);
      return [];
    }
    
    return data || [];
  }

  static async getUserPercentile(score, sector, teamSize) {
    const { data, error } = await supabase.rpc('get_user_percentile', {
      user_score: score,
      user_sector: sector,
      user_team_size: teamSize
    });
    
    if (error) {
      console.error('Error fetching user percentile:', error);
      return [];
    }
    
    return data || [];
  }

  static async getTopPerformerInsights(sector, teamSize) {
    const { data, error } = await supabase.rpc('get_top_performer_insights', {
      user_sector: sector,
      user_team_size: teamSize
    });
    
    if (error) {
      console.error('Error fetching top performer insights:', error);
      return [];
    }
    
    return data || [];
  }

  static async getReadinessTrends() {
    const { data, error } = await supabase.rpc('get_readiness_trends');
    
    if (error) {
      console.error('Error fetching readiness trends:', error);
      return [];
    }
    
    return data || [];
  }

  static generateInsights(userScores, sectorBenchmark, teamSizeBenchmark, percentiles) {
    const insights = [];

    // Sector comparison insights
    if (sectorBenchmark && userScores.overall > sectorBenchmark.avg_overall_score) {
      insights.push({
        type: 'positive',
        category: 'sector',
        message: `You're performing ${Math.round(userScores.overall - sectorBenchmark.avg_overall_score)}% above the average for ${sectorBenchmark.sector} organizations`,
        icon: '📈'
      });
    } else if (sectorBenchmark) {
      insights.push({
        type: 'improvement',
        category: 'sector',
        message: `There's room to grow - the average ${sectorBenchmark.sector} organization scores ${Math.round(sectorBenchmark.avg_overall_score)}%`,
        icon: '🎯'
      });
    }

    // Percentile insights
    if (percentiles.sector_percentile >= 75) {
      insights.push({
        type: 'positive',
        category: 'percentile',
        message: `You're in the top ${Math.round(100 - percentiles.sector_percentile)}% of organizations in your sector`,
        icon: '🏆'
      });
    } else if (percentiles.sector_percentile >= 50) {
      insights.push({
        type: 'neutral',
        category: 'percentile',
        message: `You're performing better than ${Math.round(percentiles.sector_percentile)}% of similar organizations`,
        icon: '👍'
      });
    }

    // Team size insights
    if (teamSizeBenchmark && userScores.sections.readiness.score > teamSizeBenchmark.avg_readiness_score) {
      insights.push({
        type: 'positive',
        category: 'readiness',
        message: `Your readiness score exceeds the average for ${teamSizeBenchmark.team_size} person organizations`,
        icon: '🚀'
      });
    }

    // Section-specific insights
    const weakestSection = Object.entries(userScores.sections).reduce((min, [key, section]) => 
      section.score < min.score ? { key, ...section } : min
    );

    if (sectorBenchmark) {
      const sectionKey = weakestSection.key.replace('-', '_');
      const sectorSectionAvg = sectorBenchmark[`avg_${sectionKey}`];
      
      if (sectorSectionAvg && weakestSection.score < sectorSectionAvg) {
        insights.push({
          type: 'improvement',
          category: 'section',
          message: `Focus on "${weakestSection.title}" - similar organizations average ${Math.round(sectorSectionAvg)}% in this area`,
          icon: '💡'
        });
      }
    }

    return insights;
  }

  static formatBenchmarkMessage(userScore, benchmarkScore, context) {
    const difference = userScore - benchmarkScore;
    const percentage = Math.abs(Math.round(difference));
    
    if (difference > 0) {
      return `${percentage}% above average for ${context}`;
    } else if (difference < 0) {
      return `${percentage}% below average for ${context}`;
    } else {
      return `Right on average for ${context}`;
    }
  }

  static getPerformanceLevel(percentile) {
    if (percentile >= 90) return { level: 'Exceptional', color: 'success-500', description: 'Top 10%' };
    if (percentile >= 75) return { level: 'Strong', color: 'success-400', description: 'Top 25%' };
    if (percentile >= 50) return { level: 'Average', color: 'primary-400', description: 'Above median' };
    if (percentile >= 25) return { level: 'Developing', color: 'warning-400', description: 'Building momentum' };
    return { level: 'Getting Started', color: 'neutral-400', description: 'Early stage' };
  }
}