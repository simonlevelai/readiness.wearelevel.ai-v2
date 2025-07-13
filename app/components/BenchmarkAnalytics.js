import React from 'react';
import { TrendingUp, Users, Target, Award, BarChart3, Lightbulb } from 'lucide-react';

const BenchmarkAnalytics = ({ benchmarkData, userScores, theme }) => {
  if (!benchmarkData) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6 text-center">
        <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-500 mb-2">Benchmarks Loading...</h3>
        <p className="text-neutral-500">We're comparing your results with similar organizations</p>
      </div>
    );
  }

  const { sector, teamSize, percentiles, insights, topPerformers } = benchmarkData;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-500 mb-2">How You Compare</h2>
        <p className="text-neutral-500">See how your AI readiness stacks up against similar organizations</p>
      </div>

      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="bg-surface-100 rounded-lg border border-surface-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-500 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-primary-400" />
            Key Insights
          </h3>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="text-lg" role="img" aria-label={insight.category}>
                  {insight.icon}
                </span>
                <p className={`text-sm ${
                  insight.type === 'positive' ? 'text-success-600' : 
                  insight.type === 'improvement' ? 'text-warning-600' : 
                  'text-neutral-500'
                }`}>
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Level */}
      {percentiles.sector_percentile && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-500 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-primary-400" />
            Your Performance Level
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PercentileCard
              title="In Your Sector"
              percentile={percentiles.sector_percentile}
              context={sector.name}
            />
            <PercentileCard
              title="Similar Team Size"
              percentile={percentiles.team_size_percentile}
              context={teamSize.name}
            />
            <PercentileCard
              title="Overall"
              percentile={percentiles.overall_percentile}
              context="all organizations"
            />
          </div>
        </div>
      )}

      {/* Sector Comparison */}
      {sector.hasData && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-500 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary-400" />
            {sector.name} Sector Comparison
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ComparisonMetric
              label="Overall"
              userScore={userScores.overall}
              benchmarkScore={sector.benchmarks[0]?.avg_overall_score}
              suffix="%"
            />
            <ComparisonMetric
              label="Readiness"
              userScore={userScores.sections.readiness.score}
              benchmarkScore={sector.benchmarks[0]?.avg_readiness}
              suffix="%"
            />
            <ComparisonMetric
              label="Ethics"
              userScore={userScores.sections.ethics.score}
              benchmarkScore={sector.benchmarks[0]?.avg_ethics}
              suffix="%"
            />
            <ComparisonMetric
              label="Future Planning"
              userScore={userScores.sections.future.score}
              benchmarkScore={sector.benchmarks[0]?.avg_future}
              suffix="%"
            />
          </div>
          <p className="text-xs text-neutral-500 mt-4">
            Based on {sector.benchmarks[0]?.sample_size} similar organizations
          </p>
        </div>
      )}

      {/* Top Performer Insights */}
      {topPerformers.common_ai_tools && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-500 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary-400" />
            What Top Performers Do Differently
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-neutral-500 mb-2">Popular AI Tools</h4>
              <div className="flex flex-wrap gap-2">
                {topPerformers.common_ai_tools?.slice(0, 5).map((tool, index) => (
                  <span key={index} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-neutral-500 mb-1">Average Productivity Goal</h4>
                <p className="text-2xl font-bold text-success-500">
                  {topPerformers.avg_productivity_goal}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-400">Leadership Support</p>
                  <p className="font-semibold text-neutral-500">
                    {topPerformers.leadership_support_avg}/4
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400">Budget Allocation</p>
                  <p className="font-semibold text-neutral-500">
                    {topPerformers.budget_allocation_avg}/4
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Industry Trends */}
      {benchmarkData.trends.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-500 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-400" />
            Industry Trends
          </h3>
          <div className="space-y-4">
            {benchmarkData.trends.slice(0, 3).map((trend, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="font-medium text-neutral-500">{trend.month}</p>
                  <p className="text-sm text-neutral-400">{trend.completion_count} assessments</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-neutral-500">{trend.avg_score}%</p>
                  <p className="text-xs text-neutral-400">avg score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PercentileCard = ({ title, percentile, context }) => {
  const performanceLevel = getPerformanceLevel(percentile);
  
  return (
    <div className="text-center p-4 bg-surface-50 rounded-lg">
      <h4 className="font-medium text-neutral-500 mb-2">{title}</h4>
      <p className="text-2xl font-bold text-neutral-500 mb-1">{percentile}%</p>
      <p className={`text-sm px-2 py-1 rounded-full bg-${performanceLevel.color} bg-opacity-10 text-${performanceLevel.color}`}>
        {performanceLevel.description}
      </p>
      <p className="text-xs text-neutral-400 mt-1">vs {context}</p>
    </div>
  );
};

const ComparisonMetric = ({ label, userScore, benchmarkScore, suffix = '' }) => {
  const difference = userScore - benchmarkScore;
  const isPositive = difference > 0;
  
  return (
    <div className="text-center p-3 bg-surface-50 rounded-lg">
      <h4 className="font-medium text-neutral-500 mb-1">{label}</h4>
      <div className="flex items-center justify-center space-x-2">
        <span className="text-lg font-bold text-neutral-500">
          {userScore}{suffix}
        </span>
        {benchmarkScore && (
          <span className={`text-sm px-2 py-1 rounded-full ${
            isPositive 
              ? 'bg-success-50 text-success-600' 
              : 'bg-warning-50 text-warning-600'
          }`}>
            {isPositive ? '+' : ''}{Math.round(difference)}
          </span>
        )}
      </div>
      {benchmarkScore && (
        <p className="text-xs text-neutral-400 mt-1">
          avg: {Math.round(benchmarkScore)}{suffix}
        </p>
      )}
    </div>
  );
};

const getPerformanceLevel = (percentile) => {
  if (percentile >= 90) return { level: 'Exceptional', color: 'success-500', description: 'Top 10%' };
  if (percentile >= 75) return { level: 'Strong', color: 'success-400', description: 'Top 25%' };
  if (percentile >= 50) return { level: 'Average', color: 'primary-400', description: 'Above median' };
  if (percentile >= 25) return { level: 'Developing', color: 'warning-400', description: 'Building momentum' };
  return { level: 'Getting Started', color: 'neutral-400', description: 'Early stage' };
};

export default BenchmarkAnalytics;