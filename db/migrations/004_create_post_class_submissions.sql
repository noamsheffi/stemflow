-- Isolated from experiments 001-problem-discovery and 002-slide-friction.
CREATE TABLE IF NOT EXISTS post_class_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id TEXT NOT NULL CHECK (experiment_id = '002-post-class-behavior'),
  anonymous_client_id UUID NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_to_material TEXT NOT NULL CHECK (returned_to_material IN ('yes', 'no', 'unsure')),
  material_actions TEXT[] NOT NULL DEFAULT '{}',
  return_trigger TEXT,
  non_return_reason TEXT,
  formula_context_needs TEXT[] NOT NULL CHECK (cardinality(formula_context_needs) BETWEEN 1 AND 2),
  concept_connection_value INTEGER NOT NULL CHECK (concept_connection_value BETWEEN 1 AND 5),
  concept_connection_example TEXT NOT NULL DEFAULT '' CHECK (length(concept_connection_example) <= 800),
  other_text JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(other_text) = 'object'),
  UNIQUE (experiment_id, anonymous_client_id),
  CHECK ((returned_to_material = 'yes' AND cardinality(material_actions) > 0 AND return_trigger IS NOT NULL AND non_return_reason IS NULL)
    OR (returned_to_material = 'no' AND cardinality(material_actions) = 0 AND return_trigger IS NULL AND non_return_reason IS NOT NULL)
    OR (returned_to_material = 'unsure' AND cardinality(material_actions) = 0 AND return_trigger IS NULL AND non_return_reason IS NULL)),
  CHECK (NOT ('none' = ANY(formula_context_needs)) OR cardinality(formula_context_needs) = 1)
);
CREATE INDEX IF NOT EXISTS post_class_submissions_experiment_date_idx ON post_class_submissions (experiment_id, submitted_at DESC);
