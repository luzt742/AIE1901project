// 共享类型定义

export interface DistributionInfo {
  type: string;
  name: string;
  formula?: string;
  parameters?: Record<string, number | string>;
}

export interface DataInputPanelProps {
  onDataChange: (data: number[], distribution?: DistributionInfo | null) => void;
}

export interface FileUploaderProps {
  onDataChange: (data: number[], distribution?: DistributionInfo | null) => void;
}

export interface DistributionGeneratorProps {
  onDataChange: (data: number[], distribution?: DistributionInfo | null) => void;
}

export interface AIDataGeneratorProps {
  onDataChange: (data: number[], distribution?: DistributionInfo | null) => void;
}

export interface BasicStatisticsTabProps {
  dataset: number[];
}

export interface MLEMoMTabProps {
  dataset: number[];
  distribution: DistributionInfo | null;
}

export interface DistributionParam {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface DistributionConfig {
  name: string;
  params: DistributionParam[];
  formula?: string;
}

export interface EstimationResult {
  method: string;
  params: Record<string, number>;
}

/**
 * 置信区间分析标签页组件属性
 */
export interface ConfidenceIntervalTabProps {
  dataset: number[];
}