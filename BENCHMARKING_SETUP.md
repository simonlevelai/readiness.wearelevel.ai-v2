# Benchmarking System Setup Guide

## Overview

The benchmarking system provides anonymous peer comparisons and industry insights to assessment participants. Users can see how their AI readiness compares to similar organizations while maintaining complete privacy.

## Database Setup

### 1. Update Assessments Table

Add the consent column to your existing assessments table:

```sql
ALTER TABLE assessments ADD COLUMN benchmark_consent BOOLEAN DEFAULT true;
```

### 2. Install Database Functions

Run the SQL functions in `supabase/functions.sql` in your Supabase SQL editor. These functions provide:

- **get_sector_benchmarks()** - Average scores by industry sector
- **get_team_size_benchmarks()** - Comparisons by organization size
- **get_user_percentile()** - Percentile rankings within peer groups
- **get_top_performer_insights()** - Common patterns among high-scoring organizations
- **get_readiness_trends()** - Historical trends and adoption patterns

## Features Implemented

### 1. **BenchmarkAnalytics Component**
- Industry sector comparisons
- Team size benchmarking
- Percentile rankings
- Top performer insights
- Industry trends visualization

### 2. **Privacy Controls**
- Opt-in consent checkbox during email capture
- Only consented data used in calculations
- Minimum sample sizes (n≥5) for statistical validity
- Anonymous aggregation only

### 3. **Smart Insights**
- Automated performance analysis
- Contextual recommendations
- Peer group identification
- Strength/weakness highlighting

## How It Works

### Data Collection
1. User completes assessment
2. Results saved to Supabase with consent flag
3. If consented, data included in future benchmarks
4. Personal information never shared

### Benchmark Display
1. After assessment submission, benchmarks are fetched
2. User's scores compared against similar organizations
3. Insights generated based on performance relative to peers
4. Visual comparisons shown in results section

### Privacy Protection
- All comparisons use aggregate data only
- Minimum sample sizes required
- Personal identifiers excluded from benchmarks
- Users can opt out at any time

## Integration Points

### In AssessmentTool Component
```javascript
// Import the service and component
import BenchmarkAnalytics from './BenchmarkAnalytics';
import { BenchmarkService } from '../services/benchmarkService';

// After assessment submission
const benchmarks = await BenchmarkService.getBenchmarkData(answers, scores);
setBenchmarkData(benchmarks);

// In results display
<BenchmarkAnalytics 
  benchmarkData={benchmarkData}
  userScores={scores}
  theme={theme}
/>
```

### Consent Collection
```javascript
// Add to email capture form
<input
  type="checkbox"
  checked={benchmarkConsent}
  onChange={(e) => setBenchmarkConsent(e.target.checked)}
/>
```

## Sample Benchmark Data

The system provides:

**Sector Comparisons:**
- Average scores by industry (charity, private, public, social)
- Section-specific performance (readiness, ethics, future planning)
- Sample sizes for statistical confidence

**Team Size Analysis:**
- Performance patterns by organization size
- Readiness distribution across team sizes
- Maturity level breakdowns

**Percentile Rankings:**
- Position within sector (top 25%, median, etc.)
- Comparison to similar team sizes
- Overall assessment population ranking

**Top Performer Insights:**
- Common AI tools used by high scorers
- Average productivity goals
- Leadership and budget patterns

## Benefits

### For Users
- **Context for scores** - Understanding relative performance
- **Peer insights** - Learning from similar organizations
- **Benchmarking value** - Industry standard comparisons
- **Actionable intelligence** - Data-driven improvement focus

### For Organizations
- **Market positioning** - Understanding competitive landscape
- **Best practices** - Learning from top performers
- **Trend awareness** - Industry adoption patterns
- **Investment justification** - Peer comparison data

## Next Steps

1. **Run database migrations** to add consent column
2. **Install SQL functions** for benchmark calculations
3. **Test with sample data** to verify calculations
4. **Deploy updated application** with benchmark features
5. **Monitor data quality** and sample sizes

## Future Enhancements

- **Historical comparisons** - Track progress over time
- **Industry deep-dives** - Sector-specific insights
- **Regional variations** - Geographic comparisons
- **Predictive modeling** - Success factor analysis
- **Custom peer groups** - User-defined comparisons

The benchmarking system provides valuable context while maintaining complete privacy and data protection compliance.