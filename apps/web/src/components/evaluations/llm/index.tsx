import {
  EvaluationType,
  LlmEvaluationMetric,
  LlmEvaluationSpecification,
} from '@latitude-data/constants'
import { IconName } from '@latitude-data/web-ui'
import { EvaluationMetricFrontendSpecification } from '../index'

// prettier-ignore
const METRICS: {
  [M in LlmEvaluationMetric]: EvaluationMetricFrontendSpecification<EvaluationType.Llm, M>
} = {
  [LlmEvaluationMetric.Binary]: undefined as any, // TODO: Implement
  [LlmEvaluationMetric.Rating]: undefined as any, // TODO: Implement
  [LlmEvaluationMetric.Comparison]: undefined as any, // TODO: Implement
}

const specification = LlmEvaluationSpecification
export default {
  ...specification,
  icon: 'bot' as IconName,
  ConfigurationForm: undefined as any, // TODO: Implement
  metrics: METRICS,
}
