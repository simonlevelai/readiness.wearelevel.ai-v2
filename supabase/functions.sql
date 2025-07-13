-- Supabase functions for anonymous benchmarking
-- Run these in your Supabase SQL editor

-- First, add the consent column to your assessments table
-- ALTER TABLE assessments ADD COLUMN benchmark_consent BOOLEAN DEFAULT true;

-- Function to get sector averages
CREATE OR REPLACE FUNCTION get_sector_benchmarks(user_sector TEXT)
RETURNS TABLE (
  sector TEXT,
  avg_overall_score NUMERIC,
  avg_current_state NUMERIC,
  avg_readiness NUMERIC,
  avg_ethics NUMERIC,
  avg_future NUMERIC,
  sample_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    answers->>'sector' as sector,
    ROUND(AVG((scores->>'overall')::int), 1) as avg_overall_score,
    ROUND(AVG((scores->'sections'->'current-state'->>'score')::int), 1) as avg_current_state,
    ROUND(AVG((scores->'sections'->'readiness'->>'score')::int), 1) as avg_readiness,
    ROUND(AVG((scores->'sections'->'ethics'->>'score')::int), 1) as avg_ethics,
    ROUND(AVG((scores->'sections'->'future'->>'score')::int), 1) as avg_future,
    COUNT(*) as sample_size
  FROM assessments
  WHERE answers->>'sector' = user_sector
    AND created_at >= NOW() - INTERVAL '6 months'
    AND benchmark_consent = true
  GROUP BY answers->>'sector'
  HAVING COUNT(*) >= 5; -- Only return if we have enough samples
END;
$$ LANGUAGE plpgsql;

-- Function to get team size benchmarks
CREATE OR REPLACE FUNCTION get_team_size_benchmarks(user_team_size TEXT)
RETURNS TABLE (
  team_size TEXT,
  avg_overall_score NUMERIC,
  avg_readiness_score NUMERIC,
  interpretation_distribution JSONB,
  sample_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    answers->>'team-size' as team_size,
    ROUND(AVG((scores->>'overall')::int), 1) as avg_overall_score,
    ROUND(AVG((scores->'sections'->'readiness'->>'score')::int), 1) as avg_readiness_score,
    json_build_object(
      'Beginning', COUNT(*) FILTER (WHERE interpretation = 'Beginning'),
      'Developing', COUNT(*) FILTER (WHERE interpretation = 'Developing'),
      'Advancing', COUNT(*) FILTER (WHERE interpretation = 'Advancing'),
      'Leading', COUNT(*) FILTER (WHERE interpretation = 'Leading')
    ) as interpretation_distribution,
    COUNT(*) as sample_size
  FROM assessments
  WHERE answers->>'team-size' = user_team_size
    AND created_at >= NOW() - INTERVAL '6 months'
    AND benchmark_consent = true
  GROUP BY answers->>'team-size'
  HAVING COUNT(*) >= 5;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user percentile
CREATE OR REPLACE FUNCTION get_user_percentile(
  user_score INTEGER,
  user_sector TEXT,
  user_team_size TEXT
)
RETURNS TABLE (
  sector_percentile NUMERIC,
  team_size_percentile NUMERIC,
  overall_percentile NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Percentile within sector
    (SELECT ROUND(
      (COUNT(*) FILTER (WHERE (scores->>'overall')::int < user_score) * 100.0 / COUNT(*)), 1
    ) FROM assessments 
    WHERE answers->>'sector' = user_sector 
      AND created_at >= NOW() - INTERVAL '6 months'
      AND benchmark_consent = true) as sector_percentile,
    
    -- Percentile within team size
    (SELECT ROUND(
      (COUNT(*) FILTER (WHERE (scores->>'overall')::int < user_score) * 100.0 / COUNT(*)), 1
    ) FROM assessments 
    WHERE answers->>'team-size' = user_team_size 
      AND created_at >= NOW() - INTERVAL '6 months'
      AND benchmark_consent = true) as team_size_percentile,
    
    -- Overall percentile
    (SELECT ROUND(
      (COUNT(*) FILTER (WHERE (scores->>'overall')::int < user_score) * 100.0 / COUNT(*)), 1
    ) FROM assessments 
    WHERE created_at >= NOW() - INTERVAL '6 months'
      AND benchmark_consent = true) as overall_percentile;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performer insights
CREATE OR REPLACE FUNCTION get_top_performer_insights(
  user_sector TEXT,
  user_team_size TEXT
)
RETURNS TABLE (
  common_ai_tools JSONB,
  avg_productivity_goal TEXT,
  leadership_support_avg NUMERIC,
  budget_allocation_avg NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH top_performers AS (
    SELECT *
    FROM assessments
    WHERE answers->>'sector' = user_sector
      AND answers->>'team-size' = user_team_size
      AND (scores->>'overall')::int >= 80
      AND created_at >= NOW() - INTERVAL '6 months'
      AND benchmark_consent = true
  )
  SELECT 
    -- Most common AI tools among top performers
    (SELECT json_agg(DISTINCT tool)
     FROM top_performers,
     jsonb_array_elements_text(answers->'ai-usage') as tool
     WHERE tool != 'none'
     LIMIT 5) as common_ai_tools,
    
    -- Most common productivity goal
    (SELECT mode() WITHIN GROUP (ORDER BY answers->>'productivity-goals')
     FROM top_performers) as avg_productivity_goal,
    
    -- Average leadership support score
    ROUND(AVG((answers->>'leadership')::int), 1) as leadership_support_avg,
    
    -- Average budget allocation score  
    ROUND(AVG((answers->>'budget')::int), 1) as budget_allocation_avg
  FROM top_performers;
END;
$$ LANGUAGE plpgsql;

-- Function to get overall trends
CREATE OR REPLACE FUNCTION get_readiness_trends()
RETURNS TABLE (
  month TEXT,
  avg_score NUMERIC,
  completion_count BIGINT,
  top_sectors JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
    ROUND(AVG((scores->>'overall')::int), 1) as avg_score,
    COUNT(*) as completion_count,
    (SELECT json_agg(json_build_object('sector', sector, 'count', cnt))
     FROM (
       SELECT answers->>'sector' as sector, COUNT(*) as cnt
       FROM assessments a2
       WHERE DATE_TRUNC('month', a2.created_at) = DATE_TRUNC('month', assessments.created_at)
       GROUP BY answers->>'sector'
       ORDER BY cnt DESC
       LIMIT 3
     ) top_sectors_subq) as top_sectors
  FROM assessments
  WHERE created_at >= NOW() - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', created_at)
  ORDER BY month DESC;
END;
$$ LANGUAGE plpgsql;